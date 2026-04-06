'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import RecipeDisplay from '@/app/hex/play/components/recipeDisplay';
import '../alchemy.css';

export default function AlchemyCompletePage() {
	const last = useSelector((state: RootState) => state.History.lastCompletedCraft);

	if (!last) {
		return (
			<div className="alchemy-setup-flow">
				<h1>No craft to show</h1>
				<p className="alchemy-setup-lead">Complete a recipe from the alchemy lab first.</p>
				<p className="alchemy-setup-back">
					<Link href="/hex/play/alchemy">Back to alchemy</Link>
					{' · '}
					<Link href="/hex">Return to hub</Link>
				</p>
			</div>
		);
	}

	const { item, recipe, elementScores } = last;

	return (
		<div className="alchemy-setup-flow">
			<header className="alchemy-setup-header">
				<h1>Craft complete</h1>
				<p className="alchemy-setup-lead">
					<strong>{item.name}</strong> — quality <strong>{item.quality}</strong>
				</p>
			</header>
			<div className="alchemy-complete-recipe-wrap">
				<RecipeDisplay
					recipe={recipe}
					quality={item.quality}
					currentElementScores={elementScores}
				/>
			</div>
			<p className="alchemy-setup-back">
				<Link href="/hex">Return to hub</Link>
			</p>
		</div>
	);
}
