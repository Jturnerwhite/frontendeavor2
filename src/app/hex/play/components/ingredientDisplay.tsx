'use client'

import { Ingredient } from "@/app/hex/architecture/typings";
import { AlchComponentDisplay, PlaceableAlchComponent } from "@/app/hex/play/components/alchComponent";

interface IngredientDisplayProps {
	ingredient: Ingredient;
	usePlaceable: boolean;
}

const IngredientDisplay: React.FC<IngredientDisplayProps> = ({ ingredient, usePlaceable = true }): JSX.Element => {

	function getComps():Array<JSX.Element> {
		return ingredient.comps.map((comp, compIndex) => {
			return (
				<svg key={ingredient.base.name+"-"+compIndex}  width={100} height={100} style={{ position: "relative", display:"inline-block" }}>
					<AlchComponentDisplay alchData={comp} position={{x:50, y:50}} size={30} rotation={0} />
				</svg>
			);
		}, [] as Array<JSX.Element>);
	}

	function getPlaceableComps():Array<JSX.Element> {
		return ingredient.comps.map((comp, compIndex) => {
			return (
				<svg key={ingredient.base.name+"-"+compIndex}  width={100} height={100} style={{ position: "relative", display:"inline-block" }}>
					<PlaceableAlchComponent alchData={comp} position={{x:50, y:50}} size={30} rotation={0} />
				</svg>
			);
		}, [] as Array<JSX.Element>);
	}

	return (
		<div>
			<label>{ ingredient.base.name }</label>
			{ingredient.base.types.map((type) => <small>{ type }</small>)}
			{usePlaceable ? <div>{getPlaceableComps()}</div> : <div>{getComps()}</div>}
		</div>
	);
}

export default IngredientDisplay;