import { ALCH_ELEMENT, SHAPE_NAME, ITEM_TAG } from '@/app/hex/architecture/enums'


/**
 * The alchemical components of an item (ingredient or concoction).
 * element - the AlchComponent element this component is.
 * shape - defines what shape the component has when displayed and used.
 * linkSpots - optional - defines which values, if any, can be linked externally.  Expects 7 1/0 values according to hexagon spots.
 */
export type AlchComponent = {
	element: ALCH_ELEMENT,
	shape: SHAPE_NAME,
	linkSpots?: number[]
}

export type Ingredient = {
	name: string,
	comps: AlchComponent[],
	types: ITEM_TAG[]
}

/**
 * Used for defining functions that will be used to filter possible ingredients.
 * Separated for ease of component display later
 */
export type IngredientRequirement = {
	displayText: string,
	requireFunc: function
}

export type RecipeRequirement = {
	displayText: string,
	requireFunc: function
}

export type Recipe = {
	id: string,
	description: string,
	types: ITEM_TAG[],
	requiredIngredients: Array<Ingredient|ITEM_TAG>,
	requirements: RecipeRequirement[],
	forbidden: RecipeRequirement[],
}