'use client';

import { publicAsset } from '@/lib/publicAsset';
import type { ExplanationSectionProps } from './explanationSectionProps';
import './explanationHelp.css';

export function ExplanationCraftingSection({ className }: ExplanationSectionProps): JSX.Element {
	return (
		<section aria-labelledby="explanation-how-to-craft" className={className}>
			<h2 id="explanation-how-to-craft" className="explanation-section-heading">
				How to craft
			</h2>
			<div className="explanation-card space-y-3 p-5 sm:p-6 md:p-7">
				<figure className="explanation-figure mb-5">
					<img
						src={publicAsset('/helpImages/crafting.PNG')}
						alt="The crafting interface: ingredients, recipes, and quality."
					/>
				</figure>
				<p className="explanation-prose">
					Items are crafted by combining ingredients in a hex grid.
					<br />
					After selecting a recipe, and the ingredients you want to use, you will be
					presented with the board that you will place &quot;components&quot; of ingredients
					on.
				</p>
				<p className="explanation-prose">
					Click on components in the left panel to pick them up, and click again on the
					board to place them.
					<br />
					While placing, you can use the scroll wheel to rotate the component, and the right
					click to cancel the placement.
				</p>
			</div>
		</section>
	);
}
