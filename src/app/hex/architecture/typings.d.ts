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
	chance?: number // If not defined, assumed to be 100%
}

export type IngredientBase = {
	id: string,
	name: string,
	ingTier: number, // A metric for identifying better ingredients, affects comp creation / link generation
	image?: string,
	types: ITEM_TAG[]
	possibleComps: Array<IngredientCompSpec|AlchComponent>
}

export type Ingredient = {
	id: string,
	baseIngId: string,
	quality: number,
	comps: AlchComponent[],
}

export type Item = {
	name: string,
	baseRecipeId?: string,
	description: string,
	comps: AlchComponent[],
	types: ITEM_TAG[],
	quality: number,
	ingredients: Ingredient[],
}

/** One row in the alchemy lab sidebar: raw ingredient or a crafted item used as a source (not expanded into its nested ingredients). */
export type AlchemyLabSource =
	| { labKind: 'ingredient'; ingredient: Ingredient }
	| {
			labKind: 'item'
			labSlotId: string
			item: Item
			/** Player `inventory.crafted` index when this row came from the stash (for consumption on craft complete). */
			playerCraftedInventoryIndex?: number
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

export type RecipeRequiredIngredient = {
	type: IngredientBase | ITEM_TAG,
	qty?: number,
	quality?: number,
}

/**
 * These act like "goals" that are conditionally met depending on how
 * the recipe is completed.
 */
export type RecipeResultingComponent = {
	element: ALCH_ELEMENT,
	shape: SHAPE_NAME,
	scoreRequirement: number,
	linkSpots?: number[],
}

export type Recipe = {
	id: string,
	image?: string,
	description: string,
	types: ITEM_TAG[],
	elementScores: RecipeElementScore[],
	resultingComponents: Array<Array<RecipeResultingComponent>>,
	requiredIngredients?: RecipeRequiredIngredient[],
	requirements?: RecipeRequirement[],
	forbidden?: RecipeRequirement[],
}

export type MapBiome = {
	name: string,
	description: string,
	icon: string,
	terrain: MAP_TERRAIN,
	nativeIngredients: Array<{ingredient: IngredientBase, weighting: number}>,
}

export type QuestRequirement = {
	requirementKind: 'ingredient' | 'tag' | 'recipe',
	itemType: IngredientBase | ITEM_TAG | Recipe,
	qty?: number,
	quality?: number,
	components?: Array<AlchComponent>,
}

export type Quest = {
	id: string,
	name: string,
	description: string,
	rewards: Array<Item|IngredientBase>,
	requirements: Array<QuestRequirement>,
	repeatable: boolean,
	gold?: number,
	xp?: number,
}