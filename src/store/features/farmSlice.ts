import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HexMap, Position } from "@/app/hex/architecture/interfaces";
import { Ingredient } from "@/app/hex/architecture/typings";
import * as Helpers from '@/app/hex/architecture/helpers';

interface FarmState {
	farmGrid?: HexMap;
	ingredients: Record<string, Ingredient>;
}

const initialState: FarmState = {
	farmGrid: undefined,
	ingredients: {} as Record<string, Ingredient>,
}

const farmSlice = createSlice({
	name: 'farm',
	initialState,
	reducers: {
		setFarmGrid: (state, action: PayloadAction<{ pos: Position, size: number, layers: number }>) => {
			const newGrid = Helpers.CreateHexGrid(action.payload.pos, action.payload.size, action.payload.layers);
			state.farmGrid = newGrid;
		},
		clearFarmGrid: (state) => {
			state.farmGrid = undefined;
		},
		addIngredient: (state, action: PayloadAction<{key: string, ingredient: Ingredient}>) => {
			state.ingredients[action.payload.key] = action.payload.ingredient;
		},
		removeIngredient: (state, action: PayloadAction<{key: string}>) => {
			delete state.ingredients[action.payload.key];
		},
		clearIngredients: (state) => {
			state.ingredients = {} as Record<string, Ingredient>;
		}
	}
});

export default {
	reducer: farmSlice.reducer,
	slice: farmSlice,
	actions: farmSlice.actions
};