import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { HexTile, HexMap, Position, PlacedComponent } from '@/app/hex/architecture/interfaces';
import * as Helpers from '@/app/hex/architecture/helpers/alchHelpers';
import { AlchComponent, Ingredient } from '@/app/hex/architecture/typings';

interface CursorState {
	isPlacing: boolean;
	selectedComponent: AlchComponent | null;
	position: Position;
	rotation: number;
}

interface AlchemyState {
	currentRecipe?: string;
	playGrid?: HexMap;
	ingredients: Array<Ingredient>;
	placedComponents: Array<PlacedComponent>;
	cursor: CursorState
}

/** Serializable slice of alchemy state (everything except transient cursor UI). */
export type PersistedAlchemyState = Omit<AlchemyState, 'cursor'>;

export const initialAlchemyState: AlchemyState = {
	currentRecipe: undefined,
	playGrid: undefined,
	ingredients: [],
	placedComponents: [],
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
			state.currentRecipe = action.payload.currentRecipe;
			state.playGrid = action.payload.playGrid;
			state.ingredients = action.payload.ingredients;
			state.placedComponents = action.payload.placedComponents;
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
		},
		clearPlayGrid: (state) => {
			state.playGrid = undefined;
			state.placedComponents = [];
			state.ingredients = [];
		},
		addIngredients: (state, action: PayloadAction<Array<Ingredient>>) => {
			state.ingredients.push(...action.payload);
		},
		addIngredient: (state, action: PayloadAction<Ingredient>) => {
			state.ingredients.push(action.payload);
		},
		removeIngredient: (state, action: PayloadAction<string>) => {
			state.ingredients = state.ingredients.filter(ingredient => ingredient.id !== action.payload);
		},
		addPlacedComponent: (state, action: PayloadAction<HexTile>) => {

			const newPlacedComponent = Helpers.CompilePlacedComponent(state.playGrid!, action.payload, action.payload.position, state.cursor.rotation, state.cursor.selectedComponent!);
			state.placedComponents.push(newPlacedComponent);
			Helpers.OccupyHexes(state.playGrid!, newPlacedComponent);
			state.cursor = initialAlchemyState.cursor;
		},
		removePlacedComponent: (state, action: PayloadAction<string>) => {
			//delete state.placedComponents[action.payload];
		},
		// Recipe
		setCurrentRecipe: (state, action: PayloadAction<string>) => {
			state.currentRecipe = action.payload;
		},
		clearRecipe: (state) => {
			state.currentRecipe = undefined;
		},
	}
});

export default {
	reducer: alchemySlice.reducer,
	slice: alchemySlice,
	actions: alchemySlice.actions
};