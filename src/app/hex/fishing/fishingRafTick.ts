import type { MutableRefObject } from 'react';
import {
	BITE_PROXIMITY_PX,
	headingAwayFromGoalRad,
	tickUnhookedFishForFrame,
	tryBiteFishNearHook,
	type FishNormPos,
	type FishSimStage,
} from '@/app/hex/fishing/fishBehavior';
import type { WaterFish } from '@/app/hex/fishing/fishingUtils';

export type NormPos = FishNormPos;

export const GOAL_ZONE_DIAMETER_PX = 300;
export const GOAL_ZONE_RADIUS_PX = GOAL_ZONE_DIAMETER_PX / 2;

export const REEL_BASE_PX_PER_SEC = 80;
/** Strain per second while holding reel during an active fish pull */
const STRAIN_REEL_VS_PULL_PER_SEC = 60;
/** Strain per second when not building (decay only). */
const STRAIN_DECAY_PER_SEC = 10;

function computeNextStrain(prev: number, dt: number, strainFromReelVsPull: boolean): number {
	const sec = dt / 1000;
	let next = prev;
	if (strainFromReelVsPull) {
		next = Math.min(100, next + STRAIN_REEL_VS_PULL_PER_SEC * sec);
	} else {
		next = Math.max(0, prev - STRAIN_DECAY_PER_SEC * sec);
	}
	return next;
}

export function distanceNormToPx(a: NormPos, b: NormPos, rect: DOMRect): number {
	const dx = (a.x - b.x) * rect.width;
	const dy = (a.y - b.y) * rect.height;
	return Math.hypot(dx, dy);
}

export function moveTowardGoalPx(
	pos: NormPos,
	goal: NormPos,
	rect: DOMRect,
	movePx: number,
): NormPos | null {
	const px = pos.x * rect.width;
	const py = pos.y * rect.height;
	const gx = goal.x * rect.width;
	const gy = goal.y * rect.height;
	const dx = gx - px;
	const dy = gy - py;
	const len = Math.hypot(dx, dy);
	if (len < 1e-4) return null;
	const m = Math.min(movePx, len);
	return {
		x: (px + (dx / len) * m) / rect.width,
		y: (py + (dy / len) * m) / rect.height,
	};
}

export type FishPullAnim = {
	from: NormPos;
	to: NormPos;
	progress: number;
	durationMs: number;
};

export type FishingRafStage = 0 | 1 | 2 | 3 | 4 | 5;

export type FishingRafContext = {
	bundlePosRef: MutableRefObject<NormPos | null>;
	hookPosRef: MutableRefObject<NormPos | null>;
	fishesRef: MutableRefObject<WaterFish[]>;
	fishPullRef: MutableRefObject<FishPullAnim | null>;
	nextFishPullAtRef: MutableRefObject<number>;
	reelHeldRef: MutableRefObject<boolean>;
	biteLockRef: MutableRefObject<boolean>;
	activeCatchRef: MutableRefObject<{ fishId: string; baseIngId: string } | null>;
	goalRef: MutableRefObject<NormPos>;
	updateGoal: () => void;
	setBundlePos: (p: NormPos) => void;
	setHookPos: (p: NormPos) => void;
	/** Updated synchronously each fight frame; UI reads this + forceRender so the bar tracks during gestures. */
	strainRef: MutableRefObject<number>;
	failFightRef: MutableRefObject<(() => void) | undefined>;
	completeCatchRef: MutableRefObject<(() => void) | undefined>;
	handleBite: (fish: WaterFish) => void;
	reelPxPerSec: number;
};

function syncHookedFishXY(
	fishesRef: MutableRefObject<WaterFish[]>,
	fishId: string | undefined,
	x: number,
	y: number,
): void {
	if (!fishId) return;
	for (const f of fishesRef.current) {
		if (f.id === fishId) {
			f.x = x;
			f.y = y;
			break;
		}
	}
}

function applyHookedFishHeading(
	fishesRef: MutableRefObject<WaterFish[]>,
	fishId: string | undefined,
	headingRad: number,
): void {
	if (!fishId) return;
	for (const f of fishesRef.current) {
		if (f.id === fishId) {
			f.headingRad = headingRad;
			break;
		}
	}
}

function tickStage3Fight(ctx: FishingRafContext, dt: number, rect: DOMRect): void {
	const time = performance.now();
	const g0 = ctx.goalRef.current;
	const bundle = ctx.bundlePosRef.current;
	const reeling = ctx.reelHeldRef.current;
	const pull = ctx.fishPullRef.current;
	let strainFromReelVsPull = false;

	ctx.updateGoal();

	if (bundle && g0) {
		if (pull) {
			const p = pull;
			const reelVsPull = reeling;
			if (reelVsPull) strainFromReelVsPull = true;
			p.progress += dt / p.durationMs;
			const t = Math.min(1, p.progress);
			if(!reelVsPull) {
				const e = t * t * (3 - 2 * t);
				const nx = p.from.x + (p.to.x - p.from.x) * e;
				const ny = p.from.y + (p.to.y - p.from.y) * e;
				ctx.bundlePosRef.current = { x: nx, y: ny };
				ctx.setBundlePos({ x: nx, y: ny });
				syncHookedFishXY(ctx.fishesRef, ctx.activeCatchRef.current?.fishId, nx, ny);
			}
			if (t >= 1) {
				ctx.fishPullRef.current = null;
				ctx.nextFishPullAtRef.current = time + 1400 + Math.random() * 1400;
			}
		} else {
			if (reeling) {
				const movePx = ctx.reelPxPerSec * (dt / 1000);
				const cur = ctx.bundlePosRef.current;
				if (cur) {
					const next = moveTowardGoalPx(cur, g0, rect, movePx);
					if (next) {
						ctx.bundlePosRef.current = next;
						ctx.setBundlePos(next);
						syncHookedFishXY(ctx.fishesRef, ctx.activeCatchRef.current?.fishId, next.x, next.y);
						if (distanceNormToPx(next, g0, rect) <= GOAL_ZONE_RADIUS_PX) {
							ctx.completeCatchRef.current?.();
						}
					}
				}
			}
			if (!ctx.fishPullRef.current && time >= ctx.nextFishPullAtRef.current) {
				const bNow = ctx.bundlePosRef.current;
				if (bNow) {
					const dx = bNow.x - g0.x;
					const dy = bNow.y - g0.y;
					const len = Math.hypot(dx, dy) || 1;
					const pullDist = 0.1;
					ctx.fishPullRef.current = {
						from: { ...bNow },
						to: {
							x: bNow.x + (dx / len) * pullDist,
							y: bNow.y + (dy / len) * pullDist,
						},
						progress: 0,
						durationMs: 1000 + Math.random() * 140,
					};
				}
			}
		}
	}

	const prevStrain = ctx.strainRef.current;
	const nextStrain = computeNextStrain(prevStrain, dt, strainFromReelVsPull);
	ctx.strainRef.current = nextStrain;
	if (prevStrain < 100 && nextStrain >= 100) {
		queueMicrotask(() => ctx.failFightRef.current?.());
	}

	ctx.updateGoal();
	const gHook = ctx.goalRef.current;
	const bHook = ctx.bundlePosRef.current;
	if (gHook && bHook) {
		applyHookedFishHeading(
			ctx.fishesRef,
			ctx.activeCatchRef.current?.fishId,
			headingAwayFromGoalRad(bHook, gHook),
		);
	}
}

function tickFishSchoolAndBites(
	ctx: FishingRafContext,
	st: FishSimStage,
	dt: number,
	rect: DOMRect,
	attractR: number,
): void {
	const hook = ctx.hookPosRef.current;
	const fishList = ctx.fishesRef.current;
	tickUnhookedFishForFrame({
		stage: st,
		fishList,
		rect,
		dt,
		hook,
		attractR,
	});
	if (st === 2 && hook) {
		tryBiteFishNearHook({
			fishList,
			rect,
			hook,
			biteLockRef: ctx.biteLockRef,
			biteRadiusPx: BITE_PROXIMITY_PX,
			queueBite: (f) => queueMicrotask(() => ctx.handleBite(f)),
		});
	}
}

function tickStage2ReelHook(ctx: FishingRafContext, rect: DOMRect, dt: number): void {
	if (!ctx.reelHeldRef.current) return;
	ctx.updateGoal();
	const gR = ctx.goalRef.current;
	const hR = ctx.hookPosRef.current;
	if (!gR || !hR) return;
	const movePx = ctx.reelPxPerSec * (dt / 1000);
	const nextH = moveTowardGoalPx(hR, gR, rect, movePx);
	if (nextH) {
		ctx.hookPosRef.current = nextH;
		ctx.setHookPos(nextH);
	}
}

export function runFishingRafFrame(
	ctx: FishingRafContext,
	params: { st: FishingRafStage; dt: number; rect: DOMRect; attractR: number },
): void {
	const { st, dt, rect, attractR } = params;
	if (st === 3) {
		tickStage3Fight(ctx, dt, rect);
	}
	if (st === 0 || st === 1 || st === 2 || st === 3) {
		tickFishSchoolAndBites(ctx, st, dt, rect, attractR);
	}
	if (st === 2) {
		tickStage2ReelHook(ctx, rect, dt);
	}
}
