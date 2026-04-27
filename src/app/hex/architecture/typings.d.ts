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

export type IngredientAspectSpec = {
	id: string,
	aspect: ItemAspect,
	weighting: number
}

export type IngredientBase = {
	id: string,
	name: string,
	image?: string,

	ingTier: number, // A metric for identifying better ingredients, affects comp creation / link generation
	baseSaleValue?: number,
	types: ITEM_TAG[]
	possibleComps: Array<IngredientCompSpec|AlchComponent>
	additionalAspectPools?: Array<Record<string, ItemAspect>>

}

/**
 * An instantiated ingredient base that can be used to craft a recipe.
 */
export type Ingredient = {
	id: string,
	baseIngId: string,
	quality: number,
	saleValue: number,
	comps: AlchComponent[],
	sizeRating: number, // 1 to 5, small to large, used to determine comp creation / link generation
	aspects: Array<ItemAspect>
}

export type Item = {
	name: string,
	id: string,
	baseRecipeId?: string,
	description: string,
	quality: number,
	saleValue: number,
	comps: AlchComponent[],
	types: ITEM_TAG[],
	ingredients: Ingredient[],
	aspects: Array<ItemAspect>
}

export type Equipment = Item & {
	equipmentType: EQUIPMENT_TYPE,
	stats: Array<string, ItemAspect>,
}

export type ItemAspect = {
	id: string,
	category: string,
	weighting: number, // Base weight is 1000
	name:string,
	description:string,
	type: 'stat' | 'functional' | 'flag' | 'component'
	value: number|string|boolean|ItemAspectComp|null
}

export type ItemAspectComp = {
	element: ALCH_ELEMENT,
	shape: SHAPE_NAME,
	linkSpots?: number[],
}

/** One row in the alchemy lab sidebar: raw ingredient or a crafted item used as a source (not expanded into its nested ingredients). */
export type AlchemyLabSource =
	| { labKind: 'ingredient'; ingredient: Ingredient }
	| {
			labKind: 'item'
			labSlotId: string
			item: Item
			/** `Item.id` in the player stash when this row came from crafted inventory (consumption on craft complete). */
			playerCraftedItemId?: string
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

export type RecipeGoalAndReward = {
	goal: number,
	reward: ItemAspect,
}

/** Per-element tier lists. Only include keys for elements that have goals. */
export type RecipeGoalsAndRewardsByElement = Partial<Record<ALCH_ELEMENT, RecipeGoalAndReward[]>>

export type Recipe = {
	id: string,
	image?: string,
	description: string,
	types: ITEM_TAG[],
	elementScores: RecipeElementScore[],
	goalsAndRewards: RecipeGoalsAndRewardsByElement,

	requiredIngredients?: RecipeRequiredIngredient[],
	requirements?: RecipeRequirement[],
	forbidden?: RecipeRequirement[],

}

export type MapBiome = {
	id: string,
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