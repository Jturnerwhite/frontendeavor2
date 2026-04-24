'use client';

import type { AlchComponent, Ingredient } from '@/app/hex/architecture/typings';
import AlchCompWithBacking from '@/app/hex/sharedComponents/alchComponent/alchCompWithBacking';
import { IngredientBases } from '@/app/hex/architecture/data/ingredientBases';
import { styleHelper } from '@/app/hex/architecture/helpers/styleHelper';
import styles from './ingredientDisplay.module.css';

interface IngredientDisplayProps {
	ingredient: Ingredient;
	displaySize?: number;
	usePlaceable?: boolean;
	compPlaced?: boolean[];
	onPickComponent?: (alchData: AlchComponent) => void;
}

const IngredientDisplay: React.FC<IngredientDisplayProps> = ({
	ingredient,
	displaySize = 30,
	usePlaceable = true,
	compPlaced = [],
	onPickComponent,
}): JSX.Element => {
	function handlePickComponent(comp: AlchComponent, placed: boolean) {
		if(!placed) {
			onPickComponent && onPickComponent(comp)
		}
	}

	function getComps(): Array<JSX.Element> {
		return ingredient.comps.map((comp, compIndex) => {
			const placed = compPlaced.length > 0 ? compPlaced[compIndex] : false;
			return (<AlchCompWithBacking 
				key={'parent' + ingredient.baseIngId + '-' + compIndex}
				keyString={ingredient.baseIngId + '-' + compIndex} 
				additionalClassString={placed ? 'placed' : ''}
				alchData={comp} 
				displaySize={displaySize} 
				usePlaceable={usePlaceable}
				onPickComponent={() => handlePickComponent(comp, placed)} />);
		}, [] as Array<JSX.Element>);
	}

	return (
		<div className={styleHelper('ingredient-display', styles.root)}>
			<label>{ingredient.baseIngId}</label>
			<hr className={styles.separator} />
			<div>{IngredientBases[ingredient.baseIngId].types.map((type) => <small key={ingredient.baseIngId + '-' + type}>{type} </small>)}</div>
			<div className={styleHelper('ingredient-display-comps', styles.comps)}>
				{getComps()}
			</div>
		</div>
	);
};

export default IngredientDisplay;
