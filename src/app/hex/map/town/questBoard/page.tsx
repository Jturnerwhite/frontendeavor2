'use client'

import { useCallback, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import PlayerStoreSlice from '@/store/features/playerSlice'
import HistoryStoreSlice from '@/store/features/historySlice'
import type { Ingredient, IngredientBase, Item, Quest, QuestRequirement } from '@/app/hex/architecture/typings'
import { BaseQuests } from '@/app/hex/architecture/data/quests'
import {
	buildQuestStageInventory,
	formatQuestRequirement,
	playerCanCompleteQuestInOrder,
} from '@/app/hex/architecture/helpers/questRequirements'
import { CreateIngredient } from '@/app/hex/architecture/factories/ingredientFactory'
import StagedItemSelector, {
	type StagedSelectionBatch,
} from '@/app/hex/sharedComponents/stagedItemSelector/stagedItemSelector'

function isIngredientBaseReward(r: Item | IngredientBase): r is IngredientBase {
	return 'possibleComps' in r && Array.isArray((r as IngredientBase).possibleComps)
}

export default function QuestBoard() {
	const dispatch = useAppDispatch()
	const inventoryItems = useAppSelector((state) => state.Player.inventory.crafted)
	const rawIngredients = useAppSelector((state) => state.Player.inventory.raw)
	const availableQuestIds = useAppSelector((state) => state.Player.availableQuestIds)
	const completedQuestIds = useAppSelector((state) => state.History.completedQuestIds)

	const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
	const [showComplete, setShowComplete] = useState(false)

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

	const grantRewards = useCallback(
		(quest: Quest) => {
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
		},
		[dispatch],
	)

	const openQuest = useCallback(
		(quest: Quest) => {
			setSelectedQuest(quest)
			setShowComplete(false)
			if (quest.requirements.length === 0) {
				grantRewards(quest)
				setShowComplete(true)
			}
		},
		[grantRewards],
	)

	const closeQuest = useCallback(() => {
		setSelectedQuest(null)
		setShowComplete(false)
	}, [])

	const handleQuestComplete = useCallback(
		(batches: StagedSelectionBatch[]) => {
			if (!selectedQuest) return
			const allRawIds = batches.flatMap((b) => b.rawIds)
			const allCrafted = batches.flatMap((b) => b.craftedItemIds)
			dispatch(
				PlayerStoreSlice.actions.removeInventorySlots({
					rawIds: allRawIds,
					craftedItemIds: allCrafted,
				}),
			)
			grantRewards(selectedQuest)
			setShowComplete(true)
		},
		[selectedQuest, dispatch, grantRewards],
	)

	const questMeetsPrereqs = useCallback(
		(q: Quest) => playerCanCompleteQuestInOrder(q.requirements, rawIngredients, inventoryItems),
		[rawIngredients, inventoryItems],
	)

	const renderQuestStageHint = useCallback(
		(stage: QuestRequirement, index: number, total: number) => {
			if (total <= 1) return null
			const need = stage.qty ?? 1
			return (
				<p className="quest-board-hint">
					Step {index + 1} of {total}:{' '}
					<strong>{formatQuestRequirement(stage)}</strong>
					{need > 1 ? ` — select ${need} (each stack counts separately).` : ''}
				</p>
			)
		},
		[],
	)

	if (!selectedQuest) {
		return (
			<div className="quest-board-flow quest-board">
				<header className="quest-board-header">
					<h1>Quest Board</h1>
					<p className="quest-board-lead">Choose a quest you can fulfill with your inventory.</p>
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
					<p className="quest-board-lead">No quests available right now.</p>
				)}
			</div>
		)
	}

	if (showComplete) {
		return (
			<div className="quest-board-flow quest-board">
				<header className="quest-board-header">
					<h1>Quest complete</h1>
					<p className="quest-board-lead">
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
				<div className="quest-board-actions">
					<button type="button" className="quest-board-primary" onClick={closeQuest}>
						Back to board
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="quest-board">
			<header className="quest-board-header">
				<h1>{selectedQuest.name}</h1>
				<p className="quest-board-lead">{selectedQuest.description}</p>
			</header>
			<StagedItemSelector<QuestRequirement>
				stages={selectedQuest.requirements}
				rawInventory={rawIngredients}
				craftedInventory={inventoryItems}
				buildStageInventory={(stage, raw, crafted, consumedRaw, consumedCrafted) => {
					const built = buildQuestStageInventory(stage, raw, crafted, consumedRaw, consumedCrafted)
					return { ingredients: built.ingredients, craftedItems: built.craftedItems }
				}}
				getStageCap={(stage) => stage.qty ?? 1}
				renderStageHint={renderQuestStageHint}
				emptyStageMessage={
					<p className="quest-board-lead">
						Nothing in your inventory matches this step with what you have left to turn in. Use
						Back to change an earlier choice or gather more.
					</p>
				}
				onComplete={handleQuestComplete}
				onCancel={closeQuest}
				finalPrimaryLabel="Turn In"
			/>
		</div>
	)
}
