import { MAP_TERRAIN } from "@/app/hex/architecture/enums";
import { MapBiome } from "@/app/hex/architecture/typings";
import { IngedientBases } from "./ingedientBases";

const Biomes = {
	PineBarrens: {
		name: "Pine Barrens",
		description: "A forest is a dense area of trees and plants.",
		terrain: MAP_TERRAIN.FOREST,
		icon: "pine-tree",
		nativeIngredients: [
			{ ingredient: IngedientBases["FruguBerry"], weighting: 1 },
			{ ingredient: IngedientBases["JarbaLeaf"], weighting: 1 },
			{ ingredient: IngedientBases["Pinecap"], weighting: 2 },
		],
	},
	ValleyRidge: {
		name: "Valley Ridge",
		description: "A mountain is a tall peak of rock and soil.",
		terrain: MAP_TERRAIN.MOUNTAIN,
		icon: "peaks",
		nativeIngredients: [
			{ ingredient: IngedientBases["JarbaLeaf"], weighting: 1 },
			{ ingredient: IngedientBases["CragLichen"], weighting: 2 },
		],
	},
	FlowingFields: {
		name: "Flowing Fields",
		description: "A field is a flat area of grass and flowers.",
		terrain: MAP_TERRAIN.FIELD,
		icon: "high-grass",
		nativeIngredients: [
			{ ingredient: IngedientBases["AeridGrass"], weighting: 1 },
			{ ingredient: IngedientBases["Sunpetal"], weighting: 2 },
		],
	}
};

export default Biomes;