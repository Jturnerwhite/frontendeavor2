'use client';

import type { ReactNode } from 'react';
import { styleHelper } from '@/app/hex/architecture/helpers/styleHelper';
import './explanationHelp.css';

export function ExplanationHelpPageShell({
	children,
	className,
	innerClassName,
}: {
	children: ReactNode;
	/** Merged with `explanation-root` (e.g. `min-h-0` in a dialog) */
	className?: string;
	/** Classes on the inner max-width column */
	innerClassName?: string;
}): JSX.Element {
	return (
		<div className={styleHelper('explanation-root', className)}>
			<div
				className={styleHelper(
					'mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12 lg:py-14',
					innerClassName,
				)}
			>
				{children}
			</div>
		</div>
	);
}
