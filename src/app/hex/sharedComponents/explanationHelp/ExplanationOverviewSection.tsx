'use client';

import type { ExplanationSectionProps } from './explanationSectionProps';
import './explanationHelp.css';

export function ExplanationOverviewSection({
	className,
}: ExplanationSectionProps): JSX.Element {
	return (
		<section
			aria-labelledby="explanation-overview"
			className={className}
		>
			<h2 id="explanation-overview" className="explanation-section-heading">
				Overview
			</h2>
			<div className="explanation-card p-5 sm:p-6 md:p-7">
				<p className="explanation-prose">
					This is a game about creating alchemical items by combining ingredients on a
					grid. Collect ingredients from the map, then use Home to craft them into new
					items.
				</p>
			</div>
		</section>
	);
}
