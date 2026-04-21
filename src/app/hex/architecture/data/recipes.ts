import { ALCH_ELEMENT, ITEM_TAG, SHAPE_NAME } from '@/app/hex/architecture/enums'
import { publicAsset } from '@/lib/publicAsset'
import { Recipe } from '@/app/hex/architecture/typings'
import { IngredientBases } from './ingredientBases';
import { EquipmentSkills } from './equipmentSkills';

const IMAGE_PATH = publicAsset("/art/potions/");

export const Recipes:Array<Recipe> = [
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
		resultingComponents: [
			[
				{ 
					element: ALCH_ELEMENT.WATER, 
					shape: SHAPE_NAME.DOT,
					scoreRequirement: 1,
				},
				{ 
					element: ALCH_ELEMENT.WATER, 
					shape: SHAPE_NAME.HALFLINE,
					linkSpots: [1, 0, 0, 0, 0, 0, 0],
					scoreRequirement: 4,
				},
				{ 
					element: ALCH_ELEMENT.WATER, 
					shape: SHAPE_NAME.LINE,
					linkSpots: [1, 0, 0, 0, 0, 0, 0],
					scoreRequirement: 8,
				},
			],
			[
				{ 
					element: ALCH_ELEMENT.EARTH, 
					shape: SHAPE_NAME.DOT,
					scoreRequirement: 1,
				},
				{ 
					element: ALCH_ELEMENT.EARTH, 
					shape: SHAPE_NAME.HALFLINE,
					scoreRequirement: 4,
				},
				{ 
					element: ALCH_ELEMENT.EARTH, 
					shape: SHAPE_NAME.TRIANGLE,
					linkSpots: [1, 0, 0, 0, 0, 0, 0],
					scoreRequirement: 8,
				},
			],
			[
				{ 
					element: ALCH_ELEMENT.WIND, 
					shape: SHAPE_NAME.DOT,
					linkSpots: [1, 0, 0, 0, 0, 0, 0],
					scoreRequirement: 1,
				},
				{ 
					element: ALCH_ELEMENT.WIND, 
					shape: SHAPE_NAME.HALFLINE,
					linkSpots: [1, 0, 0, 0, 0, 0, 0],
					scoreRequirement: 4,
				},
				{ 
					element: ALCH_ELEMENT.WIND, 
					shape: SHAPE_NAME.OBTUSE,
					linkSpots: [0, 0, 1, 0, 0, 0, 0],
					scoreRequirement: 8,
				},
			]
		],
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
		resultingComponents: [
			[
				{ 
					element: ALCH_ELEMENT.WATER, 
					shape: SHAPE_NAME.HALFLINE,
					scoreRequirement: 1,
				},
				{ 
					element: ALCH_ELEMENT.WATER, 
					shape: SHAPE_NAME.TRIANGLE,
					linkSpots: [1, 0, 0, 0, 0, 0, 0],
					scoreRequirement: 5,
				},
				{ 
					element: ALCH_ELEMENT.WATER, 
					shape: SHAPE_NAME.DIAMOND,
					linkSpots: [1, 1, 0, 0, 0, 0, 0],
					scoreRequirement: 10,
				},
			],
			[
				{ 
					element: ALCH_ELEMENT.WIND, 
					shape: SHAPE_NAME.HALFLINE,
					linkSpots: [1, 0, 0, 0, 0, 0, 0],
					scoreRequirement: 1,
				},
				{ 
					element: ALCH_ELEMENT.WIND, 
					shape: SHAPE_NAME.LINE,
					linkSpots: [1, 0, 0, 0, 0, 0, 0],
					scoreRequirement: 4,
				},
				{ 
					element: ALCH_ELEMENT.WIND, 
					shape: SHAPE_NAME.CLAW,
					linkSpots: [0, 0, 1, 0, 0, 0, 0],
					scoreRequirement: 8,
				},
			],
			[
				{ 
					element: ALCH_ELEMENT.AETHER, 
					shape: SHAPE_NAME.OBTUSE,
					linkSpots: [1, 0, 0, 0, 0, 0, 0],
					scoreRequirement: 1,
				},
				{ 
					element: ALCH_ELEMENT.AETHER, 
					shape: SHAPE_NAME.DIAMOND,
					linkSpots: [1, 0, 0, 0, 0, 0, 0],
					scoreRequirement: 4,
				},
				{ 
					element: ALCH_ELEMENT.AETHER, 
					shape: SHAPE_NAME.WAKA,
					linkSpots: [0, 0, 1, 0, 0, 0, 0],
					scoreRequirement: 12,
				},
			]
		],
	},
	{
		id: 'FSH-R-1',
		image: IMAGE_PATH + 'mana.png',
		description: 'Fishing Rod',
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
		resultingComponents: [
			[
				{ 
					element: ALCH_ELEMENT.CHAOS, 
					shape: SHAPE_NAME.OBTUSE,
					linkSpots: [1, 0, 0, 0, 0, 0, 0],
					scoreRequirement: 1,
				},
				{ 
					element: ALCH_ELEMENT.CHAOS, 
					shape: SHAPE_NAME.DIAMOND,
					linkSpots: [1, 0, 0, 0, 0, 0, 0],
					scoreRequirement: 4,
				},
				{ 
					element: ALCH_ELEMENT.CHAOS, 
					shape: SHAPE_NAME.WAKA,
					linkSpots: [0, 0, 1, 0, 0, 0, 0],
					scoreRequirement: 12,
				},
			]
		],
		resultingEquipmentStats: [
			{
				element: ALCH_ELEMENT.WATER,
				goals: [
					{
						goal: 0,
						skill: EquipmentSkills['castingAccuracy1'],
					},
					{
						goal: 5,
						skill: EquipmentSkills['castingAccuracy2'],
					},
					{
						goal: 10,
						skill: EquipmentSkills['castingAccuracy3'],
					},
				],
			},
			{
				element: ALCH_ELEMENT.WIND,
				goals: [
					{
						goal: 0,
						skill: EquipmentSkills['reelSpeed1'],
					},
					{
						goal: 5,
						skill: EquipmentSkills['reelSpeed2'],
					},
					{
						goal: 10,
						skill: EquipmentSkills['reelSpeed3'],
					},
				],
			},
		],
	}
];