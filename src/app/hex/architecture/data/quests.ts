import { Quest } from "@/app/hex/architecture/typings";
import { Recipes } from "./recipes";


const BaseQuests:Array<Quest> = [
	{
		id: '1',
		name: 'Hospital Supplies',
		description: 'The local hospital always needs more HP Potions.',
		rewards: [],
		requirements: [
			{
				itemType: Recipes.find(recipe => recipe.id === 'HP-1')!,
				qty: 4,
			},
		],
		repeatable: true,
		gold: 4,
	},
	{
		id: '1',
		name: 'Mighty Mana Pots Needed',
		description: 'A local mage seems to have an addiction...',
		rewards: [],
		requirements: [
			{
				itemType: Recipes.find(recipe => recipe.id === 'MANA-1')!,
				qty: 4,
			},
		],
		repeatable: true,
		gold: 4,
	},
];

export { BaseQuests };