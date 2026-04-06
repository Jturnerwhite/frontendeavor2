'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import AlchemyStoreSlice from '@/store/features/alchemySlice';
import { IngedientBases } from '@/app/hex/architecture/data/ingedientBases';
import { Recipes } from '@/app/hex/architecture/data/recipes';
import * as Helpers from '@/app/hex/architecture/helpers';
import '../alchemy.css';

const BASE_KEYS = Object.keys(IngedientBases) as Array<keyof typeof IngedientBases>;

function SelectIngredientsInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const dispatch = useDispatch();
	const recipeId = searchParams.get('recipeId');

	const recipe = useMemo(
		() => (recipeId ? Recipes.find((r) => r.id === recipeId) : undefined),
		[recipeId],
	);

	const [selectedKeys, setSelectedKeys] = useState<Set<string>>(() => new Set());

	const toggleKey = useCallback((key: string) => {
		setSelectedKeys((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	}, []);

	const onContinue = useCallback(() => {
		if (!recipe || selectedKeys.size === 0) return;
		const ingredients = Array.from(selectedKeys).map((key) =>
			Helpers.CreateIngredient(IngedientBases[key as keyof typeof IngedientBases]),
		);
		dispatch(AlchemyStoreSlice.actions.clearPlayGrid());
		dispatch(AlchemyStoreSlice.actions.setCurrentRecipe(recipe.id));
		dispatch(AlchemyStoreSlice.actions.addIngredients(ingredients));
		router.push('/hex/play/alchemy');
	}, [recipe, selectedKeys, dispatch, router]);

	if (!recipeId || !recipe) {
		return (
			<div className="alchemy-setup-flow">
				<h1>Invalid recipe</h1>
				<p className="alchemy-setup-lead">Choose a recipe from the list first.</p>
				<p>
					<Link href="/hex/play/alchemy/selectRecipe" className="alchemy-setup-link">
						Back to recipes
					</Link>
				</p>
			</div>
		);
	}

	return (
		<div className="alchemy-setup-flow">
			<header className="alchemy-setup-header">
				<h1>Select ingredients</h1>
				<p className="alchemy-setup-lead">
					Recipe: <strong>{recipe.description}</strong> ({recipe.id})
				</p>
			</header>
			<p className="alchemy-setup-hint">Select one or more ingredient bases to bring to the lab.</p>
			<ul className="alchemy-ingredient-pick-list">
				{BASE_KEYS.map((key) => {
					const base = IngedientBases[key];
					const checked = selectedKeys.has(key);
					return (
						<li key={key}>
							<label className="alchemy-ingredient-pick-row">
								<input
									type="checkbox"
									checked={checked}
									onChange={() => toggleKey(key)}
								/>
								<span>{base.name}</span>
							</label>
						</li>
					);
				})}
			</ul>
			<div className="alchemy-setup-actions">
				<button
					type="button"
					className="alchemy-setup-primary"
					disabled={selectedKeys.size === 0}
					onClick={onContinue}
				>
					Continue
				</button>
				<Link href="/hex/play/alchemy/selectRecipe" className="alchemy-setup-secondary">
					Back
				</Link>
			</div>
		</div>
	);
}

export default function SelectIngredientsPage() {
	return (
		<Suspense
			fallback={
				<div className="alchemy-setup-flow">
					<p className="alchemy-setup-lead">Loading…</p>
				</div>
			}
		>
			<SelectIngredientsInner />
		</Suspense>
	);
}
