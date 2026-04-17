'use client';

import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import RecipeDisplay from '@/app/hex/play/components/recipeDisplay';
import '../play/alchemy/alchemy.css';

export default function HistoryPage() {
	const completedCrafts = useAppSelector((state) => state.History.completedCrafts);

	if (completedCrafts.length === 0) {
		return (
			<div className="alchemy-setup-flow">
				<header className="alchemy-setup-header">
					<h1>Craft history</h1>
					<p className="alchemy-setup-lead">No completed crafts yet. Finish a recipe in the alchemy lab to see it here.</p>
				</header>
				<p className="alchemy-setup-back">
					<Link href="/hex/play/alchemy">Go to alchemy</Link>
					{' · '}
					<Link href="/hex">Back to hub</Link>
				</p>
			</div>
		);
	}

	const newestFirst = [...completedCrafts].reverse();

	return (
		<div className="alchemy-setup-flow">
			<header className="alchemy-setup-header">
				<h1>Craft history</h1>
				<p className="alchemy-setup-lead">
					{completedCrafts.length} completed craft{completedCrafts.length === 1 ? '' : 's'}, newest first.
				</p>
			</header>
			<ul className="alchemy-recipe-list">
				{newestFirst.map((snap, idx) => {
					const { item, recipe, elementScores } = snap;
					const stableKey = completedCrafts.length - 1 - idx;
					return (
						<li key={stableKey} className="alchemy-recipe-card">
							<div className="alchemy-recipe-card-head">
								<h2>{item.name}</h2>
								<span className="alchemy-recipe-id">quality {item.quality}</span>
							</div>
							<div className="alchemy-complete-recipe-wrap">
								<RecipeDisplay
									recipe={recipe}
									quality={item.quality}
									currentElementScores={elementScores}
								/>
							</div>
						</li>
					);
				})}
			</ul>
			<p className="alchemy-setup-back">
				<Link href="/hex">Back to hub</Link>
			</p>
		</div>
	);
}
