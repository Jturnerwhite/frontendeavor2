import { configureStore } from '@reduxjs/toolkit'
import Counter from '@/store/features/counterSlice'

export const store = configureStore({
  reducer: {
    // Add reducers here
	counter: Counter.reducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch