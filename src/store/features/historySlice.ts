import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Item, Recipe } from '@/app/hex/architecture/typings'
import { ALCH_ELEMENT } from '@/app/hex/architecture/enums'

export type CompletedCraftSnapshot = {
	item: Item
	recipe: Recipe
	elementScores: Record<ALCH_ELEMENT, { nodes: number; links: number }>
}

export interface HistoryState {
	/** All completed crafts, oldest first. */
	completedCrafts: CompletedCraftSnapshot[]
	lastCompletedCraft: CompletedCraftSnapshot | null
	/**
	 * Quest completions in order (same id may appear more than once for repeatable quests).
	 */
	completedQuestIds: string[]
}

export type PersistedHistoryState = HistoryState

export const initialHistoryState: HistoryState = {
	completedCrafts: [],
	lastCompletedCraft: null,
	completedQuestIds: [],
}

const historySlice = createSlice({
	name: 'history',
	initialState: initialHistoryState,
	reducers: {
		hydrateFromStorage: (state, action: PayloadAction<PersistedHistoryState>) => {
			state.completedCrafts = action.payload.completedCrafts
			state.lastCompletedCraft = action.payload.lastCompletedCraft
			state.completedQuestIds = action.payload.completedQuestIds
		},
		recordCompletedCraft: (state, action: PayloadAction<CompletedCraftSnapshot>) => {
			state.completedCrafts.push(action.payload)
			state.lastCompletedCraft = action.payload
		},
		clearLastCompletedCraft: (state) => {
			state.lastCompletedCraft = null
		},
		recordCompletedQuest: (state, action: PayloadAction<{ questId: string }>) => {
			state.completedQuestIds.push(action.payload.questId)
		},
	},
})

export default {
	reducer: historySlice.reducer,
	slice: historySlice,
	actions: historySlice.actions,
}
