import { configureStore } from '@reduxjs/toolkit'
import Alchemy from '@/store/features/alchemySlice'
import type { PersistedAlchemyState } from '@/store/features/alchemySlice'
import { initialAlchemyState } from '@/store/features/alchemySlice'

export const ALCHEMY_STORAGE_KEY = 'frontendeavor-alchemy-v1'

let alchemyPersistenceEnabled = false

/** Call once after rehydrating from localStorage so the subscriber does not overwrite saved data before load. */
export function enableAlchemyPersistence() {
	alchemyPersistenceEnabled = true
}

function readPersistedAlchemy(): PersistedAlchemyState | null {
	if (typeof window === 'undefined') return null
	try {
		const raw = localStorage.getItem(ALCHEMY_STORAGE_KEY)
		if (!raw) return null
		return JSON.parse(raw) as PersistedAlchemyState
	} catch {
		return null
	}
}

/** Synchronous merge so the first client render (and useLayoutEffects) see persisted recipe/ingredients/grid. */
const persistedAlchemy = readPersistedAlchemy()
const preloadedState =
	persistedAlchemy !== null
		? {
				Alchemy: {
					...initialAlchemyState,
					...persistedAlchemy,
					cursor: initialAlchemyState.cursor,
				},
			}
		: undefined

export const store = configureStore({
	reducer: {
		Alchemy: Alchemy.reducer
	},
	preloadedState,
})

if (typeof window !== 'undefined') {
	store.subscribe(() => {
		if (!alchemyPersistenceEnabled) return
		const s = store.getState().Alchemy
		const persisted: PersistedAlchemyState = {
			currentRecipe: s.currentRecipe,
			playGrid: s.playGrid,
			ingredients: s.ingredients,
			placedComponents: s.placedComponents,
		}
		try {
			localStorage.setItem(ALCHEMY_STORAGE_KEY, JSON.stringify(persisted))
		} catch {
			// quota / private mode
		}
	})
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
