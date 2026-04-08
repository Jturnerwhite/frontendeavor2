
import { Ingredient, MapBiome } from "@/app/hex/architecture/typings";
import { CreateIngredient } from "./alchHelpers";

export function GatherIngredientsInBiome(biome: MapBiome, count: number) {
	const ingredients: Ingredient[] = [];
	const totalRarity = biome.nativeIngredients.reduce((acc, curr) => acc + curr.rarity, 0);
	const rollRarity = Math.random() * totalRarity;

	for(let i = 0; i < count; i++) {
		biome.nativeIngredients.forEach((nativeIngredient) => {
			if(rollRarity <= nativeIngredient.rarity) {
				const ingredient = CreateIngredient(nativeIngredient.ingredient);
				ingredients.push(ingredient);
			}
		});
	}
	return ingredients;
}