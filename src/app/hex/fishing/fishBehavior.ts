import { dist, lerpAngleRad, shortestAngleDiffRad, type WaterFish } from '@/app/hex/fishing/fishingUtils';

export type FishNormPos = { x: number; y: number };

export const FISH_EDGE_MARGIN_PX = 100;
export const FISH_BOTTOM_ZONE_FRACTION = 0.2;

const FISH_TURN_RATE_RAD_PER_SEC = 6.5;
const FISH_TURN_MS_FALLBACK = 900;
const FISH_SWIM_MS_MIN = 520;
const FISH_SWIM_MS_MAX = 1050;
const FISH_REST_MS_MIN = 260;
const FISH_REST_MS_MAX = 780;
const FISH_BURST_DIST_MIN = 0.09;
const FISH_BURST_DIST_MAX = 0.24;

/** Hook–fish proximity in px for automatic bite (stage 2). */
export const BITE_PROXIMITY_PX = 38;

function interruptFishWanderForBounce(fish: WaterFish): void {
	fish.wanderPhase = 'turn';
	fish.wanderPhaseElapsedMs = 0;
	fish.wanderTargetRad = Math.random() * Math.PI * 2;
	fish.wanderBurstTraveled = 0;
}

export function bounceFishWanderBounds(fish: WaterFish, rect: DOMRect): void {
	const w = rect.width;
	const h = rect.height;
	const M = FISH_EDGE_MARGIN_PX;
	const bottomTurnY = Math.min(1 - FISH_BOTTOM_ZONE_FRACTION, 1 - M / h);

	const fx = fish.x * w;
	const fy = fish.y * h;

	let bounced = false;
	if (fx < M) {
		fish.x = M / w;
		bounced = true;
	} else if (fx > w - M) {
		fish.x = (w - M) / w;
		bounced = true;
	}

	if (fy < M) {
		fish.y = M / h;
		bounced = true;
	} else if (fish.y > bottomTurnY) {
		fish.y = Math.min(fish.y, bottomTurnY - 1e-6);
		bounced = true;
	}

	if (bounced) {
		interruptFishWanderForBounce(fish);
	}
}

export function stepFishWander(fish: WaterFish, dt: number): void {
	fish.wanderPhaseElapsedMs += dt;
	if (fish.wanderPhase === 'rest') {
		if (fish.wanderPhaseElapsedMs >= fish.wanderRestDurationMs) {
			fish.wanderPhase = 'turn';
			fish.wanderPhaseElapsedMs = 0;
			fish.wanderTargetRad = Math.random() * Math.PI * 2;
			fish.wanderBurstDistance =
				FISH_BURST_DIST_MIN + Math.random() * (FISH_BURST_DIST_MAX - FISH_BURST_DIST_MIN);
			fish.wanderBurstTraveled = 0;
			fish.wanderSwimDurationMs =
				FISH_SWIM_MS_MIN + Math.random() * (FISH_SWIM_MS_MAX - FISH_SWIM_MS_MIN);
		}
		return;
	}
	if (fish.wanderPhase === 'turn') {
		const diff = Math.abs(shortestAngleDiffRad(fish.headingRad, fish.wanderTargetRad));
		const stepT = Math.min(
			1,
			((FISH_TURN_RATE_RAD_PER_SEC * dt) / 1000) / Math.max(diff, 0.015),
		);
		fish.headingRad = lerpAngleRad(fish.headingRad, fish.wanderTargetRad, stepT);
		if (diff < 0.055 || fish.wanderPhaseElapsedMs > FISH_TURN_MS_FALLBACK) {
			fish.headingRad = fish.wanderTargetRad;
			fish.wanderPhase = 'swim';
			fish.wanderPhaseElapsedMs = 0;
			fish.wanderBurstTraveled = 0;
		}
		return;
	}
	const move = fish.wanderBurstDistance * (dt / Math.max(1, fish.wanderSwimDurationMs));
	fish.x += Math.cos(fish.headingRad) * move;
	fish.y += Math.sin(fish.headingRad) * move;
	fish.wanderBurstTraveled += move;
	if (
		fish.wanderBurstTraveled >= fish.wanderBurstDistance ||
		fish.wanderPhaseElapsedMs >= fish.wanderSwimDurationMs
	) {
		fish.wanderPhase = 'rest';
		fish.wanderPhaseElapsedMs = 0;
		fish.wanderRestDurationMs =
			FISH_REST_MS_MIN + Math.random() * (FISH_REST_MS_MAX - FISH_REST_MS_MIN);
	}
}

/** Heading (radians) from goal toward fish — fish faces away from rod/goal */
export function headingAwayFromGoalRad(fish: FishNormPos, goal: FishNormPos): number {
	const dx = fish.x - goal.x;
	const dy = fish.y - goal.y;
	if (Math.hypot(dx, dy) < 1e-8) return 0;
	return Math.atan2(dy, dx);
}

export type FishSimStage = 0 | 1 | 2 | 3;

/**
 * Wander, hook attraction, and bounds for all unhooked fish (stages 0–3).
 * Mutates fish in `fishList` (same ref the game loop uses).
 */
export function tickUnhookedFishForFrame(options: {
	stage: FishSimStage;
	fishList: WaterFish[];
	rect: DOMRect;
	dt: number;
	hook: FishNormPos | null;
	attractR: number;
}): void {
	const { stage, fishList, rect, dt, hook, attractR } = options;
	for (const fish of fishList) {
		if (fish.hooked) continue;

		if (stage === 2 && hook) {
			const fx = fish.x * rect.width;
			const fy = fish.y * rect.height;
			const hx = hook.x * rect.width;
			const hy = hook.y * rect.height;
			const d = dist(fx, fy, hx, hy);
			if (d < attractR) {
				const k = 0.09 * (dt / 16);
				fish.x += (hook.x - fish.x) * k * 0.12;
				fish.y += (hook.y - fish.y) * k * 0.12;
				bounceFishWanderBounds(fish, rect);
				continue;
			}
		}

		stepFishWander(fish, dt);
		bounceFishWanderBounds(fish, rect);
	}
}

/**
 * First fish within `BITE_PROXIMITY_PX` of the hook schedules `queueBite` and sets the lock.
 */
export function tryBiteFishNearHook(options: {
	fishList: WaterFish[];
	rect: DOMRect;
	hook: FishNormPos;
	biteLockRef: { current: boolean };
	queueBite: (fish: WaterFish) => void;
	biteRadiusPx?: number;
}): void {
	const { fishList, rect, hook, biteLockRef, queueBite } = options;
	const biteRadiusPx = options.biteRadiusPx ?? BITE_PROXIMITY_PX;
	if (biteLockRef.current) return;
	const hx = hook.x * rect.width;
	const hy = hook.y * rect.height;
	for (const fish of fishList) {
		if (fish.hooked) continue;
		const fx = fish.x * rect.width;
		const fy = fish.y * rect.height;
		if (dist(fx, fy, hx, hy) < biteRadiusPx) {
			biteLockRef.current = true;
			queueBite({ ...fish });
			break;
		}
	}
}
