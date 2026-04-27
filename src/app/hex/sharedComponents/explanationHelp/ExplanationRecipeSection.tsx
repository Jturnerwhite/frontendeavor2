'use client';

import { publicAsset } from '@/lib/publicAsset';
import type { ExplanationSectionProps } from './explanationSectionProps';
import './explanationHelp.css';

export function ExplanationRecipeSection({ className }: ExplanationSectionProps): JSX.Element {
	return (
		<section aria-labelledby="explanation-selecting-recipe" className={className}>
			<h2 id="explanation-selecting-recipe" className="explanation-section-heading">
				Selecting a recipe
			</h2>
			<div className="explanation-card space-y-3 p-5 sm:p-6 md:p-7">
				<figure className="explanation-figure mb-5">
					<img
						src={publicAsset('/helpImages/selectRecipe.PNG')}
						alt="The recipe selection interface: a list of recipes and their descriptions."
					/>
				</figure>
				<p className="explanation-prose">
					When selecting a recipe, you will see an assortment of bars and some
					&quot;components&quot; after them.
					<br />
					These bars represent the elements required to craft the item, and can be seen as
					progress bars or &apos;goals&apos; to be filled.
					<br />
					The components at the end of each line shows the possible shapes that will result
					when the item is crafted; the more bars that are filled of a specific element, the
					more nodes that will appear in that element&apos;s final component on the item.
					<br />
					Some bars are &apos;grayed out&apos; if they need to be &quot;unlocked&quot; as a
					part of the craft. That will be discussed below.
				</p>
			</div>
		</section>
	);
}
