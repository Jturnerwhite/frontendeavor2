import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Ingredient, Item } from '@/app/hex/architecture/typings'
import { defaultAvailableQuestIds } from '@/app/hex/architecture/data/quests'

export interface PlayerState {
	inventory: { raw: Ingredient[]; crafted: Item[] }
	/** Quest ids currently available on the board (catalog resolved via `BaseQuests` / game data). */
	availableQuestIds: string[]
	xp: number
	gold: number
}

/** Serializable player slice (same shape as full state). */
export type PersistedPlayerState = PlayerState

const XP_PER_CRAFT = 10
const GOLD_PER_CRAFT = 1

export const initialPlayerState: PlayerState = {
	inventory: { raw: [], crafted: [] },
	availableQuestIds: [...defaultAvailableQuestIds],
	xp: 0,
	gold: 0,
}

const playerSlice = createSlice({
	name: 'player',
	initialState: initialPlayerState,
	reducers: {
		hydrateFromStorage: (state, action: PayloadAction<PersistedPlayerState>) => {
			state.inventory = action.payload.inventory
			state.availableQuestIds = action.payload.availableQuestIds
			state.xp = action.payload.xp
			state.gold = action.payload.gold
		},
		setAvailableQuestIds: (state, action: PayloadAction<string[]>) => {
			state.availableQuestIds = action.payload
		},
		addAvailableQuestId: (state, action: PayloadAction<string>) => {
			if (!state.availableQuestIds.includes(action.payload)) {
				state.availableQuestIds.push(action.payload)
			}
		},
		removeAvailableQuestId: (state, action: PayloadAction<string>) => {
			state.availableQuestIds = state.availableQuestIds.filter((id) => id !== action.payload)
		},
		completeCraft: (state, action: PayloadAction<{ item: Item }>) => {
			state.inventory.crafted.push(action.payload.item)
			state.xp += XP_PER_CRAFT
			state.gold += GOLD_PER_CRAFT
		},
		addGatheredIngredients: (state, action: PayloadAction<{ ingredients: Ingredient[] }>) => {
			state.inventory.raw.push(...action.payload.ingredients)
		},
	},
})

export default {
	reducer: playerSlice.reducer,
	slice: playerSlice,
	actions: playerSlice.actions,
}
