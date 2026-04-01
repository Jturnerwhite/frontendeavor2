'use client'

import { Ingredient } from "@/app/hex/architecture/typings";
import { AlchComponentDisplay, PlaceableAlchComponent } from "@/app/hex/play/components/alchComponent";

interface IngredientDisplayProps {
	ingredient: Ingredient;
	displaySize?: number;
	usePlaceable?: boolean;
	compPlaced?: boolean[];
}

const IngredientDisplay: React.FC<IngredientDisplayProps> = ({ ingredient, displaySize = 30, usePlaceable = true, compPlaced = [] }): JSX.Element => {
	function getComps():Array<JSX.Element> {
		return ingredient.comps.map((comp, compIndex) => {
			const placed = compPlaced.length > 0 ? compPlaced[compIndex] : false;
			return (
				<svg key={ingredient.base.name+"-"+compIndex}  width={100} height={100} style={{ position: "relative", display:"inline-block" }}>
					<AlchComponentDisplay alchData={comp} position={{x:50, y:50}} size={displaySize} rotation={0} placed={placed} />
				</svg>
			);
		}, [] as Array<JSX.Element>);
	}

	function getPlaceableComps():Array<JSX.Element> {
		return ingredient.comps.map((comp, compIndex) => {
			const placed = compPlaced.length > 0 ? compPlaced[compIndex] : false;
			return (
				<svg key={ingredient.base.name+"-"+compIndex}  width={100} height={100} style={{ position: "relative", display:"inline-block" }}>
					<PlaceableAlchComponent alchData={comp} position={{x:50, y:50}} size={displaySize} rotation={0} placed={placed} />
				</svg>
			);
		}, [] as Array<JSX.Element>);
	}

	return (
		<div key={ingredient.base.name}>
			<label>{ ingredient.base.name }</label>
			<div>{ingredient.base.types.map((type) => <small key={ingredient.base.name+"-"+type}>{ type } </small>)}</div>
			{usePlaceable ? <div>{getPlaceableComps()}</div> : <div>{getComps()}</div>}
		</div>
	);
}

export default IngredientDisplay;