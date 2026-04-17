import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ToastQueueItem = {
	id: string
	message: string
	/** Public URL path (e.g. `/art/ingredients/jarba.png`) shown in place of the default success icon. */
	imagePath?: string
}

export interface ToastifyState {
	nextId: number
	queue: ToastQueueItem[]
}

export const initialToastifyState: ToastifyState = {
	nextId: 0,
	queue: [],
}

const toastifySlice = createSlice({
	name: 'toastify',
	initialState: initialToastifyState,
	reducers: {
		showToast: (state, action: PayloadAction<{ message: string; imagePath?: string }>) => {
			const id = String(state.nextId++)
			state.queue.push({
				id,
				message: action.payload.message,
				...(action.payload.imagePath !== undefined && action.payload.imagePath !== ''
					? { imagePath: action.payload.imagePath }
					: {}),
			})
		},
		acknowledgeToast: (state, action: PayloadAction<{ id: string }>) => {
			state.queue = state.queue.filter((t) => t.id !== action.payload.id)
		},
		resetToInitial: () => ({ ...initialToastifyState }),
	},
})

export default {
	reducer: toastifySlice.reducer,
	slice: toastifySlice,
	actions: toastifySlice.actions,
}
