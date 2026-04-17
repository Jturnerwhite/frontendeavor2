'use client';

import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Recipes } from '@/app/hex/architecture/data/recipes';
import type { Recipe } from '@/app/hex/architecture/typings';
import {
	formatRequiredIngredientEntry,
	playerMeetsRequirement,
} from '@/app/hex/architecture/helpers/recipeRequirements';
import AlchemyStoreSlice from '@/store/features/alchemySlice';
import RecipeDisplay from '@/app/hex/play/components/recipeDisplay';
import '../alchemy.css';

export default function SelectRecipePage() {
	const dispatch = useAppDispatch();
	const router = useRouter();

	useEffect(() => {
		dispatch(AlchemyStoreSlice.actions.clearRecipe());
		dispatch(AlchemyStoreSlice.actions.clearPlayGrid());
		dispatch(AlchemyStoreSlice.actions.resetCursor());
	}, [dispatch]);
	const inventoryItems = useAppSelector((state) => state.Player.inventory.crafted);
	const rawIngredients = useAppSelector((state) => state.Player.inventory.raw);

	const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(() => Recipes[0] ?? null);

	function playerHasIngredientsForRecipe(recipe: Recipe): boolean {
		if (!recipe.requiredIngredients) return true;
		return recipe.requiredIngredients.every((req) =>
			playerMeetsRequirement(req, rawIngredients, inventoryItems),
		);
	}

	function chooseRecipe(recipe: Recipe) {
		router.push(`/hex/play/alchemy/selectIngredients?recipeId=${encodeURIComponent(recipe.id)}`);
	}

	if (Recipes.length === 0 || !selectedRecipe) {
		return (
			<div className="alchemy-setup-flow alchemy-select-recipe-page">
				<header className="alchemy-setup-header">
					<h1>Choose a recipe</h1>
					<p className="alchemy-setup-lead">No recipes are defined yet.</p>
				</header>
				<p className="alchemy-setup-back">
					<Link href="/hex/map/home">Back to home</Link>
				</p>
			</div>
		);
	}

	return (
		<div className="alchemy-setup-flow alchemy-select-recipe-page">
			<header className="alchemy-setup-header">
				<h1>Choose a recipe</h1>
				<p className="alchemy-setup-lead">Select a recipe on the left to view details and continue.</p>
			</header>
			<div className="alchemy-select-recipe-layout">
				<aside className="alchemy-recipe-picker-panel" aria-label="Recipe list">
					<ul className="alchemy-recipe-picker-list">
						{Recipes.map((recipe) => {
							const isSelected = selectedRecipe.id === recipe.id;
							return (
								<li key={recipe.id}>
									<button
										type="button"
										className={
											'alchemy-recipe-picker-row' + (isSelected ? ' alchemy-recipe-picker-row--selected' : '')
										}
										onClick={() => setSelectedRecipe(recipe)}
									>
										<span className="alchemy-recipe-picker-icon" aria-hidden>
											{recipe.image ? (
												<img src={recipe.image} alt="" />
											) : null}
										</span>
										<span className="alchemy-recipe-picker-name">{recipe.description}</span>
									</button>
								</li>
							);
						})}
					</ul>
				</aside>
				<div className="alchemy-recipe-detail-panel">
					<RecipeDisplay recipe={selectedRecipe} />
					{selectedRecipe.requiredIngredients && selectedRecipe.requiredIngredients.length > 0 && (
						<section className="alchemy-recipe-req-section">
							<h3>Required Ingredients</h3>
							<div className="alchemy-required-list">
								<ul>
									{selectedRecipe.requiredIngredients.map((req, i) => {
										const met = playerMeetsRequirement(req, rawIngredients, inventoryItems);
										return (
											<li
												key={i}
												className={met ? undefined : 'alchemy-required-list--missing'}
											>
												{formatRequiredIngredientEntry(req)}
											</li>
										);
									})}
								</ul>
							</div>
						</section>
					)}
					<button
						type="button"
						className="alchemy-setup-primary"
						disabled={!playerHasIngredientsForRecipe(selectedRecipe)}
						onClick={() => chooseRecipe(selectedRecipe)}
					>
						Choose this recipe
					</button>
				</div>
			</div>
			<p className="alchemy-setup-back">
				<Link href="/hex/map/home">Back to home</Link>
			</p>
		</div>
	);
}
