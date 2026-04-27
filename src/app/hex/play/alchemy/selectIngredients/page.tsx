'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { AppDispatch } from '@/store/store';
import AlchemyStoreSlice from '@/store/features/alchemySlice';
import { Recipes } from '@/app/hex/architecture/data/recipes';
import type {
	AlchemyLabSource,
	Ingredient,
	IngredientBase,
	Item,
	Recipe,
	RecipeRequiredIngredient,
} from '@/app/hex/architecture/typings';
import { ITEM_TAG } from '@/app/hex/architecture/enums';
import InventoryDisplay from '@/app/hex/sharedComponents/inventory/inventory';
import RequiredItem from '@/app/hex/sharedComponents/requiredItem/requiredItem';
import {
	countSelectionUnits,
	filterInventoryAfterConsumption,
	getInventoryForRequirement,
	partitionInventorySelectionKeys,
} from '@/app/hex/architecture/helpers/recipeRequirements';
import {
	dedupeLabSources,
	labSourcesFromInventorySelection,
} from '@/app/hex/architecture/helpers/alchemyLabSources';
import '@/app/hex/play/alchemy/alchemy.css';

type StageInventory = {
	ingredients: Ingredient[];
	craftedItems: Item[];
};

function buildStageInventory(
	recipe: Recipe,
	stageIndex: number,
	rawIngredients: Ingredient[],
	inventoryItems: Item[],
	consumedRawIds: Set<string>,
	consumedCraftedItemIds: Set<string>,
): StageInventory {
	const reqList = recipe.requiredIngredients ?? [];
	if (reqList.length === 0) {
		return {
			ingredients: rawIngredients,
			craftedItems: inventoryItems,
		};
	}
	const currentReq = reqList[stageIndex];
	const base = getInventoryForRequirement(currentReq, rawIngredients, inventoryItems);
	const after = filterInventoryAfterConsumption(
		base.ingredients,
		base.craftedEntries,
		consumedRawIds,
		consumedCraftedItemIds,
	);
	return {
		ingredients: after.ingredients,
		craftedItems: after.craftedEntries.map((e) => e.item),
	};
}

function enterLab(dispatch: AppDispatch, recipeId: string, sources: AlchemyLabSource[]) {
	dispatch(AlchemyStoreSlice.actions.clearPlayGrid());
	dispatch(AlchemyStoreSlice.actions.clearIngredientSelectionSetup());
	dispatch(AlchemyStoreSlice.actions.setCurrentRecipe(recipeId));
	dispatch(AlchemyStoreSlice.actions.addIngredients(dedupeLabSources(sources)));
}

export default function SelectIngredientsPage() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const setupRecipeId = useAppSelector((s) => s.Alchemy.setupRecipeId);
	const ingredientSelectionSetup = useAppSelector((s) => s.Alchemy.ingredientSelectionSetup);

	const inventoryItems = useAppSelector((state) => state.Player.inventory.crafted);
	const rawIngredients = useAppSelector((state) => state.Player.inventory.raw);

	const recipe = useMemo(
		() => (setupRecipeId ? Recipes.find((r) => r.id === setupRecipeId) : undefined),
		[setupRecipeId],
	);

	const requiredList = recipe?.requiredIngredients ?? [];
	const isStaged = requiredList.length > 0;

	const stageIndex = ingredientSelectionSetup.stageIndex;
	const committedBatches = ingredientSelectionSetup.committedBatches;
	const consumptionLog = ingredientSelectionSetup.consumptionLog;
	const consumedRawIds = useMemo(
		() => new Set(ingredientSelectionSetup.consumedRawIds),
		[ingredientSelectionSetup.consumedRawIds],
	);
	const consumedCraftedItemIds = useMemo(
		() => new Set(ingredientSelectionSetup.consumedCraftedItemIds),
		[ingredientSelectionSetup.consumedCraftedItemIds],
	);
	const selectedKeys = useMemo(
		() => new Set(ingredientSelectionSetup.selectedKeys),
		[ingredientSelectionSetup.selectedKeys],
	);

	const currentReq = isStaged ? requiredList[stageIndex] : undefined;

	const stageInventory = useMemo(() => {
		if (!recipe) {
			return {
				ingredients: [] as Ingredient[],
				craftedItems: [] as Item[],
			};
		}
		return buildStageInventory(
			recipe,
			stageIndex,
			rawIngredients,
			inventoryItems,
			consumedRawIds,
			consumedCraftedItemIds,
		);
	}, [recipe, stageIndex, rawIngredients, inventoryItems, consumedRawIds, consumedCraftedItemIds]);

	const needForStage = currentReq ? (currentReq.qty ?? 1) : 0;

	const selectionCount = useMemo(
		() => countSelectionUnits(selectedKeys, inventoryItems, rawIngredients),
		[selectedKeys, inventoryItems, rawIngredients],
	);

	const patchSetup = useCallback(
		(patch: Partial<typeof ingredientSelectionSetup>) => {
			dispatch(
				AlchemyStoreSlice.actions.replaceIngredientSelectionSetup({
					...ingredientSelectionSetup,
					...patch,
					// nested arrays: always pass full new setup from callers that replace wholesale
				}),
			);
		},
		[dispatch, ingredientSelectionSetup],
	);

	const toggleKey = useCallback(
		(key: string) => {
			const next = new Set(ingredientSelectionSetup.selectedKeys);
			if (next.has(key)) {
				next.delete(key);
			} else if (isStaged && currentReq) {
				const cap = currentReq.qty ?? 1;
				if (countSelectionUnits(new Set(ingredientSelectionSetup.selectedKeys), inventoryItems, rawIngredients) >= cap) {
					return;
				}
				next.add(key);
			} else {
				next.add(key);
			}
			patchSetup({ selectedKeys: [...next] });
		},
		[
			ingredientSelectionSetup.selectedKeys,
			isStaged,
			currentReq,
			inventoryItems,
			rawIngredients,
			patchSetup,
		],
	);

	const hasAnythingInStage =
		stageInventory.ingredients.length > 0 || stageInventory.craftedItems.length > 0;

	const hasAnythingInInventory = rawIngredients.length > 0 || inventoryItems.length > 0;

	const canProceedStaged =
		isStaged &&
		currentReq &&
		hasAnythingInStage &&
		selectionCount >= needForStage &&
		needForStage > 0;

	const chosenLabSourcesLegacy = useMemo(
		() => labSourcesFromInventorySelection(selectedKeys, inventoryItems, rawIngredients),
		[selectedKeys, inventoryItems, rawIngredients],
	);

	const canProceedLegacy = !isStaged && chosenLabSourcesLegacy.length > 0;

	const handlePrimary = useCallback(() => {
		if (!recipe) return;
		if (!isStaged) {
			if (chosenLabSourcesLegacy.length === 0) return;
			enterLab(dispatch, recipe.id, chosenLabSourcesLegacy);
			router.push('/hex/play/alchemy');
			return;
		}
		if (!currentReq || !canProceedStaged) return;
		const batch = labSourcesFromInventorySelection(selectedKeys, inventoryItems, rawIngredients);
		const consumption = partitionInventorySelectionKeys(
			selectedKeys,
			stageInventory.ingredients,
			stageInventory.craftedItems,
		);
		const newConsumedRaw = new Set(ingredientSelectionSetup.consumedRawIds);
		consumption.rawIds.forEach((id) => newConsumedRaw.add(id));
		const newConsumedCrafted = new Set(ingredientSelectionSetup.consumedCraftedItemIds);
		consumption.craftedItemIds.forEach((id) => newConsumedCrafted.add(id));

		const isLast = stageIndex + 1 >= requiredList.length;
		if (isLast) {
			const allSources = dedupeLabSources([...committedBatches.flat(), ...batch]);
			enterLab(dispatch, recipe.id, allSources);
			router.push('/hex/play/alchemy');
		} else {
			dispatch(
				AlchemyStoreSlice.actions.replaceIngredientSelectionSetup({
					...ingredientSelectionSetup,
					stageIndex: stageIndex + 1,
					committedBatches: [...ingredientSelectionSetup.committedBatches, batch],
					consumptionLog: [...ingredientSelectionSetup.consumptionLog, consumption],
					consumedRawIds: [...newConsumedRaw],
					consumedCraftedItemIds: [...newConsumedCrafted],
					selectedKeys: [],
				}),
			);
		}
	}, [
		recipe,
		isStaged,
		currentReq,
		canProceedStaged,
		chosenLabSourcesLegacy,
		selectedKeys,
		stageInventory.ingredients,
		stageInventory.craftedItems,
		inventoryItems,
		rawIngredients,
		committedBatches,
		stageIndex,
		requiredList.length,
		dispatch,
		router,
		ingredientSelectionSetup,
	]);

	const handleBack = useCallback(() => {
		if (!isStaged || stageIndex === 0) {
			router.push('/hex/play/alchemy/selectRecipe');
			return;
		}
		const last = consumptionLog[consumptionLog.length - 1];
		if (!last) {
			router.push('/hex/play/alchemy/selectRecipe');
			return;
		}
		const newConsumedRaw = new Set(ingredientSelectionSetup.consumedRawIds);
		last.rawIds.forEach((id) => newConsumedRaw.delete(id));
		const newConsumedCrafted = new Set(ingredientSelectionSetup.consumedCraftedItemIds);
		last.craftedItemIds.forEach((id) => newConsumedCrafted.delete(id));
		dispatch(
			AlchemyStoreSlice.actions.replaceIngredientSelectionSetup({
				...ingredientSelectionSetup,
				stageIndex: stageIndex - 1,
				committedBatches: ingredientSelectionSetup.committedBatches.slice(0, -1),
				consumptionLog: ingredientSelectionSetup.consumptionLog.slice(0, -1),
				consumedRawIds: [...newConsumedRaw],
				consumedCraftedItemIds: [...newConsumedCrafted],
				selectedKeys: [],
			}),
		);
	}, [isStaged, stageIndex, consumptionLog, router, dispatch, ingredientSelectionSetup]);

	const primaryDisabled = isStaged ? !canProceedStaged : !canProceedLegacy;

	const primaryLabel =
		isStaged && stageIndex + 1 < requiredList.length ? 'Next requirement' : 'Continue to lab';

	function countSelectedUnitsForStage(index: number): number {
		if (!isStaged) return 0;
		if (index < stageIndex) {
			const committed = consumptionLog[index];
			if (!committed) return 0;
			return committed.rawIds.length + committed.craftedItemIds.length;
		}
		if (index === stageIndex) {
			return selectedKeys.size;
		}
		return 0;
	}

	function getRequirementDisplay(requirement: RecipeRequiredIngredient, index: number): JSX.Element {
		const need = requirement.qty ?? 1;
		const selected = countSelectedUnitsForStage(index);
		const satisfied = selected >= need;

		if (typeof requirement.type === 'string') {
			const tag = requirement.type as ITEM_TAG;
			return (
				<RequiredItem
					key={`req-item-${index}`}
					name={tag.toString()}
					imgSource={`/icons/itemTypes/${tag.toLowerCase().replace(' ', '_')}.svg`}
					qty={need}
					addClassName={satisfied ? 'satisfied' : ''}
				/>
			);
		}
		const base = requirement.type as IngredientBase;
		return (
			<RequiredItem
				key={`req-item-${index}`}
				name={base.name}
				imgSource={base.image ?? ''}
				qty={need}
				addClassName={satisfied ? 'satisfied' : ''}
			/>
		);
	}

	if (!setupRecipeId || !recipe) {
		return (
			<div className="alchemy-setup-flow">
				<h1>Invalid recipe</h1>
				<p className="alchemy-setup-lead">Choose a recipe from the list first.</p>
				<p>
					<Link href="/hex/play/alchemy/selectRecipe" className="alchemy-setup-link">
						Back to recipes
					</Link>
				</p>
			</div>
		);
	}

	return (
		<div className="alchemy-setup-flow">
			<header className="alchemy-setup-header">
				<div className="alchemy-setup-actions">
					<button type="button" className="alchemy-setup-primary" onClick={handleBack}>
						Back
					</button>
					<div>
						<h1>Select ingredients</h1>
						<p className="alchemy-setup-lead">
							Recipe: <strong>{recipe.description}</strong> ({recipe.id})
						</p>
					</div>
					<button
						type="button"
						className="alchemy-setup-primary"
						disabled={primaryDisabled || (isStaged && !hasAnythingInStage)}
						onClick={handlePrimary}
					>
						{isStaged ? primaryLabel : 'Continue'}
					</button>
				</div>
				{isStaged && (
					<div className="required-items">
						{requiredList.map((r, index) => getRequirementDisplay(r, index))}
					</div>
				)}
			</header>
			{!isStaged && (
				<p className="alchemy-setup-hint">
					Choose raw materials or crafted items from your inventory. Crafted items add the ingredients they were
					made from.
				</p>
			)}
			{!hasAnythingInInventory ? (
				<p className="alchemy-setup-lead">
					Your inventory is empty. Gather ingredients on the{' '}
					<Link href="/hex/map" className="alchemy-setup-link">
						map
					</Link>{' '}
					first.
				</p>
			) : isStaged && !hasAnythingInStage ? (
				<p className="alchemy-setup-lead alchemy-required-list--missing">
					Nothing left in your inventory matches this requirement. Gather more or finish other stages first.
				</p>
			) : (
				<InventoryDisplay
					inventoryItems={stageInventory.craftedItems}
					ingredients={stageInventory.ingredients}
					hideFiltering={true}
					hideSorting={true}
					hideSubFiltering={true}
					hideSubSorting={true}
					selectable={true}
					selectedKeys={selectedKeys}
					onToggleKey={toggleKey}
					showTitle={false}
				/>
			)}
		</div>
	);
}
