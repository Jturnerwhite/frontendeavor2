import { Quest } from "@/app/hex/architecture/typings";
import { Recipes } from "./recipes";


const BaseQuests: Array<Quest> = [
	{
		id: 'quest-hp-supplies',
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
		id: 'quest-mana-supplies',
		name: 'Mighty Mana Pots Needed',
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
]

/** Default quest ids offered on a new save (catalog lives in `BaseQuests`). */
export const defaultAvailableQuestIds: string[] = BaseQuests.map((q) => q.id)

export { BaseQuests }