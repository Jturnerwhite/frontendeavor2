import { ALCH_ELEMENT, ITEM_TAG, SHAPE_NAME } from '@/app/hex/architecture/enums'
import { publicAsset } from '@/lib/publicAsset'
import { ItemAspectComp, Recipe } from '@/app/hex/architecture/typings'
import { IngredientBases } from './ingredientBases';
import { AllItemAspects, ASPECT_CATEGORY } from '@/app/hex/architecture/data/itemAspects';

const IMAGE_PATH = publicAsset("/art/potions/");

const PotionRecipes:Array<Recipe> = [
	{
		id: 'HP-1', 
		description: 'Healing Potion', 
		image: IMAGE_PATH + 'hp.png',
		types: [ITEM_TAG.LIQUID, ITEM_TAG.MAGICAL],
		elementScores: [
			{ element: ALCH_ELEMENT.WATER, softCap: 3, cap: 8 },
			{ element: ALCH_ELEMENT.EARTH, softCap: 3, cap: 8 },
			{ element: ALCH_ELEMENT.WIND, softCap: 3, cap: 8 },
		],
		requiredIngredients: [
			{ type: IngredientBases['Pinecap'] },
			{ type: IngredientBases['FruguBerry'] },
			{ type: IngredientBases['CragLichen'] },
		],
		goalsAndRewards: {
			[ALCH_ELEMENT.WATER]: [
				{ goal: 1, reward: AllItemAspects.sharedWater1 },
				{
					goal: 4,
					reward: {
						id: 'HP-1-CUST-WATER-2',
						name: 'Water Infusion 2',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: `An item's additional water component.`,
						type: 'component',
						value: {
							element: ALCH_ELEMENT.WATER,
							shape: SHAPE_NAME.HALFLINE,
							linkSpots: [1, 0, 0, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
				{
					goal: 8,
					reward: {
						id: 'HP-1-CUST-WATER-3',
						name: 'Water Infusion 3',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: `An item's additional water component.`,
						type: 'component',
						value: {
							element: ALCH_ELEMENT.WATER,
							shape: SHAPE_NAME.LINE,
							linkSpots: [1, 0, 0, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
			],
			[ALCH_ELEMENT.EARTH]: [
				{
					goal: 1,
					reward: {
						id: 'HP-1-EARTH-1',
						name: 'Earth Infusion 1',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: `An item's additional earth component.`,
						type: 'component',
						value: {
							element: ALCH_ELEMENT.EARTH,
							shape: SHAPE_NAME.DOT,
						} as ItemAspectComp,
					},
				},
				{
					goal: 4,
					reward: {
						id: 'HP-1-EARTH-2',
						name: 'Earth Infusion 2',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: `An item's additional earth component.`,
						type: 'component',
						value: {
							element: ALCH_ELEMENT.EARTH,
							shape: SHAPE_NAME.HALFLINE,
						} as ItemAspectComp,
					},
				},
				{
					goal: 8,
					reward: {
						id: 'HP-1-EARTH-3',
						name: 'Earth Infusion 3',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: `An item's additional earth component.`,
						type: 'component',
						value: {
							element: ALCH_ELEMENT.EARTH,
							shape: SHAPE_NAME.TRIANGLE,
							linkSpots: [1, 0, 0, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
			],
			[ALCH_ELEMENT.WIND]: [
				{
					goal: 1,
					reward: {
						id: 'HP-1-WIND-1',
						name: 'Wind Infusion 1',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: `An item's additional wind component.`,
						type: 'component',
						value: {
							element: ALCH_ELEMENT.WIND,
							shape: SHAPE_NAME.DOT,
							linkSpots: [1, 0, 0, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
				{
					goal: 4,
					reward: {
						id: 'HP-1-WIND-2',
						name: 'Wind Infusion 2',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: `An item's additional wind component.`,
						type: 'component',
						value: {
							element: ALCH_ELEMENT.WIND,
							shape: SHAPE_NAME.HALFLINE,
							linkSpots: [1, 0, 0, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
				{
					goal: 8,
					reward: {
						id: 'HP-1-WIND-3',
						name: 'Wind Infusion 3',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: `An item's additional wind component.`,
						type: 'component',
						value: {
							element: ALCH_ELEMENT.WIND,
							shape: SHAPE_NAME.OBTUSE,
							linkSpots: [0, 0, 1, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
			],
		},
		/*
		requirements: [ {
			displayText: 'Must contain Water element', 
			requireFunc: (ingredients:Array<Ingredient>) => {
				return ingredients.some(ing => 
					ing.comps.some(comp => 
						comp.element === ALCH_ELEMENT.WATER));
			}
		}]
		*/
	},
	{
		id: 'MANA-1',
		image: IMAGE_PATH + 'mana.png',
		description: 'Mana Potion',
		types: [ITEM_TAG.LIQUID, ITEM_TAG.MAGICAL],
		elementScores: [
			{ element: ALCH_ELEMENT.WATER, softCap: 4, cap: 10 },
			{ element: ALCH_ELEMENT.WIND, softCap: 3, cap: 8 },
			{ element: ALCH_ELEMENT.AETHER, softCap: 3, cap: 10 },
		],
		requiredIngredients: [
			{ type: IngredientBases['FruguBerry'], qty: 2 },
			{ type: IngredientBases['AeridGrass'], qty: 2 },
			{ type: ITEM_TAG.MAGICAL },
		],
		goalsAndRewards: {
			[ALCH_ELEMENT.WATER]: [
				{
					goal: 1,
					reward: {
						id: 'MANA-W-1',
						name: 'Mana water tier 1',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: '',
						type: 'component',
						value: { element: ALCH_ELEMENT.WATER, shape: SHAPE_NAME.HALFLINE } as ItemAspectComp,
					},
				},
				{
					goal: 5,
					reward: {
						id: 'MANA-W-2',
						name: 'Mana water tier 2',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: '',
						type: 'component',
						value: {
							element: ALCH_ELEMENT.WATER,
							shape: SHAPE_NAME.TRIANGLE,
							linkSpots: [1, 0, 0, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
				{
					goal: 10,
					reward: {
						id: 'MANA-W-3',
						name: 'Mana water tier 3',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: '',
						type: 'component',
						value: {
							element: ALCH_ELEMENT.WATER,
							shape: SHAPE_NAME.DIAMOND,
							linkSpots: [1, 1, 0, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
			],
			[ALCH_ELEMENT.WIND]: [
				{
					goal: 1,
					reward: {
						id: 'MANA-WI-1',
						name: 'Mana wind tier 1',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: '',
						type: 'component',
						value: {
							element: ALCH_ELEMENT.WIND,
							shape: SHAPE_NAME.HALFLINE,
							linkSpots: [1, 0, 0, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
				{
					goal: 4,
					reward: {
						id: 'MANA-WI-2',
						name: 'Mana wind tier 2',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: '',
						type: 'component',
						value: {
							element: ALCH_ELEMENT.WIND,
							shape: SHAPE_NAME.LINE,
							linkSpots: [1, 0, 0, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
				{
					goal: 8,
					reward: {
						id: 'MANA-WI-3',
						name: 'Mana wind tier 3',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: '',
						type: 'component',
						value: {
							element: ALCH_ELEMENT.WIND,
							shape: SHAPE_NAME.CLAW,
							linkSpots: [0, 0, 1, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
			],
			[ALCH_ELEMENT.AETHER]: [
				{
					goal: 1,
					reward: {
						id: 'MANA-A-1',
						name: 'Mana aether tier 1',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: '',
						type: 'component',
						value: {
							element: ALCH_ELEMENT.AETHER,
							shape: SHAPE_NAME.OBTUSE,
							linkSpots: [1, 0, 0, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
				{
					goal: 4,
					reward: {
						id: 'MANA-A-2',
						name: 'Mana aether tier 2',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: '',
						type: 'component',
						value: {
							element: ALCH_ELEMENT.AETHER,
							shape: SHAPE_NAME.DIAMOND,
							linkSpots: [1, 0, 0, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
				{
					goal: 12,
					reward: {
						id: 'MANA-A-3',
						name: 'Mana aether tier 3',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: '',
						type: 'component',
						value: {
							element: ALCH_ELEMENT.AETHER,
							shape: SHAPE_NAME.WAKA,
							linkSpots: [0, 0, 1, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
			],
		},
	},
];

const FishingRodRecipes:Array<Recipe> = [
	{
		id: 'FSH-R-1',
		image: publicAsset("/art/") + 'equipment/bad-rod.png',
		description: 'Janky Fishing Rod',
		types: [ITEM_TAG.FISHING_ROD],
		elementScores: [
			{ element: ALCH_ELEMENT.WATER, softCap: 4, cap: 10 },
			{ element: ALCH_ELEMENT.WIND, softCap: 3, cap: 10 },
			{ element: ALCH_ELEMENT.CHAOS, softCap: 3, cap: 10 },
		],
		requiredIngredients: [
			{ type: IngredientBases['PineWood'], qty: 1 },
			{ type: ITEM_TAG.LIQUID },
			{ type: ITEM_TAG.PLANT },
		],
		goalsAndRewards: {
			[ALCH_ELEMENT.WATER]: [
				{ goal: 0, reward: AllItemAspects.castingAccuracy1 },
				{ goal: 5, reward: AllItemAspects.castingAccuracy2 },
				{ goal: 10, reward: AllItemAspects.castingAccuracy3 },
			],
			[ALCH_ELEMENT.WIND]: [
				{ goal: 0, reward: AllItemAspects.reelSpeed1 },
				{ goal: 5, reward: AllItemAspects.reelSpeed2 },
				{ goal: 10, reward: AllItemAspects.reelSpeed3 },
			],
			[ALCH_ELEMENT.CHAOS]: [
				{
					goal: 1,
					reward: {
						id: 'FSH-CH-1',
						name: 'Chaos component 1',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: '',
						type: 'component',
						value: {
							element: ALCH_ELEMENT.CHAOS,
							shape: SHAPE_NAME.OBTUSE,
							linkSpots: [1, 0, 0, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
				{
					goal: 4,
					reward: {
						id: 'FSH-CH-2',
						name: 'Chaos component 2',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: '',
						type: 'component',
						value: {
							element: ALCH_ELEMENT.CHAOS,
							shape: SHAPE_NAME.DIAMOND,
							linkSpots: [1, 0, 0, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
				{
					goal: 12,
					reward: {
						id: 'FSH-CH-3',
						name: 'Chaos component 3',
						weighting: 0,
						category: ASPECT_CATEGORY.CUSTOM,
						description: '',
						type: 'component',
						value: {
							element: ALCH_ELEMENT.CHAOS,
							shape: SHAPE_NAME.WAKA,
							linkSpots: [0, 0, 1, 0, 0, 0, 0],
						} as ItemAspectComp,
					},
				},
			],
		},
	}
];

const GatheringToolRecipes:Array<Recipe> = [
	{
		id: 'GTH-T-1',
		image: publicAsset("/art/") + 'equipment/bad-scythe.png',
		description: 'Janky Sickle',
		types: [ITEM_TAG.GATHER_TOOL],
		elementScores: [
			{ element: ALCH_ELEMENT.EARTH, softCap: 3, cap: 8 },
			{ element: ALCH_ELEMENT.FIRE, softCap: 3, cap: 8 },
			{ element: ALCH_ELEMENT.WIND, softCap: 3, cap: 8 },
		],
		requiredIngredients: [
			{ type: IngredientBases['PineWood'], qty: 1 },
			{ type: ITEM_TAG.PLANT },
			{ type: ITEM_TAG.MAGICAL },
		],
		goalsAndRewards: {
			[ALCH_ELEMENT.EARTH]: [
				{ goal: 1, reward: AllItemAspects.gatheringQuality1 },
				{ goal: 4, reward: AllItemAspects.gatheringQuality2 },
				{ goal: 8, reward: AllItemAspects.gatheringQuality3 },
			],
			[ALCH_ELEMENT.FIRE]: [
				{ goal: 1, reward: AllItemAspects.gatheringToolComp1 },
				{ goal: 4, reward: AllItemAspects.gatheringToolComp2 },
				{ goal: 8, reward: AllItemAspects.gatheringToolComp3 },
			],
			[ALCH_ELEMENT.WIND]: [
				{ goal: 1, reward: AllItemAspects.gatheringAspect1 },
				{ goal: 4, reward: AllItemAspects.gatheringAspect2 },
				{ goal: 8, reward: AllItemAspects.gatheringAspect3 },
			],
		},
	},
];

const Recipes:Array<Recipe> = [
	...PotionRecipes,
	...FishingRodRecipes,
	...GatheringToolRecipes,
];

export { Recipes };