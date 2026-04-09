import { ALCH_ELEMENT, ITEM_TAG, SHAPE_NAME } from '@/app/hex/architecture/enums'
import { AlchComponent, IngredientBase, IngredientCompSpec } from "../typings";
const IMAGE_PATH = "/art/ingredients/";

export const IngedientBases:Record<string, IngredientBase> = {
	JarbaLeaf: {
		id: "JarbaLeaf",
		name: "Jarba Leaf",
		image: IMAGE_PATH + "jarba.png",
		types: [ITEM_TAG.NATURAL, ITEM_TAG.PLANT],
		possibleComps: [
			{
				element: ALCH_ELEMENT.FIRE,
				possibleShapes: [SHAPE_NAME.HALFLINE, SHAPE_NAME.LINE, SHAPE_NAME.FINGER, SHAPE_NAME.CLAW],
				linkSpots: [1, 0, 1, 0, 0, 0, 0]
			},
			{
				element: ALCH_ELEMENT.FIRE,
				possibleShapes: [SHAPE_NAME.DOT,SHAPE_NAME.LINE, SHAPE_NAME.CLAW, SHAPE_NAME.UMBRELLA],
				linkSpots: [0, 1, 0, 1, 0, 0, 0]
			},
			{
				element: ALCH_ELEMENT.EARTH,
				possibleShapes: [SHAPE_NAME.DOT],
				chance: 0.5
			}
		]
	},
	FruguBerry: {
		id: "FruguBerry",
		name: "Frugu Berry",
		image: IMAGE_PATH + "frugu.png",
		types: [ITEM_TAG.NATURAL, ITEM_TAG.PLANT],
		possibleComps: [
			{
				element: ALCH_ELEMENT.WATER,
				possibleShapes: [SHAPE_NAME.DOT, SHAPE_NAME.HALFLINE, SHAPE_NAME.LINE, SHAPE_NAME.DIAMOND]
			},
			{
				element: ALCH_ELEMENT.WATER,
				possibleShapes: [SHAPE_NAME.HALFLINE, SHAPE_NAME.LINE, SHAPE_NAME.FINGER, SHAPE_NAME.CLAW]
			},
			{
				element: ALCH_ELEMENT.CHAOS,
				possibleShapes: [SHAPE_NAME.DOT],
				chance: 0.5
			}
		]
	},
	AeridGrass: {
		id: "AeridGrass",
		name: "Aerid Grass",
		image: IMAGE_PATH + "aerid.png",
		types: [ITEM_TAG.NATURAL, ITEM_TAG.PLANT],
		possibleComps: [
			{
				element: ALCH_ELEMENT.WIND,
				shape: SHAPE_NAME.FIDGET,
				linkSpots: [1, 0, 0, 0, 0, 0, 0]
			} as AlchComponent,
			{
				element: ALCH_ELEMENT.WIND,
				possibleShapes: [SHAPE_NAME.DOT, SHAPE_NAME.HALFLINE, SHAPE_NAME.LINE, SHAPE_NAME.OBTUSE, SHAPE_NAME.TRIANGLE, SHAPE_NAME.DIAMOND, SHAPE_NAME.CLAW]
			},
			{
				element: ALCH_ELEMENT.AETHER,
				possibleShapes: [SHAPE_NAME.DOT],
				chance: 0.5
			}
		]
	},
	Pinecap: {
		id: "Pinecap",
		name: "Pinecap",
		image: IMAGE_PATH + "pinecap.png",
		types: [ITEM_TAG.NATURAL, ITEM_TAG.PLANT],
		possibleComps: [
			{
				element: ALCH_ELEMENT.EARTH,
				possibleShapes: [SHAPE_NAME.DOT, SHAPE_NAME.HALFLINE, SHAPE_NAME.LINE, SHAPE_NAME.FINGER],
			},
			{
				element: ALCH_ELEMENT.WIND,
				possibleShapes: [SHAPE_NAME.DOT, SHAPE_NAME.HALFLINE, SHAPE_NAME.OBTUSE],
			},
			{
				element: ALCH_ELEMENT.FIRE,
				possibleShapes: [SHAPE_NAME.DOT],
				chance: 0.4,
			},
		],
	},
	CragLichen: {
		id: "CragLichen",
		name: "Crag Lichen",
		image: IMAGE_PATH + "crag.png",
		types: [ITEM_TAG.NATURAL, ITEM_TAG.PLANT],
		possibleComps: [
			{
				element: ALCH_ELEMENT.EARTH,
				possibleShapes: [SHAPE_NAME.DOT, SHAPE_NAME.HALFLINE, SHAPE_NAME.LINE, SHAPE_NAME.DIAMOND],
			},
			{
				element: ALCH_ELEMENT.WATER,
				possibleShapes: [SHAPE_NAME.DOT, SHAPE_NAME.HALFLINE, SHAPE_NAME.LINE],
			},
			{
				element: ALCH_ELEMENT.WIND,
				possibleShapes: [SHAPE_NAME.DOT],
				chance: 0.45,
			},
		],
	},
	Sunpetal: {
		id: "Sunpetal",
		name: "Sunpetal",
		image: IMAGE_PATH + "sunpetal.png",
		types: [ITEM_TAG.NATURAL, ITEM_TAG.PLANT, ITEM_TAG.MAGICAL],
		possibleComps: [
			{
				element: ALCH_ELEMENT.FIRE,
				possibleShapes: [SHAPE_NAME.DOT, SHAPE_NAME.HALFLINE, SHAPE_NAME.TRIANGLE, SHAPE_NAME.DIAMOND],
			},
			{
				element: ALCH_ELEMENT.WIND,
				possibleShapes: [SHAPE_NAME.DOT, SHAPE_NAME.HALFLINE, SHAPE_NAME.FIDGET],
			},
			{
				element: ALCH_ELEMENT.AETHER,
				possibleShapes: [SHAPE_NAME.DOT],
				chance: 0.35,
			},
		],
	},
};