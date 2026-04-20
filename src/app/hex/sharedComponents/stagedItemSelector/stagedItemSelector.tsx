'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Ingredient, Item } from '@/app/hex/architecture/typings'
import {
	countSelectionUnits,
	partitionInventorySelectionKeys,
} from '@/app/hex/architecture/helpers/recipeRequirements'
import InventoryDisplay from '@/app/hex/sharedComponents/inventory/inventory'

/** Inventory subset available to select during a single stage. */
export interface StagedInventory {
	ingredients: Ingredient[]
	craftedItems: Item[]
}

/** One committed selection, emitted in stage order from `onComplete`. */
export interface StagedSelectionBatch {
	rawIds: string[]
	craftedItemIds: string[]
	/** Raw `InventoryDisplay` row keys chosen for this stage (ingredient/item ids). */
	selectedKeys: string[]
}

/** Live snapshot of the selector's stage progress (fed to `onSelectionChange`). */
export interface StagedSelectionSnapshot {
	/** Index of the stage the user is currently selecting for. */
	stageIndex: number
	/** Batches already committed (one per stage before `stageIndex`). */
	committedBatches: StagedSelectionBatch[]
	/** Keys picked so far in the current (uncommitted) stage. */
	currentSelectedKeys: string[]
}

export interface StagedItemSelectorProps<TStage> {
	stages: readonly TStage[]
	rawInventory: Ingredient[]
	craftedInventory: Item[]
	/** Compute the inventory shown for the given stage, after prior stage consumption. */
	buildStageInventory: (
		stage: TStage,
		raw: Ingredient[],
		crafted: Item[],
		consumedRawIds: Set<string>,
		consumedCraftedItemIds: Set<string>,
	) => StagedInventory
	/** Max selectable units for this stage. Returned value <= 0 disables advancing. */
	getStageCap: (stage: TStage) => number
	/** Optional per-stage hint rendered above the inventory (e.g. "Step 1 of 3: ..."). */
	renderStageHint?: (stage: TStage, index: number, total: number) => React.ReactNode
	/** Shown instead of the inventory when the current stage has nothing matching. */
	emptyStageMessage?: React.ReactNode
	/** Called with the batches (one per stage) after the final stage is committed. */
	onComplete: (batches: StagedSelectionBatch[]) => void
	/** Called when the user backs out of the first stage. */
	onCancel: () => void
	/** Fires whenever the stage index, committed batches, or current selection changes. */
	onSelectionChange?: (snapshot: StagedSelectionSnapshot) => void
	primaryLabel?: string
	finalPrimaryLabel?: string
	backLabel?: string
	cancelLabel?: string
	/** Class applied to the actions row `<div>`. Defaults match the quest-board theme. */
	actionsClassName?: string
	primaryClassName?: string
	secondaryClassName?: string
}

export default function StagedItemSelector<TStage>({
	stages,
	rawInventory,
	craftedInventory,
	buildStageInventory,
	getStageCap,
	renderStageHint,
	emptyStageMessage,
	onComplete,
	onCancel,
	onSelectionChange,
	primaryLabel = 'Continue',
	finalPrimaryLabel = 'Turn In',
	backLabel = 'Back',
	cancelLabel = 'Cancel',
	actionsClassName = 'quest-board-actions',
	primaryClassName = 'quest-board-primary',
	secondaryClassName = 'quest-board-secondary',
}: StagedItemSelectorProps<TStage>) {
	const [stageIndex, setStageIndex] = useState(0)
	const [consumedRawIds, setConsumedRawIds] = useState<Set<string>>(() => new Set())
	const [consumedCraftedItemIds, setConsumedCraftedItemIds] = useState<Set<string>>(
		() => new Set(),
	)
	const [consumptionLog, setConsumptionLog] = useState<StagedSelectionBatch[]>([])
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set())

	// Reset flow whenever the parent swaps to a different stage list (e.g. new quest / recipe).
	useEffect(() => {
		setStageIndex(0)
		setConsumedRawIds(new Set())
		setConsumedCraftedItemIds(new Set())
		setConsumptionLog([])
		setSelectedKeys(new Set())
	}, [stages])

	useEffect(() => {
		setSelectedKeys(new Set())
	}, [stageIndex])

	useEffect(() => {
		onSelectionChange?.({
			stageIndex,
			committedBatches: consumptionLog,
			currentSelectedKeys: Array.from(selectedKeys),
		})
	}, [stageIndex, consumptionLog, selectedKeys, onSelectionChange])

	const currentStage = stages[stageIndex]
	const totalStages = stages.length

	const stageInventory = useMemo<StagedInventory>(() => {
		if (currentStage === undefined) {
			return { ingredients: [], craftedItems: [] }
		}
		return buildStageInventory(
			currentStage,
			rawInventory,
			craftedInventory,
			consumedRawIds,
			consumedCraftedItemIds,
		)
	}, [
		currentStage,
		rawInventory,
		craftedInventory,
		consumedRawIds,
		consumedCraftedItemIds,
		buildStageInventory,
	])

	const stageCap = currentStage !== undefined ? getStageCap(currentStage) : 0

	const selectionCount = useMemo(
		() => countSelectionUnits(selectedKeys, craftedInventory, rawInventory),
		[selectedKeys, craftedInventory, rawInventory],
	)

	const toggleKey = useCallback(
		(key: string) => {
			setSelectedKeys((prev) => {
				const next = new Set(prev)
				if (next.has(key)) {
					next.delete(key)
					return next
				}
				if (stageCap > 0) {
					if (countSelectionUnits(prev, craftedInventory, rawInventory) >= stageCap) {
						return prev
					}
				}
				next.add(key)
				return next
			})
		},
		[stageCap, craftedInventory, rawInventory],
	)

	const hasStageItems =
		stageInventory.ingredients.length > 0 || stageInventory.craftedItems.length > 0

	const canProceed =
		currentStage !== undefined &&
		hasStageItems &&
		stageCap > 0 &&
		selectionCount >= stageCap

	const handleContinue = useCallback(() => {
		if (currentStage === undefined || !canProceed) return
		const partition = partitionInventorySelectionKeys(
			selectedKeys,
			stageInventory.ingredients,
			stageInventory.craftedItems,
		)
		const batch: StagedSelectionBatch = {
			rawIds: partition.rawIds,
			craftedItemIds: partition.craftedItemIds,
			selectedKeys: Array.from(selectedKeys),
		}

		const isLast = stageIndex + 1 >= totalStages
		if (isLast) {
			onComplete([...consumptionLog, batch])
			return
		}

		setConsumedRawIds((prev) => {
			const n = new Set(prev)
			batch.rawIds.forEach((id) => n.add(id))
			return n
		})
		setConsumedCraftedItemIds((prev) => {
			const n = new Set(prev)
			batch.craftedItemIds.forEach((id) => n.add(id))
			return n
		})
		setConsumptionLog((prev) => [...prev, batch])
		setSelectedKeys(new Set())
		setStageIndex((i) => i + 1)
	}, [
		currentStage,
		canProceed,
		selectedKeys,
		stageInventory.ingredients,
		stageInventory.craftedItems,
		stageIndex,
		totalStages,
		consumptionLog,
		onComplete,
	])

	const handleBack = useCallback(() => {
		if (stageIndex === 0) {
			onCancel()
			return
		}
		const last = consumptionLog[consumptionLog.length - 1]
		if (!last) {
			onCancel()
			return
		}
		setConsumptionLog((prev) => prev.slice(0, -1))
		setConsumedRawIds((prev) => {
			const n = new Set(prev)
			last.rawIds.forEach((id) => n.delete(id))
			return n
		})
		setConsumedCraftedItemIds((prev) => {
			const n = new Set(prev)
			last.craftedItemIds.forEach((id) => n.delete(id))
			return n
		})
		setStageIndex((i) => i - 1)
		setSelectedKeys(new Set())
	}, [stageIndex, consumptionLog, onCancel])

	const isFinalStage = stageIndex + 1 >= totalStages
	const primaryText = isFinalStage ? finalPrimaryLabel : primaryLabel
	const backText = stageIndex === 0 ? cancelLabel : backLabel

	return (
		<>
			{currentStage !== undefined && renderStageHint?.(currentStage, stageIndex, totalStages)}
			{!hasStageItems ? (
				emptyStageMessage ?? (
					<p className="quest-board-lead">
						Nothing in your inventory matches this step with what you have left. Use{' '}
						{backLabel} to change an earlier choice or gather more.
					</p>
				)
			) : (
				<InventoryDisplay
					inventoryItems={stageInventory.craftedItems}
					ingredients={stageInventory.ingredients}
					hideFiltering
					hideSorting
					hideSubFiltering
					hideSubSorting
					selectable
					selectedKeys={selectedKeys}
					onToggleKey={toggleKey}
					showTitle={false}
				/>
			)}
			<div className={actionsClassName}>
				<button type="button" className={secondaryClassName} onClick={handleBack}>
					{backText}
				</button>
				<button
					type="button"
					className={primaryClassName}
					disabled={!canProceed}
					onClick={handleContinue}
				>
					{primaryText}
				</button>
			</div>
		</>
	)
}
