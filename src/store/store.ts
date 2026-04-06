import { configureStore } from '@reduxjs/toolkit'
import Alchemy from '@/store/features/alchemySlice'
import type { PersistedAlchemyState } from '@/store/features/alchemySlice'
import { initialAlchemyState } from '@/store/features/alchemySlice'
import Player from '@/store/features/playerSlice'
import type { PersistedPlayerState } from '@/store/features/playerSlice'
import { initialPlayerState } from '@/store/features/playerSlice'

export const ALCHEMY_STORAGE_KEY = 'frontendeavor-alchemy-v1'
export const PLAYER_STORAGE_KEY = 'frontendeavor-player-v1'

let persistenceEnabled = false

/** Enables localStorage writes for Alchemy and Player after synchronous preload (call once on mount). */
export function enableAlchemyPersistence() {
	persistenceEnabled = true
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

function readPersistedPlayer(): PersistedPlayerState | null {
	if (typeof window === 'undefined') return null
	try {
		const raw = localStorage.getItem(PLAYER_STORAGE_KEY)
		if (!raw) return null
		return JSON.parse(raw) as PersistedPlayerState
	} catch {
		return null
	}
}

const persistedAlchemy = readPersistedAlchemy()
const persistedPlayer = readPersistedPlayer()

/** Full root preload: merge persisted slices when present, else reducer defaults (avoids partial-preload typing issues). */
const preloadedState = {
	Alchemy:
		persistedAlchemy !== null
			? {
					...initialAlchemyState,
					...persistedAlchemy,
					cursor: initialAlchemyState.cursor,
				}
			: initialAlchemyState,
	Player:
		persistedPlayer !== null
			? {
					...initialPlayerState,
					...persistedPlayer,
				}
			: initialPlayerState,
}

export const store = configureStore({
	reducer: {
		Alchemy: Alchemy.reducer,
		Player: Player.reducer,
	},
	preloadedState,
})

if (typeof window !== 'undefined') {
	store.subscribe(() => {
		if (!persistenceEnabled) return
		const state = store.getState()
		const alchemyPersisted: PersistedAlchemyState = {
			currentRecipe: state.Alchemy.currentRecipe,
			playGrid: state.Alchemy.playGrid,
			ingredients: state.Alchemy.ingredients,
			placedComponents: state.Alchemy.placedComponents,
		}
		const playerPersisted: PersistedPlayerState = {
			inventory: state.Player.inventory,
			xp: state.Player.xp,
			gold: state.Player.gold,
			lastCompletedCraft: state.Player.lastCompletedCraft,
		}
		try {
			localStorage.setItem(ALCHEMY_STORAGE_KEY, JSON.stringify(alchemyPersisted))
			localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(playerPersisted))
		} catch {
			// quota / private mode
		}
	})
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
