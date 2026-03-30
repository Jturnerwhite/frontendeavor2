import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { HexTile, HexMap, Position } from '@/app/hex/architecture/interfaces';
import * as Helpers from '@/app/hex/architecture/helpers';
import { AlchComponent } from '@/app/hex/architecture/typings';

interface CursorState {
	isPlacing: boolean;
	selectedComponent: AlchComponent | null;
	position: Position;
	rotation: number;
}

interface AlchemyState {
	currentRecipe?: string;
	playGrid?: HexMap;
	placedComponents?: Array<{comp: AlchComponent, position: Position, rotation: number, centerHexId: string}>;
	cursor: CursorState
}

const initialState: AlchemyState = {
	currentRecipe: undefined,
	playGrid: undefined,
	cursor: {
		isPlacing: false,
		selectedComponent: null,
		position: { x: 0, y: 0 },
		rotation: 0
	}
};

const alchemySlice = createSlice({
	name: 'alchemy',
	initialState,
	reducers: {
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
			state.cursor = initialState.cursor;
		},
		// Grid
		setPlayGrid: (state, action: PayloadAction<{ pos: Position, size: number, layers: number }>) => {
			const newGrid = Helpers.CreateHexGrid(action.payload.pos, action.payload.size, action.payload.layers);
			state.playGrid = newGrid;
			state.placedComponents = new Array<{comp: AlchComponent, position: Position, rotation: number, centerHexId: string}>();
		},
		clearPlayGrid: (state) => {
			state.playGrid = undefined;
			state.placedComponents = undefined;
		},
		addPlacedComponent: (state, action: PayloadAction<HexTile>) => {
			if (!state.placedComponents) 
				state.placedComponents = new Array<{comp: AlchComponent, position: Position, rotation: number, centerHexId: string}>();

			state.placedComponents.push({
				comp: state.cursor.selectedComponent!, 
				position: action.payload.position,
				rotation: state.cursor.rotation,
				centerHexId: action.payload.id 
			});
			Helpers.OccupyHexes(state.playGrid!, state.cursor.selectedComponent!, state.cursor.rotation, action.payload.id);
			state.cursor = initialState.cursor;
		},
		removePlacedComponent: (state, action: PayloadAction<string>) => {
			if (!state.placedComponents) return;
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