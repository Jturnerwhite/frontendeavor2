import { ALCH_ELEMENT, ITEM_TAG } from '@/app/hex/architecture/enums'
import { Ingredient, Recipe } from '@/app/hex/architecture/typings'

export const Recipes:Array<Recipe> = [
	{
		id: 'HP-1', 
		description: 'Healing Potion', 
		types: [ITEM_TAG.LIQUID],
		requirements: [ {
			displayText: 'Must contain Water element', 
			requireFunc: (ingredients:Array<Ingredient>) => {
				return ingredients.some(ing => 
					ing.comps.some(comp => 
						comp.element === ALCH_ELEMENT.WATER));
			}
		}]
	},
];