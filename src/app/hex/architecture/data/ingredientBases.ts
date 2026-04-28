import { publicAsset } from '@/lib/publicAsset'
import { ALCH_ELEMENT, ITEM_TAG, SHAPE_NAME } from '@/app/hex/architecture/enums'
import { AlchComponent, IngredientBase, IngredientCompSpec } from '@/app/hex/architecture/typings';
import { GrowthPaths } from '@/app/hex/architecture/data/growthPaths';

const IMAGE_PATH = publicAsset("/art/ingredients/");

export const IngredientBases:Record<string, IngredientBase> = {
	JarbaLeaf: {
		id: "JarbaLeaf",
		name: "Jarba Leaf",
		ingTier: 0,
		baseSaleValue: 1,
		image: IMAGE_PATH + "jarba.png",
		types: [ITEM_TAG.PLANT],
		possibleComps: [
			{
				element: ALCH_ELEMENT.FIRE,
				possibleShapes: GrowthPaths.SPIRAL.slice(0, 5),
				linkSpots: [1, 0, 1, 0, 0, 0, 0]
			},
			{
				element: ALCH_ELEMENT.FIRE,
				possibleShapes: GrowthPaths.ZIGZAG.slice(0, 4),
				linkSpots: [0, 1, 0, 1, 0, 0, 0]
			},
			{
				element: ALCH_ELEMENT.EARTH,
				possibleShapes: GrowthPaths.WAVY.slice(0, 2),
				chance: 0.5
			}
		],
	},
	FruguBerry: {
		id: "FruguBerry",
		name: "Frugu Berry",
		ingTier: 0,
		baseSaleValue: 2,
		image: IMAGE_PATH + "frugu.png",
		types: [ITEM_TAG.PLANT],
		possibleComps: [
			{
				element: ALCH_ELEMENT.WATER,
				possibleShapes: GrowthPaths.ZIGZAG.slice(0, 5),
			},
			{
				element: ALCH_ELEMENT.WATER,
				possibleShapes: GrowthPaths.ZIGZAG.slice(0, 4),
			},
			{
				element: ALCH_ELEMENT.CHAOS,
				possibleShapes: GrowthPaths.SPIRAL.slice(0, 2),
				chance: 0.25
			}
		],
	},
	AeridGrass: {
		id: "AeridGrass",
		name: "Aerid Grass",
		ingTier: 0,
		baseSaleValue: 2,
		image: IMAGE_PATH + "aerid.png",
		types: [ITEM_TAG.PLANT],
		possibleComps: [
			{
				element: ALCH_ELEMENT.WIND,
				shape: SHAPE_NAME.FIDGET,
				linkSpots: [1, 0, 0, 0, 0, 0, 0]
			} as AlchComponent,
			{
				element: ALCH_ELEMENT.WIND,
				possibleShapes: GrowthPaths.WAVY.slice(0, 4),
			},
			{
				element: ALCH_ELEMENT.AETHER,
				possibleShapes: GrowthPaths.WAVY.slice(0, 2),
				chance: 0.25
			}
		],
	},
	Pinecap: {
		id: "Pinecap",
		name: "Pinecap",
		ingTier: 0,
		baseSaleValue: 3,
		image: IMAGE_PATH + "pinecap.png",
		types: [ITEM_TAG.PLANT],
		possibleComps: [
			{
				element: ALCH_ELEMENT.EARTH,
				possibleShapes: GrowthPaths.WAVY.slice(0, 5),
			},
			{
				element: ALCH_ELEMENT.WIND,
				possibleShapes: GrowthPaths.WAVY.slice(0, 4),
			},
			{
				element: ALCH_ELEMENT.FIRE,
				possibleShapes: GrowthPaths.WAVY.slice(0, 2),
				chance: 0.25,
			},
		],
	},
	CragLichen: {
		id: "CragLichen",
		name: "Crag Lichen",
		ingTier: 0,
		baseSaleValue: 2,
		image: IMAGE_PATH + "crag.png",
		types: [ITEM_TAG.PLANT],
		possibleComps: [
			{
				element: ALCH_ELEMENT.EARTH,
				possibleShapes: GrowthPaths.ZIGZAG.slice(0, 5),
			},
			{
				element: ALCH_ELEMENT.WATER,
				possibleShapes: GrowthPaths.SPIN.slice(0, 4),
			},
			{
				element: ALCH_ELEMENT.WIND,
				possibleShapes: GrowthPaths.SPIN.slice(0, 2),
				chance: 0.25,
			},
		],
	},
	Sunpetal: {
		id: "Sunpetal",
		name: "Sunpetal",
		ingTier: 0,
		baseSaleValue: 2,
		image: IMAGE_PATH + "sunpetal.png",
		types: [ITEM_TAG.PLANT, ITEM_TAG.MAGICAL],
		possibleComps: [
			{
				element: ALCH_ELEMENT.FIRE,
				possibleShapes: GrowthPaths.SPIN.slice(0, 5),
			},
			{
				element: ALCH_ELEMENT.WIND,
				possibleShapes: GrowthPaths.SPIN.slice(0, 5),
			},
			{
				element: ALCH_ELEMENT.AETHER,
				possibleShapes: GrowthPaths.SPIRAL.slice(0, 2),
				chance: 0.25,
			},
		],
	},
	PineWood: {
		id: "PineWood",
		name: "Pine Wood",
		ingTier: 0,
		baseSaleValue: 5,
		image: IMAGE_PATH + "pine-log.png",
		types: [ITEM_TAG.PLANT],
		possibleComps: [
			{
				element: ALCH_ELEMENT.EARTH,
				possibleShapes: GrowthPaths.WAVY.slice(0, 5),
			},
			{
				element: ALCH_ELEMENT.WIND,
				possibleShapes: GrowthPaths.WAVY.slice(0, 4),
			},
			{
				element: ALCH_ELEMENT.FIRE,
				possibleShapes: GrowthPaths.WAVY.slice(0, 2),
				chance: 0.25,
			},
		],
	},
	// Fish
	Frillish: {
		id: "Frillish",
		name: "Frillish",
		ingTier: 0,
		baseSaleValue: 3,
		image: IMAGE_PATH + "/fish/frilled.png",
		types: [ITEM_TAG.ANIMAL_MAT],
		possibleComps: [
			{
				element: ALCH_ELEMENT.EARTH,
				possibleShapes: GrowthPaths.WAVY.slice(0, 5),
				linkSpots: [0, 0, 0, 0, 0, 1, 0]
			},
			{
				element: ALCH_ELEMENT.WATER,
				possibleShapes: GrowthPaths.WAVY.slice(0, 4),
			},
			{
				element: ALCH_ELEMENT.WATER,
				possibleShapes: GrowthPaths.WAVY.slice(0, 4),
				chance: 0.1
			},
		],
	},
	JusThead: {
		id: "JusThead",
		name: "Jus Thead",
		ingTier: 0,
		baseSaleValue: 1,
		image: IMAGE_PATH + "/fish/justhead.png",
		types: [ITEM_TAG.ANIMAL_MAT],
		possibleComps: [
			{
				element: ALCH_ELEMENT.WATER,
				possibleShapes: [SHAPE_NAME.DOT],
				linkSpots: [1, 0, 0, 0, 0, 0, 0]
			},
			{
				element: ALCH_ELEMENT.EARTH,
				possibleShapes: [SHAPE_NAME.DOT],
				chance: 0.25
			},
			{
				element: ALCH_ELEMENT.FIRE,
				possibleShapes: [SHAPE_NAME.DOT],
				chance: 0.25
			},
			{
				element: ALCH_ELEMENT.WIND,
				possibleShapes: [SHAPE_NAME.DOT],
				chance: 0.25
			},
			{
				element: ALCH_ELEMENT.AETHER,
				possibleShapes: [SHAPE_NAME.DOT],
				chance: 0.25
			},
			{
				element: ALCH_ELEMENT.CHAOS,
				possibleShapes: [SHAPE_NAME.DOT],
				chance: 0.25
			},
		],
	},
	Grumbo: {
		id: "Grumbo",
		name: "Grumbo",
		ingTier: 0,
		baseSaleValue: 10,
		image: IMAGE_PATH + "/fish/simple.png",
		types: [ITEM_TAG.ANIMAL_MAT],
		possibleComps: [
			{
				element: ALCH_ELEMENT.WATER,
				possibleShapes: GrowthPaths.SPIN.slice(0, 5),
			},
			{
				element: ALCH_ELEMENT.WATER,
				possibleShapes: [SHAPE_NAME.DOT],
				linkSpots: [1, 0, 0, 0, 0, 0, 0],
				chance: 0.01
			},
		],
	}
};
