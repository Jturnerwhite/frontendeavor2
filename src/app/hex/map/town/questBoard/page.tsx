'use client';
import InventoryDisplay from '@/app/hex/sharedComponents/inventory/inventory';
import { RootState } from '@/store/store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Item, IngredientBase, Ingredient, QuestRequirement, Quest, Recipe} from '@/app/hex/architecture/typings';
import { Recipes } from '@/app/hex/architecture/data/recipes';
import { ITEM_TAG } from '@/app/hex/architecture/enums';
import { IngredientBases } from '@/app/hex/architecture/data/ingredientBases';

export default function QuestBoard() {
	const dispatch = useDispatch();
	const [selectedQuest, setSelectedQuest] = useState<Quest | undefined>(undefined);
	const [currentRequirement, setCurrentRequirement] = useState<{qr: QuestRequirement, index: number} | undefined>(undefined);
	const inventoryItems = useSelector((state: RootState) => state.Player.inventory.crafted);
	const ingredients = useSelector((state: RootState) => state.Player.inventory.raw);
	//const quests = useSelector((state: RootState) => state.Player.quests);

	function getInventoryForRequirement(): JSX.Element {
		let invToShow:Array<Item> = [];
		let ingsToShow:Array<Ingredient> = [];
		if(selectedQuest === undefined || currentRequirement !== undefined) {
			return <></>;
		}

		const currentReqData = currentRequirement!.qr;
		switch(currentReqData.requirementKind) {
			case 'ingredient':
				ingsToShow = ingredients.filter(ingredient => ingredient.baseIngId === (currentReqData.itemType as IngredientBase).id);
				break;
			case 'tag':
				invToShow = inventoryItems.filter(item => item.types.includes(currentReqData.itemType as ITEM_TAG));
				ingsToShow = ingredients.filter(ingredient => (IngredientBases[ingredient.baseIngId]?.types.includes(currentReqData.itemType as ITEM_TAG)));
				break;
			case 'recipe':
				invToShow = inventoryItems.filter(item => item.baseRecipeId === (currentReqData.itemType as Recipe).id);
				break;
		}
		return <InventoryDisplay inventoryItems={invToShow} ingredients={ingsToShow} />;
	}

	function selectQuest(quest: Quest) {
		setSelectedQuest(quest);
		setCurrentRequirement(undefined);
	}

	return (
		<div className="quest-board">
			{!selectedQuest && (<>
				<h1>Quest Board</h1>
			</>)}
			{selectedQuest && currentRequirement !== undefined && (getInventoryForRequirement())}
		</div>
	);
}