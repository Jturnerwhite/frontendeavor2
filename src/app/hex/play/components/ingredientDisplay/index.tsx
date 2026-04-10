'use client';

import * as Helpers from '@/app/hex/architecture/helpers/alchHelpers';
import { AlchHexGrid } from '@/app/hex/sharedComponents/hex/hexGrid';
import { AlchComponent, Ingredient } from '@/app/hex/architecture/typings';
import { AlchComponentDisplay, PlaceableAlchComponent } from '@/app/hex/sharedComponents/alchComponent';
import AlchCompWithBacking from '@/app/hex/sharedComponents/alchComponent/alchCompWithBacking';
import { IngredientBases } from '@/app/hex/architecture/data/ingredientBases';
import './ingredient-display.css';

interface IngredientDisplayProps {
	ingredient: Ingredient;
	displaySize?: number;
	usePlaceable?: boolean;
	compPlaced?: boolean[];
}

const IngredientDisplay: React.FC<IngredientDisplayProps> = ({
	ingredient,
	displaySize = 30,
	usePlaceable = true,
	compPlaced = [],
}): JSX.Element => {
	function getComps(): Array<JSX.Element> {
		return ingredient.comps.map((comp, compIndex) => {
			const placed = compPlaced.length > 0 ? compPlaced[compIndex] : false;
			return (<AlchCompWithBacking 
				key={'parent' + ingredient.baseIngId + '-' + compIndex}
				keyString={ingredient.baseIngId + '-' + compIndex} 
				additionalClassString={placed ? 'placed' : ''}
				alchData={comp} 
				displaySize={displaySize} 
				usePlaceable={usePlaceable} />);
		}, [] as Array<JSX.Element>);
	}

	return (
		<div className="ingredient-display">
			<label>{ingredient.baseIngId}</label>
			<hr className="ingredient-display-separator" />
			<div>{IngredientBases[ingredient.baseIngId].types.map((type) => <small key={ingredient.baseIngId + '-' + type}>{type} </small>)}</div>
			<div className="ingredient-display-comps">
				{getComps()}
			</div>
		</div>
	);
};

export default IngredientDisplay;
