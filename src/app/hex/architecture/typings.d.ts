import { ALCH_ELEMENT, SHAPE_NAME, ITEM_TAG } from '@/app/hex/architecture/enums'
import { HexTile } from './interfaces'

/**
 * The alchemical components of an item (ingredient or concoction).
 * element - the AlchComponent element this component is.
 * shape - defines what shape the component has when displayed and used.
 * linkSpots - optional - defines which values, if any, can be linked externally.  Expects 7 1/0 values according to hexagon spots.
 */
export type AlchComponent = {
	id?: string,
	element: ALCH_ELEMENT,
	shape: SHAPE_NAME,
	linkSpots?: number[],
	sourceIngredientId?: string
	ingredientIndex?: number
}

export type IngredientCompSpec = {
	element: ALCH_ELEMENT,
	possibleShapes: Array<SHAPE_NAME>,
	linkSpots?: number[],
	chance?: number // If not defined, assumed to be 100%
}

export type IngredientBase = {
	name: string,
	types: ITEM_TAG[]
	possibleComps: Array<IngredientCompSpec|AlchComponent>
}

export type Ingredient = {
	id: string,
	base: IngredientBase
	comps: AlchComponent[],
}

export type Item = {
	name: string,
	comps: AlchComponent[],
	types: ITEM_TAG[],
	quality: number,
	ingredients: Ingredient[],
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

export type RecipeElementScore = {
	element: ALCH_ELEMENT,
	softCap: number,
	cap: number
}

export type Recipe = {
	id: string,
	description: string,
	types: ITEM_TAG[],
	elementScores: RecipeElementScore[],
	requiredIngredients?: Array<IngredientBase|ITEM_TAG>,
	requirements?: RecipeRequirement[],
	forbidden?: RecipeRequirement[],
}