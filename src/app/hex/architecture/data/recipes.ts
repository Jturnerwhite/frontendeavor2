import { ALCH_ELEMENT, ITEM_TAG, SHAPE_NAME } from '@/app/hex/architecture/enums'
import { Recipe } from '@/app/hex/architecture/typings'
import { IngredientBases } from './ingredientBases';

const IMAGE_PATH = "/art/potions/";

export const Recipes:Array<Recipe> = [
	{
		id: 'HP-1', 
		description: 'Healing Potion', 
		image: IMAGE_PATH + 'hp.png',
		types: [ITEM_TAG.LIQUID],
		elementScores: [
			{ element: ALCH_ELEMENT.WATER, softCap: 2, cap: 5 },
			{ element: ALCH_ELEMENT.FIRE, softCap: 1, cap: 6 },
			{ element: ALCH_ELEMENT.WIND, softCap: 3, cap: 5 },
		],
		requiredIngredients: [
			{ type: IngredientBases['JarbaLeaf'] },
			{ type: IngredientBases['FruguBerry'] },
			{ type: IngredientBases['AeridGrass'] },
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
					scoreRequirement: 3,
				},
				{ 
					element: ALCH_ELEMENT.WATER, 
					shape: SHAPE_NAME.LINE,
					linkSpots: [1, 0, 0, 0, 0, 0, 0],
					scoreRequirement: 5,
				},
			],
			[
				{ 
					element: ALCH_ELEMENT.FIRE, 
					shape: SHAPE_NAME.DOT,
					scoreRequirement: 1,
				},
				{ 
					element: ALCH_ELEMENT.FIRE, 
					shape: SHAPE_NAME.HALFLINE,
					scoreRequirement: 3,
				},
				{ 
					element: ALCH_ELEMENT.FIRE, 
					shape: SHAPE_NAME.TRIANGLE,
					linkSpots: [1, 0, 0, 0, 0, 0, 0],
					scoreRequirement: 6,
				},
			],
			[
				{ 
					element: ALCH_ELEMENT.WIND, 
					shape: SHAPE_NAME.DOT,
					scoreRequirement: 1,
				},
				{ 
					element: ALCH_ELEMENT.WIND, 
					shape: SHAPE_NAME.HALFLINE,
					scoreRequirement: 3,
				},
				{ 
					element: ALCH_ELEMENT.WIND, 
					shape: SHAPE_NAME.OBTUSE,
					linkSpots: [0, 0, 1, 0, 0, 0, 0],
					scoreRequirement: 5,
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
		types: [ITEM_TAG.LIQUID],
		elementScores: [
			{ element: ALCH_ELEMENT.WATER, softCap: 2, cap: 5 },
			{ element: ALCH_ELEMENT.FIRE, softCap: 1, cap: 6 },
			{ element: ALCH_ELEMENT.WIND, softCap: 3, cap: 5 },
		],
		resultingComponents: [],
		requiredIngredients: [
			{ type: IngredientBases['FruguBerry'], qty: 2 },
			{ type: IngredientBases['Pinecap'] },
			{ type: ITEM_TAG.MAGICAL },
		],
	}
];