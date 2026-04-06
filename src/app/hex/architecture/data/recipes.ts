import { ALCH_ELEMENT, ITEM_TAG } from '@/app/hex/architecture/enums'
import { Ingredient, Recipe } from '@/app/hex/architecture/typings'
import { IngedientBases } from './ingedientBases';

export const Recipes:Array<Recipe> = [
	{
		id: 'HP-1', 
		description: 'Healing Potion', 
		types: [ITEM_TAG.LIQUID],
		elementScores: [
			{ element: ALCH_ELEMENT.WATER, softCap: 2, cap: 5 },
			{ element: ALCH_ELEMENT.FIRE, softCap: 1, cap: 6 },
			{ element: ALCH_ELEMENT.WIND, softCap: 3, cap: 5 },
		],
		requiredIngredients: [
			IngedientBases["JarbaLeaf"], 
			IngedientBases["FruguBerry"], 
			IngedientBases["AeridGrass"]
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
];