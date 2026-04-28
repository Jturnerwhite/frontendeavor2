import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Ingredient, Item } from '@/app/hex/architecture/typings'
import { defaultAvailableQuestIds } from '@/app/hex/architecture/data/quests'
import { EQUIPMENT_TYPE } from '@/app/hex/architecture/enums'

export interface EquipmentSlots {
	[EQUIPMENT_TYPE.GATHER_TOOL]: string | null,
	[EQUIPMENT_TYPE.FISHING_ROD]: string | null,
}

export interface PlayerState {
	inventory: { raw: Ingredient[]; crafted: Item[] },
	/** Ids of items that are in the player's inventory that are equipped. */
	equipmentSlots: {
		[EQUIPMENT_TYPE.GATHER_TOOL]: string | null,
		[EQUIPMENT_TYPE.FISHING_ROD]: string | null,
	},
	/** Quest ids currently available on the board (catalog resolved via `BaseQuests` / game data). */
	availableQuestIds: string[],
	xp: number,
	gold: number,
}

/** Serializable player slice (same shape as full state). */
export type PersistedPlayerState = PlayerState;

const XP_PER_CRAFT = 10;
const GOLD_PER_CRAFT = 0;

export const initialPlayerState: PlayerState = {
	inventory: { raw: [], crafted: [] },
	equipmentSlots: {
		[EQUIPMENT_TYPE.GATHER_TOOL]: null,
		[EQUIPMENT_TYPE.FISHING_ROD]: null,
	},
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
		/** Remove raw ingredients and crafted items by id. */
		removeInventorySlots: (
			state,
			action: PayloadAction<{ rawIds: string[]; craftedItemIds: string[] }>,
		) => {
			const rawSet = new Set(action.payload.rawIds)
			const craftedIdSet = new Set(action.payload.craftedItemIds)
			state.inventory.raw = state.inventory.raw.filter((i) => !rawSet.has(i.id))
			state.inventory.crafted = state.inventory.crafted.filter((item) => !craftedIdSet.has(item.id))
		},
		applyQuestRewards: (
			state,
			action: PayloadAction<{
				gold?: number
				xp?: number
				items?: Item[]
				ingredients?: Ingredient[]
			}>,
		) => {
			const { gold, xp, items, ingredients } = action.payload
			if (gold != null) state.gold += gold
			if (xp != null) state.xp += xp
			if (items?.length) state.inventory.crafted.push(...items)
			if (ingredients?.length) state.inventory.raw.push(...ingredients)
		},
		equipItem: (state, action: PayloadAction<{ itemId: string, equipmentType: EQUIPMENT_TYPE }>) => {
			state.equipmentSlots = {...state.equipmentSlots, [action.payload.equipmentType]: action.payload.itemId};
		},
		unequipItem: (state, action: PayloadAction<{ equipmentType: EQUIPMENT_TYPE }>) => {
			state.equipmentSlots = {...state.equipmentSlots, [action.payload.equipmentType]: null};
		},
	},
})

export default {
	reducer: playerSlice.reducer,
	slice: playerSlice,
	actions: playerSlice.actions,
}
