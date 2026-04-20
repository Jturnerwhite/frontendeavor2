import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface SettingsState {
	isFirstVisit: boolean
}

export type PersistedSettingsState = SettingsState

export const initialSettingsState: SettingsState = {
	isFirstVisit: true,
}

const settingsSlice = createSlice({
	name: 'settings',
	initialState: initialSettingsState,
	reducers: {
		hydrateFromStorage: (state, action: PayloadAction<PersistedSettingsState>) => {
			state.isFirstVisit = action.payload.isFirstVisit
		},
		markNotFirstVisit: (state) => {
			state.isFirstVisit = false
		},
	},
})

export default {
	reducer: settingsSlice.reducer,
	slice: settingsSlice,
	actions: settingsSlice.actions,
}
