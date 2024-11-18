import { configureStore } from '@reduxjs/toolkit'
import Alchemy from '@/store/features/alchemySlice'

export const store = configureStore({
	reducer: {
		Alchemy: Alchemy.reducer
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch