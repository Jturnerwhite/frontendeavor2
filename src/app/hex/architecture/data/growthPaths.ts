import { SHAPE_NAME } from "@/app/hex/architecture/enums";

/**
 * Ingredients have a size when gathered, and is used to determine shape of components created.
 * Different types of ingredients have different growth paths.
 * Here we have a few specific growth paths.
 * A component on an item will be created based on the growth path of the comp of the ingredient base it is from.
 * However, a comp on an IngredientBase will specify start shape, and only use 5 total indexes of a path.
 * Example: A SPIRAL ingredient base will have a comp on it that starts as a DOT, the largest shape in the path would be SHAPE_NAME.CLAW
 */
export const GrowthPaths:Record<string, Array<SHAPE_NAME>> = {
	SPIRAL: [
		SHAPE_NAME.DOT,
		SHAPE_NAME.HALFLINE,
		SHAPE_NAME.OBTUSE,
		SHAPE_NAME.FINGER,
		SHAPE_NAME.CLAW,
		SHAPE_NAME.CIRCLE,
		SHAPE_NAME.FULL,
	],
	ZIGZAG: [
		SHAPE_NAME.DOT,
		SHAPE_NAME.HALFLINE,
		SHAPE_NAME.TRIANGLE,
		SHAPE_NAME.DIAMOND,
		SHAPE_NAME.BRIDGE,
		SHAPE_NAME.WAKA,
		SHAPE_NAME.FULL,
	],
	WAVY: [
		SHAPE_NAME.DOT,
		SHAPE_NAME.HALFLINE,
		SHAPE_NAME.LINE,
		SHAPE_NAME.AXE,
		SHAPE_NAME.HOURGLASS,
		SHAPE_NAME.WAKA,
		SHAPE_NAME.FULL,
	],
	SPIN: [
		SHAPE_NAME.DOT,
		SHAPE_NAME.HALFLINE,
		SHAPE_NAME.OBTUSE,
		SHAPE_NAME.FIDGET,
		SHAPE_NAME.UMBRELLA,
		SHAPE_NAME.WAKA,
		SHAPE_NAME.FULL,
	]
}