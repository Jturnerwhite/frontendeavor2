import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type ToastQueueItem = {
	id: string
	message: string
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
		showToast: (state, action: PayloadAction<{ message: string }>) => {
			const id = String(state.nextId++)
			state.queue.push({ id, message: action.payload.message })
		},
		acknowledgeToast: (state, action: PayloadAction<{ id: string }>) => {
			state.queue = state.queue.filter((t) => t.id !== action.payload.id)
		},
	},
})

export default {
	reducer: toastifySlice.reducer,
	slice: toastifySlice,
	actions: toastifySlice.actions,
}
