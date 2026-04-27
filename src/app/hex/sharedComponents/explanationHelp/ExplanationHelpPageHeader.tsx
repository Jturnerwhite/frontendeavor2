'use client';

import Link from 'next/link';
import './explanationHelp.css';

export interface ExplanationHelpPageHeaderProps {
	title?: string;
	subtitle?: string;
	backHref?: string;
	backLabel?: string;
}

export function ExplanationHelpPageHeader({
	title = 'Explanation',
	subtitle = 'How gathering, crafting, and the map fit together.',
	backHref = '/hex/map',
	backLabel = 'Back to map',
}: ExplanationHelpPageHeaderProps): JSX.Element {
	return (
		<header className="mb-10 flex flex-row items-start justify-between gap-4 sm:mb-12 sm:gap-8">
			<div className="min-w-0 flex-1 text-balance text-center md:text-left">
				<h1 className="explanation-title">{title}</h1>
				<p className="explanation-subtitle mx-auto md:mx-0">{subtitle}</p>
			</div>
			<nav
				className="explanation-back explanation-back--top shrink-0 pt-1 text-right sm:pt-0.5"
				aria-label="Page navigation"
			>
				<Link href={backHref}>{backLabel}</Link>
			</nav>
		</header>
	);
}
