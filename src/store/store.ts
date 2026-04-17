import { configureStore } from '@reduxjs/toolkit'
import Alchemy from '@/store/features/alchemySlice'
import type { PersistedAlchemyState } from '@/store/features/alchemySlice'
import { initialAlchemyState } from '@/store/features/alchemySlice'
import Player from '@/store/features/playerSlice'
import type { PersistedPlayerState } from '@/store/features/playerSlice'
import { initialPlayerState } from '@/store/features/playerSlice'
import History from '@/store/features/historySlice'
import type { CompletedCraftSnapshot, PersistedHistoryState } from '@/store/features/historySlice'
import { initialHistoryState } from '@/store/features/historySlice'
import Toastify from '@/store/features/toastifySlice'
import { initialToastifyState } from '@/store/features/toastifySlice'

export const ALCHEMY_STORAGE_KEY = 'frontendeavor-alchemy-v1'
export const PLAYER_STORAGE_KEY = 'frontendeavor-player-v1'
export const HISTORY_STORAGE_KEY = 'frontendeavor-history-v1'

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

/** Legacy player JSON could include lastCompletedCraft before History slice existed. */
function readPersistedPlayer(): {
	player: PersistedPlayerState
	legacyLastCraft: CompletedCraftSnapshot | null
} | null {
	if (typeof window === 'undefined') return null
	try {
		const raw = localStorage.getItem(PLAYER_STORAGE_KEY)
		if (!raw) return null
		const parsed = JSON.parse(raw) as PersistedPlayerState & {
			lastCompletedCraft?: CompletedCraftSnapshot | null
		}
		const legacyLastCraft = parsed.lastCompletedCraft ?? null
		const player: PersistedPlayerState = {
			inventory: parsed.inventory ?? initialPlayerState.inventory,
			availableQuestIds:
				parsed.availableQuestIds ?? [...initialPlayerState.availableQuestIds],
			xp: parsed.xp ?? initialPlayerState.xp,
			gold: parsed.gold ?? initialPlayerState.gold,
		}
		return { player, legacyLastCraft }
	} catch {
		return null
	}
}

function readPersistedHistory(): PersistedHistoryState | null {
	if (typeof window === 'undefined') return null
	try {
		const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
		if (!raw) return null
		return JSON.parse(raw) as PersistedHistoryState
	} catch {
		return null
	}
}

const persistedAlchemy = readPersistedAlchemy()
const persistedPlayerBundle = readPersistedPlayer()
const persistedHistory = readPersistedHistory()

function buildHistoryState(): typeof initialHistoryState {
	let base =
		persistedHistory !== null
			? {
					...initialHistoryState,
					...persistedHistory,
					completedCrafts: persistedHistory.completedCrafts ?? [],
					completedQuestIds: persistedHistory.completedQuestIds ?? [],
				}
			: { ...initialHistoryState }

	// One-time migration: last craft only lived on Player blob
	if (
		persistedPlayerBundle?.legacyLastCraft &&
		base.completedCrafts.length === 0 &&
		base.lastCompletedCraft === null
	) {
		base = {
			...base,
			completedCrafts: [persistedPlayerBundle.legacyLastCraft],
			lastCompletedCraft: persistedPlayerBundle.legacyLastCraft,
		}
	}

	return base
}

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
		persistedPlayerBundle !== null
			? {
					...initialPlayerState,
					...persistedPlayerBundle.player,
				}
			: initialPlayerState,
	History: buildHistoryState(),
	Toastify: initialToastifyState,
}

export const store = configureStore({
	reducer: {
		Alchemy: Alchemy.reducer,
		Player: Player.reducer,
		History: History.reducer,
		Toastify: Toastify.reducer,
	},
	preloadedState,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

/**
 * Dev / debug: reset Alchemy, Player, History, and Toastify to initial state and overwrite the three persisted localStorage keys.
 */
export function hardResetPersistedGameState() {
	if (typeof window === 'undefined') return

	const alchemyPayload: PersistedAlchemyState = {
		currentRecipe: initialAlchemyState.currentRecipe,
		playGrid: initialAlchemyState.playGrid,
		ingredients: initialAlchemyState.ingredients,
		placedComponents: initialAlchemyState.placedComponents,
		placementUndoPast: initialAlchemyState.placementUndoPast,
		placementUndoFuture: initialAlchemyState.placementUndoFuture,
	}
	try {
		localStorage.setItem(ALCHEMY_STORAGE_KEY, JSON.stringify(alchemyPayload))
		localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(initialPlayerState))
		localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(initialHistoryState))
	} catch {
		// quota / private mode
	}

	store.dispatch(Alchemy.actions.hydrateFromStorage(alchemyPayload))
	store.dispatch(Player.actions.hydrateFromStorage(initialPlayerState))
	store.dispatch(History.actions.hydrateFromStorage(initialHistoryState))
	store.dispatch(Toastify.actions.resetToInitial())
}

/** Batched localStorage writes: avoids serializing large slices on every dispatch (e.g. cursor/scroll churn). */
const PERSIST_DEBOUNCE_MS = 400

let persistenceEnabled = false
let persistFlushTimer: ReturnType<typeof setTimeout> | null = null
let pageLifecycleHandlersRegistered = false

function writePersistedSlices(state: RootState) {
	const alchemyPersisted: PersistedAlchemyState = {
		currentRecipe: state.Alchemy.currentRecipe,
		playGrid: state.Alchemy.playGrid,
		ingredients: state.Alchemy.ingredients,
		placedComponents: state.Alchemy.placedComponents,
		placementUndoPast: state.Alchemy.placementUndoPast,
		placementUndoFuture: state.Alchemy.placementUndoFuture,
	}
	const playerPersisted: PersistedPlayerState = {
		inventory: state.Player.inventory,
		availableQuestIds: state.Player.availableQuestIds,
		xp: state.Player.xp,
		gold: state.Player.gold,
	}
	const historyPersisted: PersistedHistoryState = {
		completedCrafts: state.History.completedCrafts,
		lastCompletedCraft: state.History.lastCompletedCraft,
		completedQuestIds: state.History.completedQuestIds,
	}
	try {
		localStorage.setItem(ALCHEMY_STORAGE_KEY, JSON.stringify(alchemyPersisted))
		localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(playerPersisted))
		localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyPersisted))
	} catch {
		// quota / private mode
	}
}

function flushPersistToLocalStorage() {
	if (!persistenceEnabled || typeof window === 'undefined') return
	if (persistFlushTimer !== null) {
		clearTimeout(persistFlushTimer)
		persistFlushTimer = null
	}
	writePersistedSlices(store.getState())
}

function schedulePersistFlush() {
	if (!persistenceEnabled || typeof window === 'undefined') return
	if (persistFlushTimer !== null) {
		clearTimeout(persistFlushTimer)
	}
	persistFlushTimer = setTimeout(() => {
		persistFlushTimer = null
		writePersistedSlices(store.getState())
	}, PERSIST_DEBOUNCE_MS)
}

function registerPersistPageLifecycleFlush() {
	if (pageLifecycleHandlersRegistered || typeof window === 'undefined') return
	pageLifecycleHandlersRegistered = true
	const syncFlush = () => {
		if (!persistenceEnabled) return
		if (persistFlushTimer !== null) {
			clearTimeout(persistFlushTimer)
			persistFlushTimer = null
		}
		writePersistedSlices(store.getState())
	}
	window.addEventListener('beforeunload', syncFlush)
	window.addEventListener('pagehide', syncFlush)
}

/**
 * Enables debounced localStorage writes for Alchemy, Player, and History after synchronous preload (call once on mount).
 * Writes are batched (~400ms) to avoid work on every dispatch; tab close triggers an immediate flush.
 */
export function enableAlchemyPersistence() {
	persistenceEnabled = true
	registerPersistPageLifecycleFlush()
	flushPersistToLocalStorage()
}

if (typeof window !== 'undefined') {
	store.subscribe(() => {
		if (!persistenceEnabled) return
		schedulePersistFlush()
	})
}
