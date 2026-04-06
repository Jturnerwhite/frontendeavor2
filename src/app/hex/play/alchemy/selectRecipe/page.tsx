'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Recipes } from '@/app/hex/architecture/data/recipes';
import { ITEM_TAG } from '@/app/hex/architecture/enums';
import type { IngredientBase, Recipe } from '@/app/hex/architecture/typings';
import '../alchemy.css';

function formatRequiredIngredient(entry: IngredientBase | ITEM_TAG): string {
	if (typeof entry === 'object' && entry !== null && 'name' in entry) {
		return entry.name;
	}
	return String(entry);
}

export default function SelectRecipePage() {
	const router = useRouter();

	function chooseRecipe(recipe: Recipe) {
		router.push(`/hex/play/alchemy/selectIngredients?recipeId=${encodeURIComponent(recipe.id)}`);
	}

	return (
		<div className="alchemy-setup-flow">
			<header className="alchemy-setup-header">
				<h1>Choose a recipe</h1>
				<p className="alchemy-setup-lead">Select a recipe to see required ingredients and element targets.</p>
			</header>
			<ul className="alchemy-recipe-list">
				{Recipes.map((recipe) => (
					<li key={recipe.id} className="alchemy-recipe-card">
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
									{recipe.requiredIngredients.map((req, i) => (
										<li key={i}>{formatRequiredIngredient(req)}</li>
									))}
								</ul>
							</section>
						)}
						<button
							type="button"
							className="alchemy-setup-primary"
							onClick={() => chooseRecipe(recipe)}
						>
							Choose this recipe
						</button>
					</li>
				))}
			</ul>
			<p className="alchemy-setup-back">
				<Link href="/hex">Back to hub</Link>
			</p>
		</div>
	);
}
