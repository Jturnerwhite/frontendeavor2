import { Quest } from "@/app/hex/architecture/typings";
import { Recipes } from "./recipes";
import { IngredientBases } from "./ingredientBases";


const BaseQuests: Array<Quest> = [
	{
		id: 'hp-supplies',
		name: 'Hospital Supplies',
		description: 'The local hospital always needs more HP Potions.',
		rewards: [],
		requirements: [
			{
				requirementKind: 'recipe',
				itemType: Recipes.find((recipe) => recipe.id === 'HP-1')!,
				qty: 1,
			},
		],
		repeatable: true,
		gold: 4,
	},
	{
		id: 'mana-supplies',
		name: 'Mana Pots Needed',
		description: 'A local mage seems to have an addiction...',
		rewards: [],
		requirements: [
			{
				requirementKind: 'recipe',
				itemType: Recipes.find((recipe) => recipe.id === 'MANA-1')!,
				qty: 1,
			},
		],
		repeatable: true,
		gold: 4,
	},
	{
		id: 'sunpetals-needed',
		name: 'Sunpetals Needed',
		description: 'A local mage seems to have an addiction...',
		rewards: [],
		requirements: [
			{
				requirementKind: 'ingredient',
				itemType: IngredientBases['Sunpetal']!,
				qty: 4,
			},
		],
		repeatable: true,
		gold: 4,
	},
]

/** Default quest ids offered on a new save (catalog lives in `BaseQuests`). */
export const defaultAvailableQuestIds: string[] = BaseQuests.map((q) => q.id)

export { BaseQuests }