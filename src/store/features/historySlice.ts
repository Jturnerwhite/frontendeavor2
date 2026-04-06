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
}

export type PersistedHistoryState = HistoryState

export const initialHistoryState: HistoryState = {
	completedCrafts: [],
	lastCompletedCraft: null,
}

const historySlice = createSlice({
	name: 'history',
	initialState: initialHistoryState,
	reducers: {
		hydrateFromStorage: (state, action: PayloadAction<PersistedHistoryState>) => {
			state.completedCrafts = action.payload.completedCrafts
			state.lastCompletedCraft = action.payload.lastCompletedCraft
		},
		recordCompletedCraft: (state, action: PayloadAction<CompletedCraftSnapshot>) => {
			state.completedCrafts.push(action.payload)
			state.lastCompletedCraft = action.payload
		},
		clearLastCompletedCraft: (state) => {
			state.lastCompletedCraft = null
		},
	},
})

export default {
	reducer: historySlice.reducer,
	slice: historySlice,
	actions: historySlice.actions,
}
