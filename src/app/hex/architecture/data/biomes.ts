import { MAP_TERRAIN } from "@/app/hex/architecture/enums";
import { MapBiome } from "@/app/hex/architecture/typings";
import { IngredientBases } from './ingredientBases';

const Biomes = {
	PineBarrens: {
		id: "PineBarrens",
		name: "Pine Barrens",
		description: "A forest is a dense area of trees and plants.",
		terrain: MAP_TERRAIN.FOREST,
		icon: "pine-tree",
		nativeIngredients: [
			{ ingredient: IngredientBases["FruguBerry"], weighting: 15 },
			{ ingredient: IngredientBases["Pinecap"], weighting: 12 },
			{ ingredient: IngredientBases["PineWood"], weighting: 15 },
		],
	},
	ValleyRidge: {
		id: "ValleyRidge",
		name: "Valley Ridge",
		description: "A mountain is a tall peak of rock and soil.",
		terrain: MAP_TERRAIN.MOUNTAIN,
		icon: "peaks",
		nativeIngredients: [
			{ ingredient: IngredientBases["JarbaLeaf"], weighting: 1 },
			{ ingredient: IngredientBases["CragLichen"], weighting: 2 },
		],
	},
	FlowingFields: {
		id: "FlowingFields",
		name: "Flowing Fields",
		description: "A field is a flat area of grass and flowers.",
		terrain: MAP_TERRAIN.FIELD,
		icon: "high-grass",
		nativeIngredients: [
			{ ingredient: IngredientBases["AeridGrass"], weighting: 1 },
			{ ingredient: IngredientBases["Sunpetal"], weighting: 2 },
		],
	},
	LacrimoseLake: {
		id: "LacrimoseLake",
		name: "Lacrimose Lake",
		description: "A lake is a body of water.",
		terrain: MAP_TERRAIN.LAKE,
		icon: "lake",
		nativeIngredients: [
			{ ingredient: IngredientBases["Frillish"], weighting: 10 },
			{ ingredient: IngredientBases["JusThead"], weighting: 5 },
			{ ingredient: IngredientBases["Grumbo"], weighting: 1 },
		],
	},
};

export default Biomes;