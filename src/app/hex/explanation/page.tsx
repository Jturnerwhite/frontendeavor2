'use client';

import Link from 'next/link';
import { useLayoutEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import Settings from '@/store/features/settingsSlice';
import { publicAsset } from '@/lib/publicAsset';
import '@/app/hex/explanation/explanation.css';

export default function Page() {
	const dispatch = useAppDispatch();

	useLayoutEffect(() => {
		dispatch(Settings.actions.markNotFirstVisit());
	}, [dispatch]);

	return (
		<div className="explanation-root">
			<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12 lg:py-14">
				<header className="mb-10 flex flex-row items-start justify-between gap-4 sm:mb-12 sm:gap-8">
					<div className="min-w-0 flex-1 text-balance text-center md:text-left">
						<h1 className="explanation-title">Explanation</h1>
						<p className="explanation-subtitle mx-auto md:mx-0">
							How gathering, crafting, and the map fit together.
						</p>
					</div>
					<nav
						className="explanation-back explanation-back--top shrink-0 pt-1 text-right sm:pt-0.5"
						aria-label="Page navigation"
					>
						<Link href="/hex/map">Back to map</Link>
					</nav>
				</header>

				<div className="flex flex-col gap-10 md:gap-12">
					<section aria-labelledby="explanation-overview">
						<h2 id="explanation-overview" className="explanation-section-heading">
							Overview
						</h2>
						<div className="explanation-card p-5 sm:p-6 md:p-7">
							<p className="explanation-prose">
								This is a game about creating alchemical items by combining ingredients on a grid.
								Collect ingredients from the map, then use Home to craft them into new items.
							</p>
						</div>
					</section>

					<section aria-labelledby="explanation-map">
						<h2 id="explanation-map" className="explanation-section-heading">
							Map
						</h2>
						<div className="explanation-card space-y-3 p-5 sm:p-6 md:p-7">
							<figure className="explanation-figure mb-5">
								<img src={publicAsset('/helpImages/map.PNG')} alt="The world map: hex biomes, home, and town." />
							</figure>
							<p className="explanation-prose">
								The map is a grid of hex tiles. Each tile has a biome and a chance to hold an ingredient.
								Different biomes offer different ingredients, and biomes can have multiple ingredients available at different rarities.<br/>
								Some locations, such as the lake, have a special minigame associated with them.
							</p>
							<p className="explanation-prose">
								Your inventory appears on the left. The center hex is <strong>Home</strong>, where you craft.
								The settlement icon is a <strong>town</strong> — visit the quest board to turn in items.
							</p>
						</div>
					</section>
					
					<section aria-labelledby="explanation-items">
						<h2 id="explanation-items" className="explanation-section-heading">
							Items
						</h2>
						<div className="explanation-card space-y-3 p-5 sm:p-6 md:p-7">
							<figure className="explanation-figure mb-5">
								<img src={publicAsset('/helpImages/ingredient.PNG')} alt="An example ingredient." />
							</figure>
							<p className="explanation-prose">
								In this game, items are crafted from ingredients which are commonly gathered from the map page.<br/>
								Some recipes are created from items and/or ingredients, or require specific items with specific 'item tags'.<br/>
								<br/>
								Items and ingredients both have the following:<br/>
								<ul>
									<li>A name</li>
									<li>Quality</li>
									<li>A list of item tags</li>
									<li>A collection of components</li>
								</ul>
							</p>
							<h3>Components</h3>
							<p className="explanation-prose">
								Components are the individual parts of an item, and are made up of a single element and a shape.  The components an item has is important, as these act as puzzle pieces when crafting items.<br/>
								Some components have 'link spots' (denoted by a 6 sided star) which can be linked to other components.
								Linking components together allows for the creation of more complex items, with more component nodes and advanced effects.
							</p>
							<h3>Quality</h3>
							<p className="explanation-prose">
								Quality is a measure of the generalized rarity and value of an ingredient, and how well a crafted item is made.<br/>
								Currently, quality is only used to determine the 'link spots' on ingredients gathered.
							</p>
						</div>
					</section>

					<section aria-labelledby="explanation-crafting">
						<h2 id="explanation-crafting" className="explanation-section-heading">
							Crafting
						</h2>
						<div className="explanation-card space-y-3 p-5 sm:p-6 md:p-7">
							<h3>Selecting a recipe</h3>
							<figure className="explanation-figure mb-5">
								<img
									src={publicAsset('/helpImages/selectRecipe.PNG')}
									alt="The recipe selection interface: a list of recipes and their descriptions."
								/>
							</figure>
							<p className="explanation-prose">
								When selecting a recipe, you will see an assortment of bars and some "components" after them.<br/>
								These bars represent the elements required to craft the item, and can be seen as progress bars or 'goals' to be filled.<br/>
								The components at the end of each line shows the possible shapes that will result when the item is crafted; the more bars that are filled of a specific element, the more nodes that will appear in that element's final component on the item.<br/>
								Some bars are 'grayed out' if they need to be "unlocked" as a part of the craft.  That will be discussed below.
							</p>
							<h3>How to craft</h3>
							<figure className="explanation-figure mb-5">
								<img
									src={publicAsset('/helpImages/crafting.PNG')}
									alt="The crafting interface: ingredients, recipes, and quality."
								/>
							</figure>
							<p className="explanation-prose">
								Items are crafted by combining ingredients in a hex grid.<br/>
								After selecting a recipe, and the ingredients you want to use, you will be presented with the board that you will place "components" of ingredients on.<br/>
							</p>
							<p className="explanation-prose">
								Click on components in the left panel to pick them up, and click again on the board to place them.<br/>
								While placing, you can use the scroll wheel to rotate the component, and the right click to cancel the placement.
							</p>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
