import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/** Wall-clock (`Date.now()`) start + duration so cooldowns resume correctly across route changes and reloads. */
export interface HexCooldownEntry {
	startedAt: number
	duration: number
}

export interface MapState {
	/** Keyed by `HexTile.id` (`"q,r"` axial id). */
	hexesOnCooldown: Record<string, HexCooldownEntry>
}

export type PersistedMapState = MapState

export const initialMapState: MapState = {
	hexesOnCooldown: {},
}

const mapSlice = createSlice({
	name: 'map',
	initialState: initialMapState,
	reducers: {
		hydrateFromStorage: (state, action: PayloadAction<PersistedMapState>) => {
			state.hexesOnCooldown = { ...(action.payload.hexesOnCooldown ?? {}) }
		},
		startHexCooldown: (
			state,
			action: PayloadAction<{ hexId: string; startedAt: number; duration: number }>,
		) => {
			const { hexId, startedAt, duration } = action.payload
			state.hexesOnCooldown[hexId] = { startedAt, duration }
		},
		endHexCooldown: (state, action: PayloadAction<{ hexId: string }>) => {
			delete state.hexesOnCooldown[action.payload.hexId]
		},
		clearHexCooldowns: (state) => {
			state.hexesOnCooldown = {}
		},
	},
})

export default {
	reducer: mapSlice.reducer,
	slice: mapSlice,
	actions: mapSlice.actions,
}
