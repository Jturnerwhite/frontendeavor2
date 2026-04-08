
import { Ingredient, MapBiome } from "@/app/hex/architecture/typings";
import { CreateIngredient } from "./alchHelpers";

export function GatherIngredientsInBiome(biome: MapBiome, count: number) {
	const ingredients: Ingredient[] = [];
	const totalWeighting = biome.nativeIngredients.reduce((acc, curr) => acc + curr.weighting, 0);
	console.log(totalWeighting);
	for(let i = 0; i < count; i++) {
		const roll = Math.random() * totalWeighting; // Roll a number between 0 and the total weighting
		console.log("Rolled:",roll);
		let scalingUpperBound = 0;

		for(let j = 0; j < biome.nativeIngredients.length; j++) {
			scalingUpperBound += biome.nativeIngredients[j].weighting;
			if(roll < scalingUpperBound) {
				console.log("Matching ingredient:",biome.nativeIngredients[j].ingredient.name);
				ingredients.push(CreateIngredient(biome.nativeIngredients[j].ingredient));
				break;
			}
		}
	}
	return ingredients;
}