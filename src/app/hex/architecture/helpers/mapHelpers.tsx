
import { Ingredient, MapBiome } from "@/app/hex/architecture/typings";
import { CreateIngredient } from '@/app/hex/architecture/factories/ingredientFactory';

export function GatherIngredientsInBiome(biome: MapBiome, count: number) {
	const ingredients: Ingredient[] = [];
	const totalWeighting = biome.nativeIngredients.reduce((acc, curr) => acc + curr.weighting, 0);
	for(let i = 0; i < count; i++) {
		const roll = Math.random() * totalWeighting; // Roll a number between 0 and the total weighting
		let scalingUpperBound = 0;

		for(let j = 0; j < biome.nativeIngredients.length; j++) {
			scalingUpperBound += biome.nativeIngredients[j].weighting;
			if(roll < scalingUpperBound) {
				ingredients.push(CreateIngredient(biome.nativeIngredients[j].ingredient));
				break;
			}
		}
	}
	return ingredients;
}