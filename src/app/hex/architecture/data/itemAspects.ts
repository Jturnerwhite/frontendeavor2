import { ItemAspect, ItemAspectComp } from "@/app/hex/architecture/typings";
import { ALCH_ELEMENT, SHAPE_NAME } from "@/app/hex/architecture/enums";

export const BASE_ASPECT_WEIGHTING = 1000;

export enum ASPECT_CATEGORY {
	CUSTOM = "custom",
	SHARED_COMPONENT = "sharedComponent",
	SALE_VALUE = "saleValue",
	QUALITY = "quality",

	// Equipment Aspects
	GATHER_QUALITY = "gatherQuality",
	GATHER_COMP = "gatherComp",
	GATHER_ASPECT = "gatherAspect",

	CASTING_ACCURACY = "castingAccuracy",
	REEL_SPEED = "reelSpeed",
}

/**
 * Used to adjust the rarity of a set of aspects.
 * Base value is 10.
 * lower numbers here will cause the category to be rarer.
 * Higher numbers will cause it to be more common.
 */
export const AspectCategoryWeightModifiers = {
	[ASPECT_CATEGORY.CUSTOM]: 0,
	[ASPECT_CATEGORY.SHARED_COMPONENT]: 0,
	[ASPECT_CATEGORY.SALE_VALUE]: 10,
	[ASPECT_CATEGORY.QUALITY]: 10,

	// Equipment Aspects
	[ASPECT_CATEGORY.GATHER_QUALITY]: 5,
	[ASPECT_CATEGORY.GATHER_COMP]: 5,
	[ASPECT_CATEGORY.GATHER_ASPECT]: 5,
	[ASPECT_CATEGORY.CASTING_ACCURACY]: 5,
	[ASPECT_CATEGORY.REEL_SPEED]: 5,
}

export const SharedComponentAspects:Record<string, ItemAspect> = {
	sharedWater1: {
		id: 'sharedWater1',
		category: ASPECT_CATEGORY.SHARED_COMPONENT,
		weighting: 1000,
		name: 'Water Infusion 1',
		type: 'component',
		description: `An item's additional water component.`,
		value: {
			element: ALCH_ELEMENT.WATER,
			shape: SHAPE_NAME.DOT,
			linkSpots: [1, 0, 0, 0, 0, 0, 0],
		} as ItemAspectComp,
	},
};

export const FishingCastingAccuracyAspects:Record<string, ItemAspect> = {
	castingAccuracy1: {
		id: 'castingAccuracy1',
		category: ASPECT_CATEGORY.CASTING_ACCURACY,
		weighting: 1000,
		name: 'Cast ACC: 1',
		type: 'stat',
		description: 'Abysmal Cast Accuracy',
		value: 1,
	},
	castingAccuracy2: {
		id: 'castingAccuracy2',
		category: ASPECT_CATEGORY.CASTING_ACCURACY,
		weighting: 1000,
		name: 'Cast ACC: 2',
		type: 'stat',
		description: 'Mediocre Cast Accuracy',
		value: 5,
	},
	castingAccuracy3: {
		id: 'castingAccuracy3',
		category: ASPECT_CATEGORY.CASTING_ACCURACY,
		weighting: 1000,
		name: 'Cast ACC: 3',
		type: 'stat',
		description: 'Fair Cast Accuracy',
		value: 7,
	},
}

export const FishingReelSpeedAspects:Record<string, ItemAspect> = {
	reelSpeed1: {
		id: 'reelSpeed1',
		category: ASPECT_CATEGORY.REEL_SPEED,
		weighting: 1000,
		name: 'Reel SPD: 1',
		type: 'stat',
		description: 'Super Slow Reel Speed',
		value: 1,
	},
	reelSpeed2: {
		id: 'reelSpeed2',
		category: ASPECT_CATEGORY.REEL_SPEED,
		weighting: 1000,
		name: 'Reel SPD: 2',
		type: 'stat',
		description: 'Somewhat Slow Reel Speed',
		value: 3,
	},
	reelSpeed3: {
		id: 'reelSpeed3',
		category: ASPECT_CATEGORY.REEL_SPEED,
		weighting: 1000,
		name: 'Reel SPD: 3',
		type: 'stat',
		description: 'Basic Reel Speed',
		value: 5,
	},
}

export const GatheringToolQualityAspects:Record<string, ItemAspect> = {
	gatheringQuality1: {
		id: 'gatheringQuality1',
		category: ASPECT_CATEGORY.GATHER_QUALITY,
		weighting: 1000,
		name: 'Gather Quality: 1',
		type: 'stat',
		description: 'Poor Gathering Quality',
		value: 0.9,
	},
	gatheringQuality2: {
		id: 'gatheringQuality2',
		category: ASPECT_CATEGORY.GATHER_QUALITY,
		weighting: 1000,
		name: 'Gather Quality: 2',
		type: 'stat',
		description: 'Mediocre Gathering Quality (Same as gathering without a tool)',
		value: 1,
	},
	gatheringQuality3: {
		id: 'gatheringQuality3',
		category: ASPECT_CATEGORY.GATHER_QUALITY,
		weighting: 1000,
		name: 'Gather Quality: 3',
		type: 'stat',
		description: 'Decent Gathering Quality',
		value: 1.5,
	},
}

export const GatheringToolCompAspects:Record<string, ItemAspect> = {
	gatheringToolComp1: {
		id: 'gatheringToolComp1',
		category: ASPECT_CATEGORY.GATHER_COMP,
		weighting: 1000,
		name: 'Rough Harvester',
		type: 'stat',
		description: 'Poorly gathers ingredients, has a chance of reducing the number of nodes of components on gathered ingredients.',
		value: 1
	},
	gatheringToolComp2: {
		id: 'gatheringToolComp2',
		category: ASPECT_CATEGORY.GATHER_COMP,
		weighting: 1000,
		name: 'Average Harvester',
		type: 'stat',
		description: 'Adequately gathers ingredients. (Same as gathering without a tool)',
		value: 1
	},
	gatheringToolComp3: {
		id: 'gatheringToolComp3',
		category: ASPECT_CATEGORY.GATHER_COMP,
		weighting: 1000,
		name: 'Fine Harvester',
		type: 'stat',
		description: 'Fine gathers ingredients, has a chance of slightly increasing the number of nodes of components on gathered ingredients.',
		value: 2
	},
}

export const GatheringAspectAspects:Record<string, ItemAspect> = {
	gatheringAspect1: {
		id: 'gatheringAspect1',
		category: ASPECT_CATEGORY.GATHER_ASPECT,
		weighting: 1000,
		name: 'Aspect Hunter: 1',
		type: 'stat',
		description: 'Very slightly increases the chances of finding rarer aspects. (Adds 5% to the weighting of rarer aspects)',
		value: 5
	},
	gatheringAspect2: {
		id: 'gatheringAspect2',
		category: ASPECT_CATEGORY.GATHER_ASPECT,
		weighting: 1000,
		name: 'Aspect Hunter: 2',
		type: 'stat',
		description: 'Slightly increases the chances of finding rarer aspects. (Adds 10% to the weighting of rarer aspects)',
		value: 10
	},
	gatheringAspect3: {
		id: 'gatheringAspect3',
		category: ASPECT_CATEGORY.GATHER_ASPECT,
		weighting: 1000,
		name: 'Aspect Hunter: 3',
		type: 'stat',
		description: 'Somewhat increases the chances of finding rarer aspects. (Adds 15% to the weighting of rarer aspects)',
		value: 15
	},
}

export const SaleValueAspects:Record<string, ItemAspect> = {
	saleValue1: {
		id: 'saleValue1',
		category: ASPECT_CATEGORY.SALE_VALUE,
		weighting: 600,
		name: 'Worthless',
		type: 'stat',
		description: 'Greatly Reduced Sale Value',
		value: 0.5,
	},
	saleValue2: {
		id: 'saleValue2',
		category: ASPECT_CATEGORY.SALE_VALUE,
		weighting: 800,
		name: 'Cheap',
		type: 'stat',
		description: 'Slightly Reduced Sale Value',
		value: 0.9,
	},
	saleValue3: {
		id: 'saleValue3',
		category: ASPECT_CATEGORY.SALE_VALUE,
		weighting: 1000,
		name: 'Valuable',
		type: 'stat',
		description: 'Slightly Increased Sale Value',
		value: 1.25,
	},
	saleValue4: {
		id: 'saleValue4',
		category: ASPECT_CATEGORY.SALE_VALUE,
		weighting: 400,
		name: 'Priceless',
		type: 'stat',
		description: 'Massively Increased Sale Value',
		value: 2,
	},
}

export const QualityAspects:Record<string, ItemAspect> = {
	quality1: {
		id: 'quality1',
		category: ASPECT_CATEGORY.QUALITY,
		weighting: 800,
		name: 'Ruined Quality',
		type: 'stat',
		description: 'Items crafted with this will be of significantly lower quality (-15%)',
		value: -15,
	},
	quality2: {
		id: 'quality2',
		category: ASPECT_CATEGORY.QUALITY,
		weighting: 1000,
		name: 'Shoddy Quality',
		type: 'stat',
		description: 'Items crafted with this will be of slightly lower quality (-5%)',
		value: -5,
	},
	quality3: {
		id: 'quality3',
		category: ASPECT_CATEGORY.QUALITY,
		weighting: 1000,
		name: 'Decent Quality',
		type: 'stat',
		description: 'Items crafted with this will be of slightly higher quality (+5%)',
		value: 5,
	},
	quality4: {
		id: 'quality4',
		category: ASPECT_CATEGORY.QUALITY,
		weighting: 600,
		name: 'Good Quality',
		type: 'stat',
		description: 'Items crafted with this will be of significantly higher quality (+15%)',
		value: 15,
	},
	quality5: {
		id: 'quality5',
		category: ASPECT_CATEGORY.QUALITY,
		weighting: 200,
		name: 'Legendary Quality',
		type: 'stat',
		description: 'Items crafted with this will be of significantly higher quality (+25%)',
		value: 25,
	},
	quality6: {
		id: 'quality6',
		category: ASPECT_CATEGORY.QUALITY,
		weighting: 10,
		name: 'Perfect Quality',
		type: 'stat',
		description: 'Items crafted with this will be 100% quality',
		value: 100,
	},
}

export const EquipmentAspects:Record<string, ItemAspect> = {
	...FishingCastingAccuracyAspects,
	...FishingReelSpeedAspects,
}

export const BaseIngredientAspects:Record<string, ItemAspect> = {
	...SaleValueAspects,
	...QualityAspects
}

export const AllItemAspects:Record<string, ItemAspect> = {
	...SharedComponentAspects,
	...SaleValueAspects,
	...QualityAspects,

	// Equipment Aspects
	...GatheringToolQualityAspects,
	...GatheringToolCompAspects,
	...GatheringAspectAspects,

	...FishingCastingAccuracyAspects,
	...FishingReelSpeedAspects,
}
