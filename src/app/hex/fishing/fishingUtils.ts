import type { MapBiome } from '@/app/hex/architecture/typings';
import { publicAsset } from '@/lib/publicAsset';

export type FishSilhouette = 'thick' | 'basic' | 'lean';

export type FishWanderPhase = 'turn' | 'swim' | 'rest';

export type WaterFish = {
	id: string;
	baseIngId: string;
	silhouette: FishSilhouette;
	/** 0–1 relative to play area width */
	x: number;
	/** 0–1 relative to play area height */
	y: number;
	/** Current facing (radians); +x = 0, +y = down (screen space) */
	headingRad: number;
	/** Heading to lerp toward before the next swim spurt */
	wanderTargetRad: number;
	wanderPhase: FishWanderPhase;
	wanderPhaseElapsedMs: number;
	/** Total norm-space distance for this swim spurt */
	wanderBurstDistance: number;
	wanderBurstTraveled: number;
	wanderSwimDurationMs: number;
	wanderRestDurationMs: number;
	/** When true, position follows the hook bundle in stage 3 */
	hooked?: boolean;
};

export function shortestAngleDiffRad(from: number, to: number): number {
	let d = to - from;
	while (d > Math.PI) d -= 2 * Math.PI;
	while (d < -Math.PI) d += 2 * Math.PI;
	return d;
}

export function lerpAngleRad(from: number, to: number, t: number): number {
	return from + shortestAngleDiffRad(from, to) * t;
}

export const SILHOUETTE_SRC: Record<FishSilhouette, string> = {
	thick: publicAsset('/icons/fish/thickFish.svg'),
	basic: publicAsset('/icons/fish/basicFish.svg'),
	lean: publicAsset('/icons/fish/leanFish.svg'),
};

export function silhouetteForBaseInBiome(biome: MapBiome, baseIngId: string): FishSilhouette {
	const sorted = [...biome.nativeIngredients].sort((a, b) => b.weighting - a.weighting);
	const rank = sorted.findIndex((e) => e.ingredient.id === baseIngId);
	const n = sorted.length;
	if (n <= 0 || rank < 0) return 'thick';
	if (n === 1) return 'thick';
	if (n === 2) return rank === 0 ? 'thick' : 'lean';
	const t = rank / (n - 1);
	if (t <= 1 / 3) return 'thick';
	if (t <= 2 / 3) return 'basic';
	return 'lean';
}

export function rollNativeBaseId(biome: MapBiome): string {
	const total = biome.nativeIngredients.reduce((a, c) => a + c.weighting, 0);
	let roll = Math.random() * total;
	for (const entry of biome.nativeIngredients) {
		roll -= entry.weighting;
		if (roll < 0) return entry.ingredient.id;
	}
	return biome.nativeIngredients[0].ingredient.id;
}

export function spawnWaterFish(biome: MapBiome, count: number): WaterFish[] {
	return Array.from({ length: count }, (_, i) => {
		const baseIngId = rollNativeBaseId(biome);
		const headingRad = Math.random() * Math.PI * 2;
		return {
			id: `fish-${i}-${Math.random().toString(36).slice(2, 9)}`,
			baseIngId,
			silhouette: silhouetteForBaseInBiome(biome, baseIngId),
			x: 0.08 + Math.random() * 0.84,
			y: 0.1 + Math.random() * 0.65,
			headingRad,
			wanderTargetRad: headingRad,
			wanderPhase: 'rest',
			wanderPhaseElapsedMs: Math.random() * 400,
			wanderBurstDistance: 0.1,
			wanderBurstTraveled: 0,
			wanderSwimDurationMs: 600,
			wanderRestDurationMs: 300 + Math.random() * 400,
		};
	});
}

export function randomPointInCircle(cx: number, cy: number, radius: number): { x: number; y: number } {
	const a = Math.random() * Math.PI * 2;
	const r = Math.sqrt(Math.random()) * radius;
	return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
}

export function dist(ax: number, ay: number, bx: number, by: number): number {
	const dx = ax - bx;
	const dy = ay - by;
	return Math.hypot(dx, dy);
}

export function clamp(n: number, lo: number, hi: number): number {
	return Math.min(hi, Math.max(lo, n));
}
