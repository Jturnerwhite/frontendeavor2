import { COMPONENT_SHAPE_VALUES, SHAPE_NAME } from '@/app/hex/architecture/enums';
import { GenerateTempId } from '@/app/hex/architecture/helpers/alchHelpers';
import type { AlchComponent, Ingredient, IngredientAspectSpec, IngredientBase, IngredientCompSpec, Item, ItemAspect } from '@/app/hex/architecture/typings';
import { GetItemsByWeight } from '@/app/hex/architecture/helpers/miscUtils';
import { ASPECT_CATEGORY, AspectCategoryWeightModifiers, BaseIngredientAspects, BASE_ASPECT_WEIGHTING } from '@/app/hex/architecture/data/itemAspects';

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

function GenerateQualityWithTool(toolUsed: Item|undefined): number {
	if(toolUsed !== undefined) {
		let qualityModifier = (toolUsed.aspects.find(aspect => aspect.category === ASPECT_CATEGORY.GATHER_QUALITY)?.value ?? 0) as number;
		qualityModifier += (toolUsed.innateAspects.find(aspect => aspect.category === ASPECT_CATEGORY.GATHER_QUALITY)?.value ?? 0) as number;
		return randomBell0to100(20 * qualityModifier, 14);
	}

	return randomBell0to100(20, 14);
}
/**
 * Currently deprecated but kept for reference
 * @deprecated
 */
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

/**
 * Generates a size rating for the ingredient based on the quality.
 * Sizes range between 0 and 4, where 0 is the smallest and 4 is the largest.
 * 0 = "Extra tiny"
 * 1 = "Small"
 * 2 = "Medium"
 * 3 = "Large"
 * 4 = "Extra large"
 * 1 to 3 is most common. 0 and 4 should be considered very rare.
 * Other factors will affect size later, but for now just quality is used.
 * @param ingBase - The ingredient base.
 * @param quality - The quality of the ingredient.
 * @returns The size rating.
 */
export function GenerateSizeRating(ingBase: IngredientBase, quality: number): number {
	const tierModifier = ING_TIER_QUALITY_MODIFIERS[ingBase.ingTier];
	// Roll a new number for size
	const sizeNumber = randomBell0to100(20, 14);
	if(quality <= 1) {
		return 0;
	} else if(quality == 100) {
		return 4;
	} else {
		// split the range of quality between min and max into 3 equal parts
		// use the quality tier modifiers for these for now
		const thresholdForMid = tierModifier.minQualityEffect + ((tierModifier.maxQualityEffect - tierModifier.minQualityEffect) / 3);
		const thresholdForHigh = tierModifier.minQualityEffect + ((tierModifier.maxQualityEffect - tierModifier.minQualityEffect) / 3) * 2;
		if(sizeNumber < thresholdForMid) {
			return 0;
		} else if(sizeNumber < thresholdForHigh) {
			return 1;
		} else {
			return 2;
		}
	}
}

function GetAspectPools(ingBase: IngredientBase): Array<ItemAspect> {
	let aspectPools = [...Object.values(BaseIngredientAspects)];
	if(ingBase.additionalAspectPools) {
		aspectPools = [...aspectPools, ...ingBase.additionalAspectPools.reduce((acc, curr) => {
			return [...acc, ...Object.values(curr)];
		}, [] as Array<ItemAspect>)];
	}
	return aspectPools.map(aspect => {
		return {
			...aspect,
			weighting: aspect.weighting * (AspectCategoryWeightModifiers[aspect.category as ASPECT_CATEGORY] ?? 10),
		} as ItemAspect;
	});
}

function GenerateAspects(ingBase: IngredientBase, toolUsed: Item|undefined): Array<ItemAspect> {
	// The pool of all aspects ingredients are allowed to pull from
	const aspectPool = GetAspectPools(ingBase);

	// Roll 1-100, to get a number of aspects to generate
	const numberOfAspects = Math.min(4, Math.floor(randomBell0to100(20, 14) / 20));
	let aspectWeightingModifier = toolUsed !== undefined ? (toolUsed.aspects.find(aspect => aspect.category === ASPECT_CATEGORY.GATHER_ASPECT)?.value ?? 0) as number : 0;
	aspectWeightingModifier = 100;

	const weightAdjustedAspects = aspectPool.map(aspect => {
		let newWeighting = aspect.weighting;
		// Makes rarer aspects more common, and more common aspects rarer
		if(aspect.weighting > BASE_ASPECT_WEIGHTING) {
			newWeighting = aspect.weighting * (1 + (aspectWeightingModifier / 100));
		} else if(aspect.weighting <= BASE_ASPECT_WEIGHTING) {
			newWeighting = aspect.weighting * (1 - (aspectWeightingModifier / 100));
		}

		return {
			...aspect,
			weighting: newWeighting,
		} as ItemAspect;
	});

	const aspects: Array<ItemAspect> = [];
	GetItemsByWeight<ItemAspect>(weightAdjustedAspects, 'weighting', 'id', numberOfAspects, true).forEach(aspect => {
		aspects.push(aspect);
	});

	return aspects;
}

function GenerateSaleValue(ingredient: Ingredient, baseIngredient: IngredientBase): number {
	let output = ingredient.saleValue;
	output *= ((baseIngredient.ingTier + 1) * ((ingredient.quality / 15) + 1));
	output = Math.floor(output);

	return output;
}

export function CreateIngredient(ingBase: IngredientBase, toolUsed: Item|undefined): Ingredient {
	const newIng = {
		id: GenerateTempId(),
		baseIngId: ingBase.id,
		quality: GenerateQualityWithTool(toolUsed),
		saleValue: ingBase.baseSaleValue ?? 1,
		comps: [],
		sizeRating: 0,
		aspects: GenerateAspects(ingBase, toolUsed),
	} as Ingredient;

	newIng.sizeRating = GenerateSizeRating(ingBase, newIng.quality);

	// Apply ItemAspect Adjustments to the ingredient quality
	newIng.aspects.forEach(aspectSpec => {
		if(aspectSpec.category === ASPECT_CATEGORY.QUALITY) {
			newIng.quality = Math.min(100, Math.max(0, newIng.quality + (aspectSpec.value as number)));
		}
	});

	newIng.saleValue = GenerateSaleValue(newIng, ingBase);

	// Apply ItemAspect Adjustments to the ingredient sale value
	newIng.aspects.forEach(aspectSpec => {
		if(aspectSpec.category === ASPECT_CATEGORY.SALE_VALUE) {
			newIng.saleValue *= aspectSpec.value as number;
		}
	});

	ingBase.possibleComps.forEach((compSpec, index) => {
		let newComp = null as AlchComponent | null;

		if ('possibleShapes' in compSpec) {
			if (
				compSpec.chance == undefined ||
				(compSpec.chance > 0 && Math.random() <= compSpec.chance)
			) {
				const shapeName = compSpec.possibleShapes[newIng.sizeRating] ?? compSpec.possibleShapes[0];
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

	newIng.saleValue = GenerateSaleValue(newIng, ingBase);

	return newIng;
}
