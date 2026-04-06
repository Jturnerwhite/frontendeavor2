import { ALCH_ELEMENT, ITEM_TAG, SHAPE_NAME } from '@/app/hex/architecture/enums'
import { AlchComponent, IngredientBase, IngredientCompSpec } from "../typings";

export const IngedientBases:Record<string, IngredientBase> = {
	JarbaLeaf: {
		name: "Jarba Leaf",
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
		name: "Frugu Berry",
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
		name: "Aerid Grass",
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
};