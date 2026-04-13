'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { Ingredient, IngredientBase, Item, Quest, QuestRequirement } from '@/app/hex/architecture/typings'
import { BaseQuests } from '@/app/hex/architecture/data/quests'
import {
	buildQuestStageInventory,
	formatQuestRequirement,
	playerCanCompleteQuestInOrder,
} from '@/app/hex/architecture/helpers/questRequirements'
import {
	countSelectionUnits,
} from '@/app/hex/architecture/helpers/recipeRequirements'
import { CreateIngredient } from '@/app/hex/architecture/factories/ingredientFactory'
import InventoryDisplay, { craftedRowKey } from '@/app/hex/sharedComponents/inventory/inventory'
import PlayerStoreSlice from '@/store/features/playerSlice'
import HistoryStoreSlice from '@/store/features/historySlice'
import { RootState } from '@/store/store'
import '@/app/hex/play/alchemy/alchemy.css'

function collectConsumptionFromKeys(selectedKeys: Set<string>): {
	rawIds: string[]
	craftedIndices: number[]
} {
	const rawIds: string[] = []
	const craftedIndices: number[] = []
	for (const k of selectedKeys) {
		if (k.startsWith('crafted:')) {
			const idx = Number(k.slice('crafted:'.length))
			if (!Number.isNaN(idx)) craftedIndices.push(idx)
		} else {
			rawIds.push(k)
		}
	}
	return { rawIds, craftedIndices }
}

function isIngredientBaseReward(r: Item | IngredientBase): r is IngredientBase {
	return 'possibleComps' in r && Array.isArray((r as IngredientBase).possibleComps)
}

export default function QuestBoard() {
	const dispatch = useDispatch()
	const inventoryItems = useSelector((state: RootState) => state.Player.inventory.crafted)
	const rawIngredients = useSelector((state: RootState) => state.Player.inventory.raw)
	const availableQuestIds = useSelector((state: RootState) => state.Player.availableQuestIds)
	const completedQuestIds = useSelector((state: RootState) => state.History.completedQuestIds)

	const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
	const [showComplete, setShowComplete] = useState(false)
	const [requirementIndex, setRequirementIndex] = useState(0)
	const [consumedRawIds, setConsumedRawIds] = useState<Set<string>>(() => new Set())
	const [consumedCraftedIndices, setConsumedCraftedIndices] = useState<Set<number>>(
		() => new Set(),
	)
	const [consumptionLog, setConsumptionLog] = useState<
		Array<{ rawIds: string[]; craftedIndices: number[] }>
	>([])
	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set())

	const completedAtLeastOnce = useMemo(
		() => new Set(completedQuestIds),
		[completedQuestIds],
	)

	const visibleQuests = useMemo(() => {
		const out: Quest[] = []
		for (const id of availableQuestIds) {
			const q = BaseQuests.find((x) => x.id === id)
			if (!q) continue
			if (q.repeatable || !completedAtLeastOnce.has(q.id)) {
				out.push(q)
			}
		}
		return out
	}, [availableQuestIds, completedAtLeastOnce])

	const requirements = selectedQuest?.requirements ?? []
	const currentReq: QuestRequirement | undefined = requirements[requirementIndex]

	const stageInventory = useMemo(() => {
		if (!currentReq) {
			return {
				ingredients: [] as Ingredient[],
				craftedItems: [] as Item[],
				craftedEntries: [] as { item: Item; index: number }[],
			}
		}
		return buildQuestStageInventory(
			currentReq,
			rawIngredients,
			inventoryItems,
			consumedRawIds,
			consumedCraftedIndices,
		)
	}, [
		currentReq,
		rawIngredients,
		inventoryItems,
		consumedRawIds,
		consumedCraftedIndices,
	])

	const needForStage = currentReq ? (currentReq.qty ?? 1) : 0

	const selectionCount = useMemo(
		() => countSelectionUnits(selectedKeys, inventoryItems, rawIngredients),
		[selectedKeys, inventoryItems, rawIngredients],
	)

	useEffect(() => {
		setSelectedKeys(new Set())
	}, [requirementIndex])

	const resetActiveQuestFlow = useCallback(() => {
		setRequirementIndex(0)
		setConsumedRawIds(new Set())
		setConsumedCraftedIndices(new Set())
		setConsumptionLog([])
		setSelectedKeys(new Set())
		setShowComplete(false)
	}, [])

	const openQuest = useCallback(
		(quest: Quest) => {
			setSelectedQuest(quest)
			resetActiveQuestFlow()
			if (quest.requirements.length === 0) {
				const rewardItems: Item[] = []
				const rewardIngredients: Ingredient[] = []
				for (const r of quest.rewards) {
					if (isIngredientBaseReward(r)) {
						rewardIngredients.push(CreateIngredient(r))
					} else {
						rewardItems.push(r)
					}
				}
				dispatch(
					PlayerStoreSlice.actions.applyQuestRewards({
						gold: quest.gold,
						xp: quest.xp,
						items: rewardItems.length ? rewardItems : undefined,
						ingredients: rewardIngredients.length ? rewardIngredients : undefined,
					}),
				)
				dispatch(HistoryStoreSlice.actions.recordCompletedQuest({ questId: quest.id }))
				if (!quest.repeatable) {
					dispatch(PlayerStoreSlice.actions.removeAvailableQuestId(quest.id))
				}
				setShowComplete(true)
			}
		},
		[resetActiveQuestFlow, dispatch],
	)

	const closeQuest = useCallback(() => {
		setSelectedQuest(null)
		resetActiveQuestFlow()
	}, [resetActiveQuestFlow])

	const toggleKey = useCallback(
		(key: string) => {
			setSelectedKeys((prev) => {
				const next = new Set(prev)
				if (next.has(key)) {
					next.delete(key)
					return next
				}
				if (currentReq) {
					const cap = currentReq.qty ?? 1
					if (countSelectionUnits(prev, inventoryItems, rawIngredients) >= cap) {
						return prev
					}
				}
				next.add(key)
				return next
			})
		},
		[currentReq, inventoryItems, rawIngredients],
	)

	const canProceed =
		currentReq != null &&
		selectionCount >= needForStage &&
		needForStage > 0 &&
		(stageInventory.ingredients.length > 0 || stageInventory.craftedItems.length > 0)

	const handleContinue = useCallback(() => {
		if (!selectedQuest || !currentReq || !canProceed) return
		const batch = collectConsumptionFromKeys(selectedKeys)
		const nextConsumedRaw = new Set(consumedRawIds)
		batch.rawIds.forEach((id) => nextConsumedRaw.add(id))
		const nextConsumedCrafted = new Set(consumedCraftedIndices)
		batch.craftedIndices.forEach((i) => nextConsumedCrafted.add(i))
		setConsumedRawIds(nextConsumedRaw)
		setConsumedCraftedIndices(nextConsumedCrafted)
		setSelectedKeys(new Set())

		const isLast = requirementIndex + 1 >= requirements.length
		if (isLast) {
			const log = [...consumptionLog, batch]
			const allRawIds = log.flatMap((c) => c.rawIds)
			const allCrafted = log.flatMap((c) => c.craftedIndices)
			dispatch(
				PlayerStoreSlice.actions.removeInventorySlots({
					rawIds: allRawIds,
					craftedIndices: allCrafted,
				}),
			)
			const rewardItems: Item[] = []
			const rewardIngredients: Ingredient[] = []
			for (const r of selectedQuest.rewards) {
				if (isIngredientBaseReward(r)) {
					rewardIngredients.push(CreateIngredient(r))
				} else {
					rewardItems.push(r)
				}
			}
			dispatch(
				PlayerStoreSlice.actions.applyQuestRewards({
					gold: selectedQuest.gold,
					xp: selectedQuest.xp,
					items: rewardItems.length ? rewardItems : undefined,
					ingredients: rewardIngredients.length ? rewardIngredients : undefined,
				}),
			)
			dispatch(HistoryStoreSlice.actions.recordCompletedQuest({ questId: selectedQuest.id }))
			if (!selectedQuest.repeatable) {
				dispatch(PlayerStoreSlice.actions.removeAvailableQuestId(selectedQuest.id))
			}
			setShowComplete(true)
			setConsumptionLog([])
		} else {
			setConsumptionLog((prev) => [...prev, batch])
			setRequirementIndex((i) => i + 1)
		}
	}, [
		selectedQuest,
		currentReq,
		canProceed,
		selectedKeys,
		consumedRawIds,
		consumedCraftedIndices,
		requirementIndex,
		requirements.length,
		consumptionLog,
		dispatch,
		selectedKeys,
	])

	const handleBackStage = useCallback(() => {
		if (requirementIndex === 0) {
			closeQuest()
			return
		}
		const last = consumptionLog[consumptionLog.length - 1]
		if (!last) {
			closeQuest()
			return
		}
		setConsumptionLog((prev) => prev.slice(0, -1))
		setConsumedRawIds((prev) => {
			const n = new Set(prev)
			last.rawIds.forEach((id) => n.delete(id))
			return n
		})
		setConsumedCraftedIndices((prev) => {
			const n = new Set(prev)
			last.craftedIndices.forEach((idx) => n.delete(idx))
			return n
		})
		setRequirementIndex((i) => i - 1)
		setSelectedKeys(new Set())
	}, [requirementIndex, consumptionLog, closeQuest])

	const questMeetsPrereqs = useCallback(
		(q: Quest) => playerCanCompleteQuestInOrder(q.requirements, rawIngredients, inventoryItems),
		[rawIngredients, inventoryItems],
	)

	if (!selectedQuest) {
		return (
			<div className="alchemy-setup-flow quest-board">
				<header className="alchemy-setup-header">
					<h1>Quest board</h1>
					<p className="alchemy-setup-lead">Choose a quest you can fulfill with your inventory.</p>
				</header>
				<ul className="quest-board-list">
					{visibleQuests.map((q) => {
						const ok = questMeetsPrereqs(q)
						return (
							<li key={q.id}>
								<button
									type="button"
									className={
										'quest-board-row' + (ok ? '' : ' quest-board-row--disabled')
									}
									disabled={!ok}
									onClick={() => ok && openQuest(q)}
								>
									<span className="quest-board-row-title">{q.name}</span>
									<span className="quest-board-row-desc">{q.description}</span>
								</button>
							</li>
						)
					})}
				</ul>
				{visibleQuests.length === 0 && (
					<p className="alchemy-setup-lead">No quests available right now.</p>
				)}
				<p className="alchemy-setup-back">
					<Link href="/hex/map/town">Back to town</Link>
				</p>
			</div>
		)
	}

	if (showComplete) {
		return (
			<div className="alchemy-setup-flow quest-board">
				<header className="alchemy-setup-header">
					<h1>Quest complete</h1>
					<p className="alchemy-setup-lead">
						<strong>{selectedQuest.name}</strong>
					</p>
				</header>
				<section className="quest-board-rewards" aria-label="Rewards">
					<h2 className="quest-board-subhead">Rewards</h2>
					<ul className="quest-board-reward-lines">
						{selectedQuest.gold != null && selectedQuest.gold > 0 && (
							<li>Gold: {selectedQuest.gold}</li>
						)}
						{selectedQuest.xp != null && selectedQuest.xp > 0 && (
							<li>XP: {selectedQuest.xp}</li>
						)}
						{selectedQuest.rewards.length === 0 &&
							(selectedQuest.gold == null || selectedQuest.gold === 0) &&
							(selectedQuest.xp == null || selectedQuest.xp === 0) && (
								<li>No extra items this time.</li>
							)}
						{selectedQuest.rewards.map((r, i) => (
							<li key={i}>
								{isIngredientBaseReward(r) ? r.name : `${r.name} (${r.description})`}
							</li>
						))}
					</ul>
				</section>
				<div className="alchemy-setup-actions">
					<button type="button" className="alchemy-setup-primary" onClick={closeQuest}>
						Back to board
					</button>
				</div>
			</div>
		)
	}

	const hasStageItems =
		stageInventory.ingredients.length > 0 || stageInventory.craftedItems.length > 0

	return (
		<div className="alchemy-setup-flow quest-board">
			<header className="alchemy-setup-header">
				<h1>{selectedQuest.name}</h1>
				<p className="alchemy-setup-lead">{selectedQuest.description}</p>
			</header>
			{currentReq && (
				<p className="alchemy-setup-hint">
					Step {requirementIndex + 1} of {requirements.length}:{' '}
					<strong>{formatQuestRequirement(currentReq)}</strong>
					{needForStage > 1
						? ` — select ${needForStage} (each stack counts separately).`
						: ''}
				</p>
			)}
			{!hasStageItems ? (
				<p className="alchemy-setup-lead alchemy-required-list--missing">
					Nothing in your inventory matches this step with what you have left to turn in. Use
					Back to change an earlier choice or gather more.
				</p>
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
					getCraftedRowKey={(_item, i) =>
						craftedRowKey(stageInventory.craftedEntries[i]?.index ?? i)
					}
				/>
			)}
			<div className="alchemy-setup-actions">
				<button
					type="button"
					className="alchemy-setup-primary"
					disabled={!canProceed || !hasStageItems}
					onClick={handleContinue}
				>
					{requirementIndex + 1 < requirements.length ? 'Continue' : 'Complete quest'}
				</button>
				<button type="button" className="alchemy-setup-secondary" onClick={handleBackStage}>
					{requirementIndex === 0 ? 'Cancel' : 'Back'}
				</button>
			</div>
		</div>
	)
}
