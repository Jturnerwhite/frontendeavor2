'use client';

import { publicAsset } from '@/lib/publicAsset';
import type { ExplanationSectionProps } from './explanationSectionProps';
import './explanationHelp.css';

export function ExplanationItemsSection({ className }: ExplanationSectionProps): JSX.Element {
	return (
		<section aria-labelledby="explanation-items" className={className}>
			<h2 id="explanation-items" className="explanation-section-heading">
				Items
			</h2>
			<div className="explanation-card space-y-3 p-5 sm:p-6 md:p-7">
				<figure className="explanation-figure mb-5">
					<img src={publicAsset('/helpImages/ingredient.PNG')} alt="An example ingredient." />
				</figure>
				<p className="explanation-prose">
					In this game, items are crafted from ingredients which are commonly gathered from
					the map page.
					<br />
					Some recipes are created from items and/or ingredients, or require specific items
					with specific &apos;item tags&apos;.
					<br />
					<br />
					Items and ingredients both have the following:
					<br />
				</p>
				<ul>
					<li>A name</li>
					<li>Quality</li>
					<li>A list of item tags</li>
					<li>A collection of components</li>
				</ul>
				<h3>Components</h3>
				<p className="explanation-prose">
					Components are the individual parts of an item, and are made up of a single element
					and a shape. The components an item has is important, as these act as puzzle
					pieces when crafting items.
					<br />
					Some components have &apos;link spots&apos; (denoted by a 6 sided star) which can be
					linked to other components. Linking components together allows for the creation of
					more complex items, with more component nodes and advanced effects.
				</p>
				<h3>Quality</h3>
				<p className="explanation-prose">
					Quality is a measure of the generalized rarity and value of an ingredient, and how
					well a crafted item is made.
					<br />
					Currently, quality is only used to determine the &apos;link spots&apos; on
					ingredients gathered.
				</p>
			</div>
		</section>
	);
}
