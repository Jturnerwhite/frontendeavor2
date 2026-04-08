'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Recipes } from '@/app/hex/architecture/data/recipes';
import type { Recipe, RecipeRequiredIngredient } from '@/app/hex/architecture/typings';
import {
	formatRequiredIngredientEntry,
	playerMeetsRequirement,
} from '@/app/hex/architecture/helpers/recipeRequirements';
import { RootState } from '@/store/store';
import '../alchemy.css';

function RecipeCardContents({
	recipe,
	canChoose,
	onChoose,
	meetsRequirement,
}: {
	recipe: Recipe;
	canChoose: boolean;
	onChoose: () => void;
	meetsRequirement: (req: RecipeRequiredIngredient) => boolean;
}) {
	return (
		<div className="alchemy-recipe-card">
			<div className="alchemy-recipe-card-head">
				<h2>{recipe.description}</h2>
				<span className="alchemy-recipe-id">{recipe.id}</span>
			</div>
			<section className="alchemy-recipe-section">
				<h3>Element scores</h3>
				<ul className="alchemy-element-scores">
					{recipe.elementScores.map((es) => (
						<li key={es.element}>
							<strong>{es.element}</strong>
							<span className="alchemy-score-meta">
								soft cap {es.softCap}, cap {es.cap}
							</span>
						</li>
					))}
				</ul>
			</section>
			{recipe.requiredIngredients && recipe.requiredIngredients.length > 0 && (
				<section className="alchemy-recipe-section">
					<h3>Required ingredients</h3>
					<ul className="alchemy-required-list">
						{recipe.requiredIngredients.map((req, i) => {
							const met = meetsRequirement(req);
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
				</section>
			)}
			<button type="button" className="alchemy-setup-primary" disabled={!canChoose} onClick={onChoose}>
				Choose this recipe
			</button>
		</div>
	);
}

export default function SelectRecipePage() {
	const router = useRouter();
	const inventoryItems = useSelector((state: RootState) => state.Player.inventory.crafted);
	const rawIngredients = useSelector((state: RootState) => state.Player.inventory.raw);

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
					<Link href="/hex">Back to hub</Link>
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
										<span className="alchemy-recipe-picker-icon" aria-hidden />
										<span className="alchemy-recipe-picker-name">{recipe.description}</span>
									</button>
								</li>
							);
						})}
					</ul>
				</aside>
				<div className="alchemy-recipe-detail-panel">
					<RecipeCardContents
						recipe={selectedRecipe}
						canChoose={playerHasIngredientsForRecipe(selectedRecipe)}
						onChoose={() => chooseRecipe(selectedRecipe)}
						meetsRequirement={(req) => playerMeetsRequirement(req, rawIngredients, inventoryItems)}
					/>
				</div>
			</div>
			<p className="alchemy-setup-back">
				<Link href="/hex">Back to hub</Link>
			</p>
		</div>
	);
}
