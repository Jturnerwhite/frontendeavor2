import { configureStore } from '@reduxjs/toolkit'
import Alchemy from '@/store/features/alchemySlice'
import Farm from '@/store/features/farmSlice'

export const store = configureStore({
	reducer: {
		Alchemy: Alchemy.reducer,
		Farm: Farm.reducer
	},
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch