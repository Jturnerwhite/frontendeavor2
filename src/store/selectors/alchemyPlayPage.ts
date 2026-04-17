import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';

/**
 * Single memoized view of Alchemy state for the play page — one subscription instead of many.
 */
export const selectAlchemyPlayPageView = createSelector(
	[
		(state: RootState) => state.Alchemy.playGrid,
		(state: RootState) => state.Alchemy.placedComponents,
		(state: RootState) => state.Alchemy.ingredients,
		(state: RootState) => state.Alchemy.cursor,
		(state: RootState) => state.Alchemy.currentRecipe,
		(state: RootState) => state.Alchemy.placementUndoPast.length,
		(state: RootState) => state.Alchemy.placementUndoFuture.length,
	],
	(
		playGrid,
		placedComponents,
		ingredients,
		cursor,
		currentRecipeId,
		undoPastLen,
		undoFutureLen,
	) => ({
		playGrid,
		placedComponents,
		ingredients,
		cursor,
		currentRecipeId,
		canUndoPlacement: undoPastLen > 0,
		canRedoPlacement: undoFutureLen > 0,
	}),
);
