'use client';

import * as Helpers from '@/app/hex/architecture/helpers';
import AlchHexGrid from '@/app/hex/sharedComponents/hex/hexGrid';
import { Ingredient } from '@/app/hex/architecture/typings';
import { AlchComponentDisplay, PlaceableAlchComponent } from '@/app/hex/play/components/alchComponent';
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
			return (
				<svg
					className="ingredient-display-alch-comp"
					key={ingredient.base.name + '-' + compIndex}
					width={100}
					height={100}
					style={{ position: 'relative', display: 'inline-block' }}
				>
					<AlchComponentDisplay
						alchData={comp}
						position={{ x: 50, y: 50 }}
						size={displaySize}
						rotation={0}
						placed={placed}
					/>
				</svg>
			);
		}, [] as Array<JSX.Element>);
	}

	function getPlaceableComps(): Array<JSX.Element> {
		return ingredient.comps.map((comp, compIndex) => {
			const placed = compPlaced.length > 0 ? compPlaced[compIndex] : false;
			return (
				<svg
					className="ingredient-display-alch-comp ingredient-display-alch-comp--placeable"
					key={ingredient.base.name + '-' + compIndex}
					width={100}
					height={100}
					style={{ position: 'relative', display: 'inline-block' }}
				>
					<g transform={`translate(50 50)`}>
						<AlchHexGrid
							hexMap={Helpers.CreateHexGrid({ x: 0, y: 0 }, displaySize / 2, 2)}
							radius={displaySize / 2}
							displayIndex={false}
							preventHexHover={true}
							preventHexPlacementHover={true}
						/>
						<PlaceableAlchComponent
							alchData={comp}
							position={{ x: 0, y: 0 }}
							size={displaySize * 0.85}
							rotation={0}
							placed={placed}
						/>
					</g>
				</svg>
			);
		}, [] as Array<JSX.Element>);
	}

	return (
		<div className="ingredient-display">
			<label>{ingredient.base.name}</label>
			<hr className="ingredient-display-separator" />
			<div>{ingredient.base.types.map((type) => <small key={ingredient.base.name + '-' + type}>{type} </small>)}</div>
			{usePlaceable ? (
				<div className="ingredient-display-comps">{getPlaceableComps()}</div>
			) : (
				<div className="ingredient-display-comps">{getComps()}</div>
			)}
		</div>
	);
};

export default IngredientDisplay;
