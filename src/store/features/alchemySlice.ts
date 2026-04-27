import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { HexTile, HexMap, Position, PlacedComponent } from '@/app/hex/architecture/interfaces';
import * as Helpers from '@/app/hex/architecture/helpers/alchHelpers';
import type { AlchemyLabSource, AlchComponent, Ingredient } from '@/app/hex/architecture/typings';

const MAX_PLACEMENT_UNDO = 80

/** Serializable board state for undo/redo (deep-cloned plain objects). */
export type AlchemyBoardSnapshot = {
	playGrid: HexMap
	placedComponents: PlacedComponent[]
}

function cloneBoardSnapshot(playGrid: HexMap, placedComponents: PlacedComponent[]): AlchemyBoardSnapshot {
	return {
		playGrid: JSON.parse(JSON.stringify(playGrid)) as HexMap,
		placedComponents: JSON.parse(JSON.stringify(placedComponents)) as PlacedComponent[],
	}
}

interface CursorState {
	isPlacing: boolean;
	selectedComponent: AlchComponent | null;
	position: Position;
	rotation: number;
}

/** In-progress "select ingredients" step (staged or legacy) before the lab is committed. */
export type IngredientSelectionSetupState = {
	stageIndex: number
	/** One batch per completed stage in a staged recipe (same order as `consumptionLog`). */
	committedBatches: AlchemyLabSource[][]
	consumptionLog: Array<{ rawIds: string[]; craftedItemIds: string[] }>
	consumedRawIds: string[]
	consumedCraftedItemIds: string[]
	selectedKeys: string[]
}

export const initialIngredientSelectionSetup: IngredientSelectionSetupState = {
	stageIndex: 0,
	committedBatches: [],
	consumptionLog: [],
	consumedRawIds: [],
	consumedCraftedItemIds: [],
	selectedKeys: [],
}

interface AlchemyState {
	/** While choosing ingredients for a craft; cleared when the lab session starts or setup is reset. */
	setupRecipeId?: string
	ingredientSelectionSetup: IngredientSelectionSetupState
	currentRecipe?: string;
	playGrid?: HexMap;
	/** Lab sidebar rows: raw ingredients and/or crafted items used as sources. */
	ingredients: AlchemyLabSource[];
	placedComponents: Array<PlacedComponent>;
	/** Board snapshots before each placement (oldest first). Persisted for refresh-safe undo. */
	placementUndoPast: AlchemyBoardSnapshot[];
	/** Snapshots to restore on redo. */
	placementUndoFuture: AlchemyBoardSnapshot[];
	cursor: CursorState
}

/** Serializable slice of alchemy state (everything except transient cursor UI). */
export type PersistedAlchemyState = Omit<AlchemyState, 'cursor'>;

export const initialAlchemyState: AlchemyState = {
	setupRecipeId: undefined,
	ingredientSelectionSetup: { ...initialIngredientSelectionSetup },
	currentRecipe: undefined,
	playGrid: undefined,
	ingredients: [],
	placedComponents: [],
	placementUndoPast: [],
	placementUndoFuture: [],
	cursor: {
		isPlacing: false,
		selectedComponent: null,
		position: { x: 0, y: 0 },
		rotation: 0
	}
};

const alchemySlice = createSlice({
	name: 'alchemy',
	initialState: initialAlchemyState,
	reducers: {
		hydrateFromStorage: (state, action: PayloadAction<PersistedAlchemyState>) => {
			state.setupRecipeId = action.payload.setupRecipeId
			if (action.payload.ingredientSelectionSetup) {
				state.ingredientSelectionSetup = {
					...initialIngredientSelectionSetup,
					...action.payload.ingredientSelectionSetup,
					committedBatches: action.payload.ingredientSelectionSetup.committedBatches ?? [],
					consumptionLog: action.payload.ingredientSelectionSetup.consumptionLog ?? [],
					consumedRawIds: action.payload.ingredientSelectionSetup.consumedRawIds ?? [],
					consumedCraftedItemIds: action.payload.ingredientSelectionSetup.consumedCraftedItemIds ?? [],
					selectedKeys: action.payload.ingredientSelectionSetup.selectedKeys ?? [],
				}
			} else {
				state.ingredientSelectionSetup = { ...initialIngredientSelectionSetup }
			}
			state.currentRecipe = action.payload.currentRecipe;
			state.playGrid = action.payload.playGrid;
			const ing = action.payload.ingredients as unknown;
			if (Array.isArray(ing) && ing.length > 0 && typeof ing[0] === 'object' && ing[0] !== null && 'labKind' in ing[0]) {
				state.ingredients = ing as AlchemyLabSource[];
			} else if (Array.isArray(ing)) {
				state.ingredients = (ing as Ingredient[]).map((i) => ({ labKind: 'ingredient' as const, ingredient: i }));
			} else {
				state.ingredients = [];
			}
			state.placedComponents = action.payload.placedComponents;
			state.placementUndoPast = action.payload.placementUndoPast ?? [];
			state.placementUndoFuture = action.payload.placementUndoFuture ?? [];
			state.cursor = initialAlchemyState.cursor;
		},
		// Cursor
		setCursorPlacing: (state, action: PayloadAction<boolean>) => {
			state.cursor.isPlacing = action.payload;
		},
		setCursorComponent: (state, action: PayloadAction<AlchComponent | null>) => {
			state.cursor.isPlacing = (action.payload !== null);
			state.cursor.selectedComponent = action.payload;
		},
		setCursorPosition: (state, action: PayloadAction<Position>) => {
			state.cursor.position = action.payload;
		},
		/** Step rotation: positive = clockwise (one notch), negative = counter-clockwise. */
		adjustCursorRotation: (state, action: PayloadAction<number>) => {
			state.cursor.rotation += action.payload;
		},
		setCursorRotation: (state, action: PayloadAction<undefined>) => {
			state.cursor.rotation = state.cursor.rotation + 1;
		},
		resetCursor: (state) => {
			state.cursor = initialAlchemyState.cursor;
		},
		// Grid
		setPlayGrid: (state, action: PayloadAction<{ pos: Position, size: number, layers: number }>) => {
			const newGrid = Helpers.CreateHexGrid(action.payload.pos, action.payload.size, action.payload.layers);
			state.playGrid = newGrid;
			state.placedComponents = new Array<PlacedComponent>();
			state.placementUndoPast = [];
			state.placementUndoFuture = [];
		},
		clearPlayGrid: (state) => {
			state.playGrid = undefined;
			state.placedComponents = [];
			state.ingredients = [];
			state.placementUndoPast = [];
			state.placementUndoFuture = [];
		},
		addIngredients: (state, action: PayloadAction<AlchemyLabSource[]>) => {
			state.ingredients.push(...action.payload);
		},
		addIngredient: (state, action: PayloadAction<Ingredient>) => {
			state.ingredients.push({ labKind: 'ingredient', ingredient: action.payload });
		},
		removeIngredient: (state, action: PayloadAction<string>) => {
			const id = action.payload;
			state.ingredients = state.ingredients.filter((row) =>
				row.labKind === 'ingredient' ? row.ingredient.id !== id : row.labSlotId !== id,
			);
		},
		addPlacedComponent: (state, action: PayloadAction<HexTile>) => {
			if (!state.playGrid) return;
			const snapshot = cloneBoardSnapshot(state.playGrid, state.placedComponents);
			state.placementUndoPast.push(snapshot);
			if (state.placementUndoPast.length > MAX_PLACEMENT_UNDO) {
				state.placementUndoPast.shift();
			}
			state.placementUndoFuture = [];

			const newPlacedComponent = Helpers.CompilePlacedComponent(state.playGrid, action.payload, action.payload.position, state.cursor.rotation, state.cursor.selectedComponent!);
			state.placedComponents.push(newPlacedComponent);
			Helpers.OccupyHexes(state.playGrid, newPlacedComponent);
			state.cursor = initialAlchemyState.cursor;
		},
		undoPlacement: (state) => {
			if (!state.playGrid || state.placementUndoPast.length === 0) return;
			const prev = state.placementUndoPast.pop()!;
			const currentSnap = cloneBoardSnapshot(state.playGrid, state.placedComponents);
			state.placementUndoFuture.push(currentSnap);
			state.playGrid = JSON.parse(JSON.stringify(prev.playGrid)) as HexMap;
			state.placedComponents = JSON.parse(JSON.stringify(prev.placedComponents)) as PlacedComponent[];
			state.cursor = initialAlchemyState.cursor;
		},
		redoPlacement: (state) => {
			if (!state.playGrid || state.placementUndoFuture.length === 0) return;
			const next = state.placementUndoFuture.pop()!;
			const currentSnap = cloneBoardSnapshot(state.playGrid, state.placedComponents);
			state.placementUndoPast.push(currentSnap);
			if (state.placementUndoPast.length > MAX_PLACEMENT_UNDO) {
				state.placementUndoPast.shift();
			}
			state.playGrid = JSON.parse(JSON.stringify(next.playGrid)) as HexMap;
			state.placedComponents = JSON.parse(JSON.stringify(next.placedComponents)) as PlacedComponent[];
			state.cursor = initialAlchemyState.cursor;
		},
		removePlacedComponent: (state, action: PayloadAction<string>) => {
			//delete state.placedComponents[action.payload];
		},
		// Ingredient selection (pre-lab) — also cleared by `clearRecipe` and when entering the lab
		startIngredientSelection: (state, action: PayloadAction<string>) => {
			state.setupRecipeId = action.payload
			state.ingredientSelectionSetup = { ...initialIngredientSelectionSetup }
		},
		replaceIngredientSelectionSetup: (state, action: PayloadAction<IngredientSelectionSetupState>) => {
			state.ingredientSelectionSetup = action.payload
		},
		clearIngredientSelectionSetup: (state) => {
			state.setupRecipeId = undefined
			state.ingredientSelectionSetup = { ...initialIngredientSelectionSetup }
		},
		// Recipe
		setCurrentRecipe: (state, action: PayloadAction<string>) => {
			state.currentRecipe = action.payload;
		},
		clearRecipe: (state) => {
			state.currentRecipe = undefined
			state.setupRecipeId = undefined
			state.ingredientSelectionSetup = { ...initialIngredientSelectionSetup }
		},
		/** Full reset to `initialAlchemyState` (abandon session / pick another recipe). */
		resetSliceToInitial: (): AlchemyState => structuredClone(initialAlchemyState),
	}
});

export default {
	reducer: alchemySlice.reducer,
	slice: alchemySlice,
	actions: alchemySlice.actions
};