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
	cursor: CursorState
}
const initialState: AlchemyState = {
	currentRecipe: undefined,
	playGrid: undefined,
	cursor: {
		isPlacing: false,
		selectedComponent: null,
		position: { x: 0, y: 0 },
		rotation: 30
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
		setCursorRotation: (state, action: PayloadAction<number>) => {
			state.cursor.rotation = action.payload;
		},
		resetCursor: (state) => {
			state.cursor = initialState.cursor;
		},
		// Grid
		setPlayGrid: (state, action: PayloadAction<{ pos: Position, size: number, layers: number }>) => {
			const newGrid = Helpers.CreateHexGrid(action.payload.pos, action.payload.size, action.payload.layers);
			console.log(newGrid);
			state.playGrid = newGrid;
		},
		clearPlayGrid: (state) => {
			state.playGrid = undefined;
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