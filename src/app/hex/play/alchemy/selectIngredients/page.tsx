'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import AlchemyStoreSlice from '@/store/features/alchemySlice';
import { Recipes } from '@/app/hex/architecture/data/recipes';
import type { AlchemyLabSource, Ingredient, Item, Recipe } from '@/app/hex/architecture/typings';
import InventoryDisplay from '@/app/hex/sharedComponents/inventory/inventory';
import {
	countSelectionUnits,
	filterInventoryAfterConsumption,
	formatRequiredIngredientEntry,
	getInventoryForRequirement,
	partitionInventorySelectionKeys,
} from '@/app/hex/architecture/helpers/recipeRequirements';
import {
	dedupeLabSources,
	labSourcesFromInventorySelection,
} from '@/app/hex/architecture/helpers/alchemyLabSources';
import '../alchemy.css';

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

function SelectIngredientsPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const dispatch = useAppDispatch();
	const recipeId = searchParams.get('recipeId');

	const inventoryItems = useAppSelector((state) => state.Player.inventory.crafted);
	const rawIngredients = useAppSelector((state) => state.Player.inventory.raw);

	const recipe = useMemo(
		() => (recipeId ? Recipes.find((r) => r.id === recipeId) : undefined),
		[recipeId],
	);

	const requiredList = recipe?.requiredIngredients ?? [];
	const isStaged = requiredList.length > 0;

	const [stageIndex, setStageIndex] = useState(0);
	/** One batch per completed stage (same order as `consumptionLog`). */
	const [committedBatches, setCommittedBatches] = useState<AlchemyLabSource[][]>([]);
	const [consumptionLog, setConsumptionLog] = useState<Array<{ rawIds: string[]; craftedItemIds: string[] }>>([]);
	const [consumedRawIds, setConsumedRawIds] = useState<Set<string>>(() => new Set());
	const [consumedCraftedItemIds, setConsumedCraftedItemIds] = useState<Set<string>>(() => new Set());
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());

	useEffect(() => {
		setSelectedKeys(new Set());
	}, [stageIndex]);

	useEffect(() => {
		setStageIndex(0);
		setCommittedBatches([]);
		setConsumptionLog([]);
		setConsumedRawIds(new Set());
		setConsumedCraftedItemIds(new Set());
		setSelectedKeys(new Set());
	}, [recipeId]);

	const currentReq = isStaged ? requiredList[stageIndex] : undefined;

	const stageInventory = useMemo(() => {
		if (!recipe) {
			return {
				ingredients: [] as Ingredient[],
				craftedItems: [] as Item[],
			};
		}
		return buildStageInventory(recipe, stageIndex, rawIngredients, inventoryItems, consumedRawIds, consumedCraftedItemIds);
	}, [recipe, stageIndex, rawIngredients, inventoryItems, consumedRawIds, consumedCraftedItemIds]);

	const needForStage = currentReq ? (currentReq.qty ?? 1) : 0;

	const selectionCount = useMemo(
		() => countSelectionUnits(selectedKeys, inventoryItems, rawIngredients),
		[selectedKeys, inventoryItems, rawIngredients],
	);

	const toggleKey = useCallback(
		(key: string) => {
			setSelectedKeys((prev) => {
				const next = new Set(prev);
				if (next.has(key)) {
					next.delete(key);
					return next;
				}
				if (isStaged && currentReq) {
					const cap = currentReq.qty ?? 1;
					if (countSelectionUnits(prev, inventoryItems, rawIngredients) >= cap) {
						return prev;
					}
				}
				next.add(key);
				return next;
			});
		},
		[isStaged, currentReq, inventoryItems, rawIngredients],
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
			dispatch(AlchemyStoreSlice.actions.clearPlayGrid());
			dispatch(AlchemyStoreSlice.actions.setCurrentRecipe(recipe.id));
			dispatch(AlchemyStoreSlice.actions.addIngredients(dedupeLabSources(chosenLabSourcesLegacy)));
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
		setConsumedRawIds((prev) => {
			const n = new Set(prev);
			consumption.rawIds.forEach((id) => n.add(id));
			return n;
		});
		setConsumedCraftedItemIds((prev) => {
			const n = new Set(prev);
			consumption.craftedItemIds.forEach((id) => n.add(id));
			return n;
		});
		setSelectedKeys(new Set());
		const isLast = stageIndex + 1 >= requiredList.length;
		if (isLast) {
			const allSources = dedupeLabSources([...committedBatches.flat(), ...batch]);
			dispatch(AlchemyStoreSlice.actions.clearPlayGrid());
			dispatch(AlchemyStoreSlice.actions.setCurrentRecipe(recipe.id));
			dispatch(AlchemyStoreSlice.actions.addIngredients(allSources));
			router.push('/hex/play/alchemy');
		} else {
			setCommittedBatches((prev) => [...prev, batch]);
			setConsumptionLog((prev) => [...prev, consumption]);
			setStageIndex((i) => i + 1);
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
		setCommittedBatches((prev) => prev.slice(0, -1));
		setConsumptionLog((prev) => prev.slice(0, -1));
		setConsumedRawIds((prev) => {
			const n = new Set(prev);
			last.rawIds.forEach((id) => n.delete(id));
			return n;
		});
		setConsumedCraftedItemIds((prev) => {
			const n = new Set(prev);
			last.craftedItemIds.forEach((id) => n.delete(id));
			return n;
		});
		setStageIndex((i) => i - 1);
		setSelectedKeys(new Set());
	}, [isStaged, stageIndex, consumptionLog, router]);

	const primaryDisabled = isStaged ? !canProceedStaged : !canProceedLegacy;

	const primaryLabel =
		isStaged && stageIndex + 1 < requiredList.length ? 'Next requirement' : 'Continue to lab';

	if (!recipeId || !recipe) {
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
				<h1>Select ingredients</h1>
				<p className="alchemy-setup-lead">
					Recipe: <strong>{recipe.description}</strong> ({recipe.id})
				</p>
			</header>
			{isStaged && currentReq && (
				<p className="alchemy-setup-hint">
					Stage {stageIndex + 1} of {requiredList.length}:{' '}
					<strong>{formatRequiredIngredientEntry(currentReq)}</strong>
					{needForStage > 1 ? ` — pick ${needForStage} (stacked counts as separate selections).` : ''}
				</p>
			)}
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
			<div className="alchemy-setup-actions">
				<button
					type="button"
					className="alchemy-setup-primary"
					disabled={primaryDisabled || (isStaged && !hasAnythingInStage)}
					onClick={handlePrimary}
				>
					{isStaged ? primaryLabel : 'Continue'}
				</button>
				<button type="button" className="alchemy-setup-secondary" onClick={handleBack}>
					Back
				</button>
			</div>
		</div>
	);
}

export default function SelectIngredientsPage() {
	return (
		<Suspense fallback={<div style={{ padding: '1rem' }}>Loading…</div>}>
			<SelectIngredientsPageContent />
		</Suspense>
	);
}
