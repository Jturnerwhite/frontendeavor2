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
import Settings from '@/store/features/settingsSlice'
import type { PersistedSettingsState } from '@/store/features/settingsSlice'
import { initialSettingsState } from '@/store/features/settingsSlice'
import Map from '@/store/features/mapSlice'
import type { PersistedMapState } from '@/store/features/mapSlice'
import { initialMapState } from '@/store/features/mapSlice'

export const ALCHEMY_STORAGE_KEY = 'frontendeavor-alchemy-v1'
export const PLAYER_STORAGE_KEY = 'frontendeavor-player-v1'
export const HISTORY_STORAGE_KEY = 'frontendeavor-history-v1'
export const SETTINGS_STORAGE_KEY = 'frontendeavor-settings-v1'
export const MAP_STORAGE_KEY = 'frontendeavor-map-v1'

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

function readPersistedSettings(): PersistedSettingsState | null {
	if (typeof window === 'undefined') return null
	try {
		const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
		if (!raw) return null
		return JSON.parse(raw) as PersistedSettingsState
	} catch {
		return null
	}
}

function readPersistedMap(): PersistedMapState | null {
	if (typeof window === 'undefined') return null
	try {
		const raw = localStorage.getItem(MAP_STORAGE_KEY)
		if (!raw) return null
		return JSON.parse(raw) as PersistedMapState
	} catch {
		return null
	}
}

/** Drop cooldown entries whose timers already elapsed at load time (stale from a prior session). */
function pruneExpiredMapState(persisted: PersistedMapState | null): PersistedMapState | null {
	if (persisted === null) return null
	const now = Date.now()
	const kept: PersistedMapState['hexesOnCooldown'] = {}
	for (const [hexId, entry] of Object.entries(persisted.hexesOnCooldown ?? {})) {
		if (!entry || typeof entry.startedAt !== 'number' || typeof entry.duration !== 'number') continue
		if (entry.startedAt + entry.duration <= now) continue
		kept[hexId] = entry
	}
	return { hexesOnCooldown: kept }
}

export const store = configureStore({
	reducer: {
		Alchemy: Alchemy.reducer,
		Player: Player.reducer,
		History: History.reducer,
		Toastify: Toastify.reducer,
		Settings: Settings.reducer,
		Map: Map.reducer,
	},
})

/**
 * Read persisted slices from localStorage and dispatch hydrate actions.
 *
 * Must be invoked on the client AFTER React hydration (e.g. from a mount effect).
 * Reading at module load made the server tree (always empty) diverge from the
 * client tree (populated from localStorage), causing hydration mismatches anywhere
 * UI was gated on persisted state. Starting empty and filling in post-hydration
 * keeps the first client render byte-identical to SSR.
 */
export function hydratePersistedSlicesFromStorage() {
	if (typeof window === 'undefined') return

	const persistedAlchemy = readPersistedAlchemy()
	if (persistedAlchemy !== null) {
		const alchemyPayload: PersistedAlchemyState = {
			setupRecipeId: persistedAlchemy.setupRecipeId ?? initialAlchemyState.setupRecipeId,
			ingredientSelectionSetup: persistedAlchemy.ingredientSelectionSetup ?? {
				...initialAlchemyState.ingredientSelectionSetup,
			},
			currentRecipe: persistedAlchemy.currentRecipe ?? initialAlchemyState.currentRecipe,
			playGrid: persistedAlchemy.playGrid ?? initialAlchemyState.playGrid,
			ingredients: persistedAlchemy.ingredients ?? initialAlchemyState.ingredients,
			placedComponents: persistedAlchemy.placedComponents ?? initialAlchemyState.placedComponents,
			placementUndoPast:
				persistedAlchemy.placementUndoPast ?? initialAlchemyState.placementUndoPast,
			placementUndoFuture:
				persistedAlchemy.placementUndoFuture ?? initialAlchemyState.placementUndoFuture,
		}
		store.dispatch(Alchemy.actions.hydrateFromStorage(alchemyPayload))
	}

	const persistedPlayerBundle = readPersistedPlayer()
	if (persistedPlayerBundle !== null) {
		store.dispatch(
			Player.actions.hydrateFromStorage({
				...initialPlayerState,
				...persistedPlayerBundle.player,
			}),
		)
	}

	const persistedHistory = readPersistedHistory()
	let baseHistory: PersistedHistoryState =
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
		baseHistory.completedCrafts.length === 0 &&
		baseHistory.lastCompletedCraft === null
	) {
		baseHistory = {
			...baseHistory,
			completedCrafts: [persistedPlayerBundle.legacyLastCraft],
			lastCompletedCraft: persistedPlayerBundle.legacyLastCraft,
		}
	}

	if (persistedHistory !== null || persistedPlayerBundle?.legacyLastCraft) {
		store.dispatch(History.actions.hydrateFromStorage(baseHistory))
	}

	const persistedSettings = readPersistedSettings()
	if (persistedSettings !== null) {
		store.dispatch(
			Settings.actions.hydrateFromStorage({
				...initialSettingsState,
				...persistedSettings,
				isFirstVisit: persistedSettings.isFirstVisit ?? initialSettingsState.isFirstVisit,
			}),
		)
	}

	const persistedMap = pruneExpiredMapState(readPersistedMap())
	if (persistedMap !== null) {
		store.dispatch(
			Map.actions.hydrateFromStorage({
				...initialMapState,
				hexesOnCooldown: persistedMap.hexesOnCooldown ?? {},
			}),
		)
	}
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

/**
 * Dev / debug: reset Alchemy, Player, History, Settings, Map, and Toastify to initial state and overwrite persisted localStorage keys.
 */
export function hardResetPersistedGameState() {
	if (typeof window === 'undefined') return

	const alchemyPayload: PersistedAlchemyState = {
		setupRecipeId: initialAlchemyState.setupRecipeId,
		ingredientSelectionSetup: { ...initialAlchemyState.ingredientSelectionSetup },
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
		localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(initialSettingsState))
		localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(initialMapState))
	} catch {
		// quota / private mode
	}

	store.dispatch(Alchemy.actions.hydrateFromStorage(alchemyPayload))
	store.dispatch(Player.actions.hydrateFromStorage(initialPlayerState))
	store.dispatch(History.actions.hydrateFromStorage(initialHistoryState))
	store.dispatch(Settings.actions.hydrateFromStorage(initialSettingsState))
	store.dispatch(Map.actions.hydrateFromStorage(initialMapState))
	store.dispatch(Toastify.actions.resetToInitial())
}

/** Batched localStorage writes: avoids serializing large slices on every dispatch (e.g. cursor/scroll churn). */
const PERSIST_DEBOUNCE_MS = 400

let persistenceEnabled = false
let persistFlushTimer: ReturnType<typeof setTimeout> | null = null
let pageLifecycleHandlersRegistered = false

function writePersistedSlices(state: RootState) {
	const alchemyPersisted: PersistedAlchemyState = {
		setupRecipeId: state.Alchemy.setupRecipeId,
		ingredientSelectionSetup: state.Alchemy.ingredientSelectionSetup,
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
	const settingsPersisted: PersistedSettingsState = {
		isFirstVisit: state.Settings.isFirstVisit,
	}
	const mapPersisted: PersistedMapState = {
		hexesOnCooldown: state.Map.hexesOnCooldown,
	}
	try {
		localStorage.setItem(ALCHEMY_STORAGE_KEY, JSON.stringify(alchemyPersisted))
		localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(playerPersisted))
		localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyPersisted))
		localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsPersisted))
		localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify(mapPersisted))
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
 * Enables debounced localStorage writes for Alchemy, Player, History, Settings, and Map.
 * Call once on mount, after `hydratePersistedSlicesFromStorage()` so the immediate flush
 * mirrors the just-rehydrated state rather than overwriting persisted data with empty initial state.
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
