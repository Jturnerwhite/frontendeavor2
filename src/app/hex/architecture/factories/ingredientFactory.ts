import { COMPONENT_SHAPE_VALUES } from '@/app/hex/architecture/enums';
import { GenerateTempId } from '@/app/hex/architecture/helpers/alchHelpers';
import type { AlchComponent, Ingredient, IngredientBase } from '@/app/hex/architecture/typings';

/** Standard normal N(0, 1) via Box–Muller. */
function randn(): number {
	let u = 0;
	let v = 0;
	while (u === 0) u = Math.random();
	while (v === 0) v = Math.random();
	return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Random integer in [0, 100] drawn from a bell-shaped (normal) distribution, then clamped.
 *
 * @param bellMean — Where the peak of the bell sits (0–100). Most draws cluster near this value.
 * @param bellSteepness — How sharp the peak is: **larger = steeper / narrower** (smaller spread).
 *   Rough guide: ~8–15 for a wide spread, ~15–30 for a tight cluster around the mean.
 *   With `bellMean` ≈ 20 and `bellSteepness` ≈ 12–18, values near 100 are extremely unlikely.
 */
export function randomBell0to100(bellMean: number, bellSteepness: number): number {
	const mean = Math.min(100, Math.max(0, bellMean));
	const steep = Math.max(bellSteepness, 0.01);
	const sigma = 100 / steep;
	const x = mean + sigma * randn();
	return Math.min(100, Math.max(0, Math.round(x)));
}

function GenerateQuality(): number {
	return randomBell0to100(20, 14);
}

export function CreateIngredient(ingBase: IngredientBase): Ingredient {
	const newIng = {
		id: GenerateTempId(),
		baseIngId: ingBase.id,
		quality: 1,
		comps: [],
	} as Ingredient;
	ingBase.possibleComps.forEach((compSpec, index) => {
		let newComp = null as AlchComponent | null;
		newIng.quality = GenerateQuality();

		if ('possibleShapes' in compSpec) {
			if (
				compSpec.chance == undefined ||
				compSpec.chance > 0 ||
				Math.random() * 100 <= compSpec.chance
			) {
				const shapeIndex = Math.floor(Math.random() * compSpec.possibleShapes.length);
				newComp = {
					id: GenerateTempId(),
					element: compSpec.element,
					shape: compSpec.possibleShapes[shapeIndex],
					linkSpots: compSpec.linkSpots
						? Object.values(COMPONENT_SHAPE_VALUES[compSpec.possibleShapes[shapeIndex]]).map(
								(a, i) => a & compSpec.linkSpots![i],
							)
						: undefined,
					sourceIngredientId: newIng.id,
					ingredientIndex: index,
				};
				newIng.comps.push(newComp);
			}
		} else {
			newComp = {
				element: compSpec.element,
				shape: compSpec.shape,
				linkSpots: compSpec.linkSpots ? compSpec.linkSpots.slice() : undefined,
				sourceIngredientId: newIng.id,
				ingredientIndex: index,
			};
			newIng.comps.push(newComp);
		}
	});

	return newIng;
}
