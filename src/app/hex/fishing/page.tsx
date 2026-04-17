'use client';

import {
	Suspense,
	useCallback,
	useEffect,
	useLayoutEffect,
	useReducer,
	useRef,
	useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import Biomes from '@/app/hex/architecture/data/biomes';
import { IngredientBases } from '@/app/hex/architecture/data/ingredientBases';
import { CreateIngredient } from '@/app/hex/architecture/factories/ingredientFactory';
import PlayerStoreSlice from '@/store/features/playerSlice';
import ToastifyStore from '@/store/features/toastifySlice';
import { FishCaughtOverlay } from '@/app/hex/fishing/components/FishCaughtOverlay';
import { FishLostOverlay } from '@/app/hex/fishing/components/FishLostOverlay';
import { LineStrainIndicator } from '@/app/hex/fishing/components/LineStrainIndicator';
import { FishingFishSprites } from '@/app/hex/fishing/FishingFishSprites';
import { headingAwayFromGoalRad } from '@/app/hex/fishing/fishBehavior';
import {
	distanceNormToPx,
	type FishPullAnim,
	GOAL_ZONE_RADIUS_PX,
	REEL_BASE_PX_PER_SEC,
	runFishingRafFrame,
	type FishingRafContext,
	type NormPos,
} from '@/app/hex/fishing/fishingRafTick';
import { clamp, randomPointInCircle, spawnWaterFish, type WaterFish } from '@/app/hex/fishing/fishingUtils';
import './fishing.css';

type Stage = 0 | 1 | 2 | 3 | 4 | 5;

const GEAR = {
	accuracy: 35,
	attraction: 120,
		/** Placeholder; multiplied with REEL_BASE_PX_PER_SEC for px/s toward goal */
	reelSpeed: 1,
} as const;

function castRadiusPx(): number {
	return clamp(40, 150, 210 - GEAR.accuracy * 2.2);
}

function attractionPx(): number {
	return 72 + GEAR.attraction * 0.55;
}

function FishingContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const dispatch = useAppDispatch();
	const biomeKey = searchParams.get('biome');
	const biome =
		biomeKey && biomeKey in Biomes ? Biomes[biomeKey as keyof typeof Biomes] : null;

	const rootRef = useRef<HTMLDivElement>(null);
	const goalZoneRef = useRef<HTMLDivElement>(null);
	const goalRef = useRef<NormPos>({ x: 0.5, y: 0.85 });
	const stageRef = useRef<Stage>(0);
	const hookPosRef = useRef<NormPos | null>(null);
	const bundlePosRef = useRef<NormPos | null>(null);
	const fishesRef = useRef<WaterFish[]>([]);
	const biteLockRef = useRef(false);
	const fishPullRef = useRef<FishPullAnim | null>(null);
	const nextFishPullAtRef = useRef(0);
	const reelHeldRef = useRef(false);
	const catchLockRef = useRef(false);
	const activeCatchRef = useRef<{ fishId: string; baseIngId: string } | null>(null);

	const [, forceRender] = useReducer((n: number) => n + 1, 0);

	const [stage, setStage] = useState<Stage>(0);
	const [fishes, setFishes] = useState<WaterFish[]>([]);
	const [pointer, setPointer] = useState({ x: 0, y: 0 });
	const [hookPos, setHookPos] = useState<NormPos | null>(null);
	const [bundlePos, setBundlePos] = useState<NormPos | null>(null);
	const [activeCatch, setActiveCatch] = useState<{ fishId: string; baseIngId: string } | null>(
		null,
	);
	const strainRef = useRef(0);
	const [lastCaught, setLastCaught] = useState<{
		name: string;
		quality: number;
		image?: string;
		baseIngId: string;
	} | null>(null);

	useLayoutEffect(() => {
		stageRef.current = stage;
	}, [stage]);
	useLayoutEffect(() => {
		hookPosRef.current = hookPos;
	}, [hookPos]);
	useLayoutEffect(() => {
		bundlePosRef.current = bundlePos;
	}, [bundlePos]);
	useEffect(() => {
		fishesRef.current = fishes;
	}, [fishes]);
	useLayoutEffect(() => {
		activeCatchRef.current = activeCatch;
	}, [activeCatch]);

	useEffect(() => {
		if (!biomeKey || !(biomeKey in Biomes)) {
			router.replace('/hex/map');
		}
	}, [biomeKey, router]);

	useEffect(() => {
		if (!biome) return;
		const n = Math.floor(Math.random() * 8) + 3;
		const next = spawnWaterFish(biome, n);
		fishesRef.current = next;
		setFishes(next);
	}, [biome]);

	const updateGoal = useCallback(() => {
		const zone = goalZoneRef.current;
		const root = rootRef.current;
		if (!zone || !root) return;
		const zr = zone.getBoundingClientRect();
		const br = root.getBoundingClientRect();
		goalRef.current = {
			x: (zr.left + zr.width / 2 - br.left) / br.width,
			y: (zr.top + zr.height / 2 - br.top) / br.height,
		};
	}, []);

	useLayoutEffect(() => {
		updateGoal();
		window.addEventListener('resize', updateGoal);
		return () => window.removeEventListener('resize', updateGoal);
	}, [updateGoal]);

	const resetToCast = useCallback(() => {
		biteLockRef.current = false;
		catchLockRef.current = false;
		fishPullRef.current = null;
		nextFishPullAtRef.current = 0;
		reelHeldRef.current = false;
		setStage(1);
		setHookPos(null);
		setBundlePos(null);
		setActiveCatch(null);
		activeCatchRef.current = null;
		strainRef.current = 0;
	}, []);

	const failFight = useCallback(() => {
		const fid = activeCatchRef.current?.fishId;
		catchLockRef.current = false;
		fishPullRef.current = null;
		nextFishPullAtRef.current = 0;
		setFishes((prev) => {
			const n = fid ? prev.filter((f) => f.id !== fid) : prev;
			fishesRef.current = n;
			return n;
		});
		reelHeldRef.current = false;
		setStage(5);
		setHookPos(null);
		setBundlePos(null);
		setActiveCatch(null);
		activeCatchRef.current = null;
		strainRef.current = 0;
		biteLockRef.current = false;
	}, []);

	const completeCatch = useCallback(() => {
		if (stageRef.current !== 3) return;
		const ac = activeCatchRef.current;
		if (catchLockRef.current || !ac) return;
		catchLockRef.current = true;
		const base = IngredientBases[ac.baseIngId as keyof typeof IngredientBases];
		if (!base) {
			catchLockRef.current = false;
			return;
		}
		const ing = CreateIngredient(base);
		const fid = ac.fishId;
		setFishes((prev) => {
			const n = prev.filter((f) => f.id !== fid);
			fishesRef.current = n;
			return n;
		});
		dispatch(PlayerStoreSlice.actions.addGatheredIngredients({ ingredients: [ing] }));
		dispatch(
			ToastifyStore.actions.showToast({
				message: 'Gathered ' + base.name + ' (Quality: ' + ing.quality + '%)',
				...(base.image ? { imagePath: base.image } : {}),
			}),
		);
		setLastCaught({
			name: base.name,
			quality: ing.quality,
			image: base.image,
			baseIngId: ac.baseIngId,
		});
		reelHeldRef.current = false;
		setStage(4);
		setBundlePos(null);
		setActiveCatch(null);
		activeCatchRef.current = null;
		strainRef.current = 0;
		fishPullRef.current = null;
		nextFishPullAtRef.current = 0;
		biteLockRef.current = false;
		catchLockRef.current = false;
	}, [dispatch]);

	const completeCatchRef = useRef(completeCatch);
	completeCatchRef.current = completeCatch;

	const failFightRef = useRef(failFight);
	failFightRef.current = failFight;

	useEffect(() => {
		if (stage !== 2 || !hookPos) return;
		updateGoal();
		const root = rootRef.current;
		if (!root) return;
		const g = goalRef.current;
		const rect = root.getBoundingClientRect();
		if (distanceNormToPx(hookPos, g, rect) <= GOAL_ZONE_RADIUS_PX) {
			biteLockRef.current = false;
			reelHeldRef.current = false;
			setHookPos(null);
			setStage(1);
		}
	}, [stage, hookPos, updateGoal]);

	useEffect(() => {
		if (stage !== 3 || !bundlePos) return;
		updateGoal();
		const g = goalRef.current;
		const root = rootRef.current;
		if (!g || !root || catchLockRef.current) return;
		const rect = root.getBoundingClientRect();
		if (distanceNormToPx(bundlePos, g, rect) <= GOAL_ZONE_RADIUS_PX) {
			completeCatch();
		}
		const m = 0.05;
		if (
			bundlePos.x < -m ||
			bundlePos.x > 1 + m ||
			bundlePos.y < -m ||
			bundlePos.y > 1 + m
		) {
			failFight();
		}
	}, [stage, bundlePos, completeCatch, failFight, updateGoal]);

	const handleBite = useCallback((fish: WaterFish) => {
		const hook = hookPosRef.current;
		if (!hook) return;
		updateGoal();
		const g = goalRef.current;
		const biteHeading = headingAwayFromGoalRad(hook, g);
		setFishes((prev) => {
			const next = prev.map((f) =>
				f.id === fish.id
					? { ...f, hooked: true, x: hook.x, y: hook.y, headingRad: biteHeading }
					: f,
			);
			fishesRef.current = next;
			return next;
		});
		const caught = { fishId: fish.id, baseIngId: fish.baseIngId };
		setActiveCatch(caught);
		activeCatchRef.current = caught;
		const b = { ...hook };
		setBundlePos(b);
		bundlePosRef.current = b;
		fishPullRef.current = null;
		nextFishPullAtRef.current = performance.now() + 1000 + Math.random() * 1000;
		setHookPos(null);
		setStage(3);
		strainRef.current = 0;
	}, [updateGoal]);

	useEffect(() => {
		let raf = 0;
		let last = performance.now();
		const attractR = attractionPx();

		const rafCtx: FishingRafContext = {
			bundlePosRef,
			hookPosRef,
			fishesRef,
			fishPullRef,
			nextFishPullAtRef,
			reelHeldRef,
			biteLockRef,
			activeCatchRef,
			goalRef,
			updateGoal,
			setBundlePos,
			setHookPos,
			strainRef,
			failFightRef,
			completeCatchRef,
			handleBite,
			reelPxPerSec: REEL_BASE_PX_PER_SEC * GEAR.reelSpeed,
		};

		const tick = (now: number) => {
			const dt = Math.min(48, now - last);
			last = now;
			const root = rootRef.current;
			const rect = root?.getBoundingClientRect();
			const st = stageRef.current;

			if (rect && root && biome && st !== 4 && st !== 5) {
				runFishingRafFrame(rafCtx, { st, dt, rect, attractR });
				forceRender();
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [biome, handleBite, updateGoal]);

	const onCastPointerDown = useCallback(
		(e: React.PointerEvent) => {
			if (stage !== 1) return;
			const t = e.target as HTMLElement;
			if (t.closest('button')) return;
			const root = rootRef.current;
			if (!root) return;
			const br = root.getBoundingClientRect();
			const r = castRadiusPx();
			const pt = randomPointInCircle(e.clientX, e.clientY, r);
			const nx = clamp((pt.x - br.left) / br.width, 0.02, 0.98);
			const ny = clamp((pt.y - br.top) / br.height, 0.02, 0.98);
			setHookPos({ x: nx, y: ny });
			setStage(2);
			updateGoal();
		},
		[stage, updateGoal],
	);

	const onReelPointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.currentTarget.setPointerCapture(e.pointerId);
		reelHeldRef.current = true;
	}, []);

	const onReelPointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
		if (e.currentTarget.hasPointerCapture(e.pointerId)) {
			e.currentTarget.releasePointerCapture(e.pointerId);
		}
		reelHeldRef.current = false;
	}, []);

	const onStartTools = () => {
		reelHeldRef.current = false;
		setStage(1);
		updateGoal();
	};

	const onCancelTools = () => router.push('/hex/map');

	const onContinueFishing = () => {
		setLastCaught(null);
		catchLockRef.current = false;
		resetToCast();
	};

	const onContinueAfterGotAway = () => {
		catchLockRef.current = false;
		resetToCast();
	};

	const ringR = castRadiusPx();

	if (!biome) {
		return null;
	}

	const hookOrBundle = bundlePos ?? hookPos;
	const showReel = stage === 2 || stage === 3;
	const castClass = stage === 1 ? ' fishing-root--casting' : '';

	return (
		<div
			ref={rootRef}
			className={'fishing-root' + castClass}
			onPointerDown={onCastPointerDown}
			onPointerMove={(e) => {
				if (stage === 1) setPointer({ x: e.clientX, y: e.clientY });
			}}
		>
			<FishingFishSprites fishes={fishes} bundlePos={bundlePos} />

			{hookOrBundle && (
				<img
					className="fishing-hook"
					src="/icons/itemTypes/hook.svg"
					alt=""
					draggable={false}
					style={{
						left: `${hookOrBundle.x * 100}%`,
						top: `${hookOrBundle.y * 100}%`,
					}}
				/>
			)}

			<div ref={goalZoneRef} className="fishing-goal-zone" aria-hidden />
			<div className="fishing-rod" aria-hidden />

			{stage === 1 && (
				<div
					className="fishing-cast-ring"
					style={{
						width: ringR * 2,
						height: ringR * 2,
						left: pointer.x,
						top: pointer.y,
					}}
				/>
			)}

			{stage === 0 && (
				<div className="fishing-tools-panel">
					<h2>Select your tools</h2>
					<ul className="fishing-tools-list">
						<li>Basic Rod</li>
						<li>Basic Lure / Bait</li>
						<li>Basic Line</li>
						<li>Basic Bobber</li>
					</ul>
					<div className="fishing-tools-actions">
						<button type="button" onClick={onCancelTools}>
							Cancel
						</button>
						<button type="button" className="fishing-btn-primary" onClick={onStartTools}>
							Start
						</button>
					</div>
				</div>
			)}

			<button type="button" className="fishing-end-btn" onClick={() => router.push('/hex/map')}>End</button>

			{showReel && (
				<div className="fishing-reel-wrap">
					<button
						type="button"
						className="fishing-reel-btn"
						onPointerDown={onReelPointerDown}
						onPointerUp={onReelPointerUp}
						onPointerCancel={onReelPointerUp}
						onLostPointerCapture={() => {
							reelHeldRef.current = false;
						}}
									>
						Reel
					</button>
				</div>
			)}

			{stage === 3 && <LineStrainIndicator strain={strainRef.current} />}

			{stage === 4 && lastCaught && (
				<FishCaughtOverlay
					name={lastCaught.name}
					quality={lastCaught.quality}
					image={lastCaught.image}
					canContinueFishing={fishes.length > 0}
					onContinueFishing={onContinueFishing}
					onEndToMap={() => router.push('/hex/map')}
				/>
			)}

			{stage === 5 && (
				<FishLostOverlay
					canContinueFishing={fishes.length > 0}
					onContinueFishing={onContinueAfterGotAway}
					onEndToMap={() => router.push('/hex/map')}
				/>
			)}
		</div>
	);
}

export default function FishingPage() {
	return (
		<Suspense fallback={<div className="fishing-root" />}>
			<FishingContent />
		</Suspense>
	);
}
