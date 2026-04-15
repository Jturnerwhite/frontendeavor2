export enum ALCH_ELEMENT {
	EARTH = "Earth",
	WIND = "Wind",
	FIRE = "Fire",
	WATER = "Water",
	AETHER = "Aether",
	CHAOS = "Chaos"
}

export enum SHAPE_NAME {
    DOT = "Dot",
    HALFLINE = "Halfline",
    LINE = "Line",
    OBTUSE = "Obtuse",
    TRIANGLE = "Triangle",
    DIAMOND = "Diamond",
    FINGER = "Finger",
	AXE = "Axe",
	FIDGET = "Fidget",
    CLAW = "Claw",
	UMBRELLA = "Umbrella",
	HOURGLASS = "Hourglass",
    BRIDGE = "Bridge",
    WAKA = "Waka",
    CIRCLE = "Circle",
    FULL = "Full"
}

//      1
//   /     \
//  6       2
//  |   0   |
//  5       3
//   \     /
//      4
/**
 * While defined as a const, used as an enum.
 * Each value represents a true/false for if that spot is filled in, see comment above for order
 * When drawing, later, all values link to 0 and to each value next to it. (So 1 connects to 0, 6, and 2 if they are 'true')
 * Using 0/1 for legibility sake
 */
export const COMPONENT_SHAPE_VALUES = {
	[SHAPE_NAME.DOT]:	 	[1,0,0,0,0,0,0], // a 1-piece isolated dot ●
	[SHAPE_NAME.HALFLINE]:	[1,1,0,0,0,0,0], // a 2-piece line ●-●
	[SHAPE_NAME.LINE]:		[1,1,0,0,1,0,0], // a 3-piece line ●-●-●
	[SHAPE_NAME.OBTUSE]:	[0,1,1,1,0,0,0], // a 3-piece obtuse angle __/
	[SHAPE_NAME.TRIANGLE]:	[1,1,1,0,0,0,0], // a 3-piece triangle ▶
	[SHAPE_NAME.DIAMOND]:	[1,1,1,1,0,0,0], // a 4-piece diamond ◇
	[SHAPE_NAME.FINGER]:	[0,1,1,1,1,0,0], // a 4-piece curve ⌒
	[SHAPE_NAME.AXE]:		[1,1,0,0,1,0,1], // a 4-piece 4 shape
	[SHAPE_NAME.FIDGET]:	[1,1,0,1,0,1,0], // a 4-piece λ shape
	[SHAPE_NAME.CLAW]:		[0,1,1,1,1,0,0], // a 5-piece near-circle curve C
	[SHAPE_NAME.UMBRELLA]:	[1,1,1,1,0,1,0], // a 5-piece umbrella shape C-
	[SHAPE_NAME.HOURGLASS]:	[1,0,1,1,0,1,1], // a 5-piece hourglass ⧗
	[SHAPE_NAME.BRIDGE]:	[1,1,1,1,1,0,0], // a 5-piece ◐
	[SHAPE_NAME.WAKA]:		[1,1,1,1,1,1,0], // a 6 piece ◶ nearly full shape, missing an outer segment
	[SHAPE_NAME.CIRCLE]:	[0,1,1,1,1,1,1], // a 6 piece ○ missing the inner spot
	[SHAPE_NAME.FULL]:		[1,1,1,1,1,1,1], // a 7 piece full hex ●
}

export enum ITEM_TAG {
	ANIMAL_MAT = "Animal Mat",
	CRYSTAL = "Crystal",
	FUEL = "Fuel",
	LIQUID = "Liquid",
	MAGICAL = "Magical",
	PLANT = "Plant",
	STONE = "Stone",
	METAL = "Metal",
	FUNGUS = "Fungus",
}

export enum MAP_TERRAIN {
	FIELD = "Field",
	FOREST = "Forest",
	MOUNTAIN = "Mountain",
	CAVE = "Cave",
	FRESHWATER = "Freshwater",
	OCEAN = "Ocean",
	DESERT = "Desert",
	ICE = "Ice",
	SWAMP = "Swamp",
	LAVA = "Lava",
	LAKE = "Lake",
}