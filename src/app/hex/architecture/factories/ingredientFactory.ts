import { COMPONENT_SHAPE_VALUES, SHAPE_NAME } from '@/app/hex/architecture/enums';
import { GenerateTempId } from '@/app/hex/architecture/helpers/alchHelpers';
import type { AlchComponent, Ingredient, IngredientBase, IngredientCompSpec } from '@/app/hex/architecture/typings';

/**
 * Sets the quality breakpoints for node and link generation.
 * Index corresponds to ingTier.
 */ 
const ING_TIER_QUALITY_MODIFIERS = [
	{ minQualityEffect: 0, maxQualityEffect: 50 },
	{ minQualityEffect: 10, maxQualityEffect: 60 },
	{ minQualityEffect: 20, maxQualityEffect: 70 },
	{ minQualityEffect: 30, maxQualityEffect: 80 },
	{ minQualityEffect: 40, maxQualityEffect: 90 },
	{ minQualityEffect: 50, maxQualityEffect: 100 }
];

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

function GenerateShape(ingBase: IngredientBase, compSpec: IngredientCompSpec, quality: number): SHAPE_NAME|undefined {
	const tierModifier = ING_TIER_QUALITY_MODIFIERS[ingBase.ingTier];
	// order SHAPE_NAME by number of nodes
	const orderedShapes:Array<SHAPE_NAME> = Object.values(SHAPE_NAME).sort((a, b) => {
		return Object.values(COMPONENT_SHAPE_VALUES[a]).reduce((acc, curr) => acc + curr, 0) - Object.values(COMPONENT_SHAPE_VALUES[b]).reduce((acc, curr) => acc + curr, 0);
	}).reduce((acc, shape) => {
		if(compSpec.possibleShapes.includes(shape)) {
			return [...acc, shape];
		}
		return acc;
	}, [] as Array<SHAPE_NAME>);

	const maxNodesPossible = Object.values(COMPONENT_SHAPE_VALUES[orderedShapes[orderedShapes.length - 1]]).reduce((acc, curr) => acc + curr, 0);
	let shapesOfCorrectSizeToUse:Array<SHAPE_NAME> = [];
	if(quality < tierModifier.minQualityEffect) {
		shapesOfCorrectSizeToUse = orderedShapes.filter(shape => Object.values(COMPONENT_SHAPE_VALUES[shape]).reduce((acc, curr) => acc + curr, 0) <= 1);
	} else if(quality > tierModifier.maxQualityEffect) {
		shapesOfCorrectSizeToUse = orderedShapes.filter(shape => Object.values(COMPONENT_SHAPE_VALUES[shape]).reduce((acc, curr) => acc + curr, 0) == 7);
	} else {
		// [tierModifier.minQualityEffect to tierModifier.maxQualityEffect]
		// split into n ranges where n is maxNodesPossible
		// each range is [tierModifier.minQualityEffect + (i * (tierModifier.maxQualityEffect - tierModifier.minQualityEffect) / maxNodesPossible) to tierModifier.minQualityEffect + ((i + 1) * (tierModifier.maxQualityEffect - tierModifier.minQualityEffect) / maxNodesPossible)]
		// if quality is in a range, add the shapes in that range to shapesOfCorrectSizeToUse
		for(let i = 0; i < maxNodesPossible; i++) {
			const rangeStart = tierModifier.minQualityEffect + (i * (tierModifier.maxQualityEffect - tierModifier.minQualityEffect) / maxNodesPossible);
			const rangeEnd = tierModifier.minQualityEffect + ((i + 1) * (tierModifier.maxQualityEffect - tierModifier.minQualityEffect) / maxNodesPossible);
			if(quality >= rangeStart && quality <= rangeEnd) {
				shapesOfCorrectSizeToUse = orderedShapes.filter(shape => Object.values(COMPONENT_SHAPE_VALUES[shape]).reduce((acc, curr) => acc + curr, 0) == i+1);
				break;
			}
		}
	}

	if(shapesOfCorrectSizeToUse.length === 1) {
		return shapesOfCorrectSizeToUse[0];
	} else {
		return shapesOfCorrectSizeToUse[Math.floor(Math.random() * (shapesOfCorrectSizeToUse.length-1))];
	}
}

function GenerateLinkSpots(shapeName: SHAPE_NAME, quality: number): number[]|undefined {
	let linkSpots:number[] = [];
	const nodes = Object.values(COMPONENT_SHAPE_VALUES[shapeName]).reduce((acc, curr) => acc + curr, 0);
	// return a [] of 1 or 0 where 1 represents a link, but only if the shape has a link spot
	const shape = Object.values(COMPONENT_SHAPE_VALUES[shapeName]);
	let linkCount = 0;
	for(let i = 0; i < shape.length; i++) {
		let rolledPercentChanceToLink = Math.min(0.99, (Math.random() + (quality/(nodes*100))));
		linkSpots[i] = Math.floor(rolledPercentChanceToLink * 2);
		linkCount += linkSpots[i];
		if(linkCount >= nodes || linkCount >= Math.floor(quality / 14.3)) {
			break;
		}
	}
	return Object.values(COMPONENT_SHAPE_VALUES[shapeName]).map((a, i) => a & linkSpots[i]);
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
				const shapeName = GenerateShape(ingBase, compSpec, newIng.quality) ?? compSpec.possibleShapes[0];
				newComp = {
					id: GenerateTempId(),
					element: compSpec.element,
					shape: shapeName,
					linkSpots: GenerateLinkSpots(shapeName, newIng.quality) ?? undefined,
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
