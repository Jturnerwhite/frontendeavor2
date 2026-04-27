'use client';

import { publicAsset } from '@/lib/publicAsset';
import type { ExplanationSectionProps } from './explanationSectionProps';
import './explanationHelp.css';

export function ExplanationMapSection({ className }: ExplanationSectionProps): JSX.Element {
	return (
		<section aria-labelledby="explanation-map" className={className}>
			<h2 id="explanation-map" className="explanation-section-heading">
				Map
			</h2>
			<div className="explanation-card space-y-3 p-5 sm:p-6 md:p-7">
				<figure className="explanation-figure mb-5">
					<img
						src={publicAsset('/helpImages/map.PNG')}
						alt="The world map: hex biomes, home, and town."
					/>
				</figure>
				<p className="explanation-prose">
					The map is a grid of hex tiles. Each tile has a biome and a chance to hold an
					ingredient. Different biomes offer different ingredients, and biomes can have
					multiple ingredients available at different rarities.
					<br />
					Some locations, such as the lake, have a special minigame associated with them.
				</p>
				<p className="explanation-prose">
					Your inventory appears on the left. The center hex is <strong>Home</strong>, where
					you craft. The settlement icon is a <strong>town</strong> — visit the quest board
					to turn in items.
				</p>
			</div>
		</section>
	);
}
