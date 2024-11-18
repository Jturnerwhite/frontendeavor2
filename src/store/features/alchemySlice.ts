import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { HexTile, HexMap, Position } from '@/app/hex/architecture/interfaces';
import * as Helpers from '@/app/hex/architecture/helpers';

interface AlchemyState {
	currentRecipe?: string;
	playGrid?: HexMap;
}

const initialState: AlchemyState = {
	currentRecipe: undefined,
	playGrid: undefined
};

const alchemySlice = createSlice({
	name: 'alchemy',
	initialState,
	reducers: {
		setCurrentRecipe: (state, action: PayloadAction<string>) => {
			state.currentRecipe = action.payload;
		},
		clearRecipe: (state) => {
			state.currentRecipe = undefined;
		},
		setPlayGrid: (state, action: PayloadAction<{pos:Position, size:number, layers:number}>) => {
			const newGrid = Helpers.CreateHexGrid(action.payload.pos, action.payload.size, action.payload.layers);
			console.log(newGrid);
			state.playGrid = newGrid;
		},
		clearPlayGrid: (state) => {
			state.playGrid = undefined;
		},
	}
});

export default {
	reducer: alchemySlice.reducer,
	slice: alchemySlice,
	actions: alchemySlice.actions
};