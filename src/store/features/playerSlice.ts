import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Ingredient, Item, Recipe } from '@/app/hex/architecture/typings'
import { ALCH_ELEMENT } from '@/app/hex/architecture/enums'

export type CompletedCraftSnapshot = {
	item: Item
	recipe: Recipe
	elementScores: Record<ALCH_ELEMENT, { nodes: number; links: number }>
}

export interface PlayerState {
	inventory: { raw: Ingredient[]; crafted: Item[] }
	xp: number
	gold: number
	lastCompletedCraft: CompletedCraftSnapshot | null
}

/** Serializable player slice (same shape as full state). */
export type PersistedPlayerState = PlayerState

const XP_PER_CRAFT = 10
const GOLD_PER_CRAFT = 1

export const initialPlayerState: PlayerState = {
	inventory: { raw: [], crafted: [] },
	xp: 0,
	gold: 0,
	lastCompletedCraft: null,
}

const playerSlice = createSlice({
	name: 'player',
	initialState: initialPlayerState,
	reducers: {
		hydrateFromStorage: (state, action: PayloadAction<PersistedPlayerState>) => {
			state.inventory = action.payload.inventory
			state.xp = action.payload.xp
			state.gold = action.payload.gold
			state.lastCompletedCraft = action.payload.lastCompletedCraft
		},
		completeCraft: (state, action: PayloadAction<CompletedCraftSnapshot>) => {
			state.inventory.crafted.push(action.payload.item)
			state.lastCompletedCraft = action.payload
			state.xp += XP_PER_CRAFT
			state.gold += GOLD_PER_CRAFT
		},
		clearLastCompletedCraft: (state) => {
			state.lastCompletedCraft = null
		},
	},
})

export default {
	reducer: playerSlice.reducer,
	slice: playerSlice,
	actions: playerSlice.actions,
}
