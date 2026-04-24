'use client';

import type { RecipeRequiredIngredient } from '@/app/hex/architecture/typings';
import { styleHelper } from '@/app/hex/architecture/helpers/styleHelper';
import {
	formatRequiredIngredientEntry,
	getRequiredIngredientImageSrc,
} from './requiredIngredientDisplay';
import styles from './requiredIngredients.module.css';

export interface RequiredIngredientsListProps {
	requirements: RecipeRequiredIngredient[];
	/** Same length as `requirements` — whether the player currently satisfies each row */
	met: boolean[];
	/** Merged with `alchemy-required-list` when used on alchemy recipe UI */
	className?: string;
}

export default function RequiredIngredientsList({
	requirements,
	met,
	className = '',
}: RequiredIngredientsListProps): JSX.Element {
	return (
		<div className={styleHelper('alchemy-required-list', className || undefined)}>
			<ul className={styles.list}>
				{requirements.map((req, i) => (
					<li
						key={i}
						className={styleHelper(
							styles.row,
							!met[i] && 'alchemy-required-list--missing',
						)}
					>
						<span className={styles.thumb} aria-hidden>
							<img src={getRequiredIngredientImageSrc(req)} alt="" />
						</span>
						<span className={styles.label}>{formatRequiredIngredientEntry(req)}</span>
					</li>
				))}
			</ul>
		</div>
	);
}
