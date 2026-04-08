import { MAP_TERRAIN } from "@/app/hex/architecture/enums";
import { MapBiome } from "@/app/hex/architecture/typings";
import { IngedientBases } from "./ingedientBases";

const Biomes = {
	PineBarrens: {
		name: "Pine Barrens",
		description: "A forest is a dense area of trees and plants.",
		terrain: MAP_TERRAIN.FOREST,
		nativeIngredients: [
			{ ingredient: IngedientBases["FruguBerry"], rarity: 1 },
			{ ingredient: IngedientBases["Pinecap"], rarity: 2 },
		],
	},
	ValleyRidge: {
		name: "Valley Ridge",
		description: "A mountain is a tall peak of rock and soil.",
		terrain: MAP_TERRAIN.MOUNTAIN,
		nativeIngredients: [
			{ ingredient: IngedientBases["JarbaLeaf"], rarity: 1 },
			{ ingredient: IngedientBases["CragLichen"], rarity: 2 },
		],
	},
	FlowingFields: {
		name: "Flowing Fields",
		description: "A field is a flat area of grass and flowers.",
		terrain: MAP_TERRAIN.FIELD,
		nativeIngredients: [
			{ ingredient: IngedientBases["AeridGrass"], rarity: 1 },
			{ ingredient: IngedientBases["Sunpetal"], rarity: 2 },
		],
	}
};

export default Biomes;