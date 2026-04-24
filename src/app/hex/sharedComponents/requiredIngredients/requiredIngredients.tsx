'use client';

import type { RecipeRequiredIngredient } from '@/app/hex/architecture/typings';
import {
	formatRequiredIngredientEntry,
	getRequiredIngredientImageSrc,
} from './requiredIngredientDisplay';
import './requiredIngredients.css';

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
		<div className={`alchemy-required-list required-ingredients ${className}`.trim()}>
			<ul className="required-ingredients-list">
				{requirements.map((req, i) => (
					<li
						key={i}
						className={
							'required-ingredients-row' + (met[i] ? '' : ' alchemy-required-list--missing')
						}
					>
						<span className="required-ingredients-thumb" aria-hidden>
							<img src={getRequiredIngredientImageSrc(req)} alt="" />
						</span>
						<span className="required-ingredients-label">{formatRequiredIngredientEntry(req)}</span>
					</li>
				))}
			</ul>
		</div>
	);
}
