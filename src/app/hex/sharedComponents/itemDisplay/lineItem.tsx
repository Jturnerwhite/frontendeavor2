'use client';
import { useEffect, useState } from "react";
import { AlchComponent, Ingredient, IngredientBase, IngredientCompSpec, Item } from "@/app/hex/architecture/typings";
import { AlchComponentDisplay } from "@/app/hex/sharedComponents/alchComponent";
import './itemDisplay.css';
import AlchHexGrid from "../hex/hexGrid";
import * as Helpers from "@/app/hex/architecture/helpers";
import AlchCompWithBacking from "../alchComponent/alchCompWithBacking";

interface InventoryLineItemProps {
	item?: Item;
	ingredient?: Ingredient;
	ingredientBase?: IngredientBase;
	displaySize?: number;
	displayHeading?: boolean;
}

const InventoryLineItem: React.FC<InventoryLineItemProps> = ({ item, ingredient, ingredientBase, displaySize = 35, displayHeading = false }) => {
	const [counter, setCounter] = useState(0); //used for flipping between possible shapes
	useEffect(() => {
		const interval = setInterval(() => {
			setCounter((prev: number) => {
				return (prev > 5) ? 0 : prev + 1
			});
		}, 500)

		return () => clearInterval(interval);
	}, []);

	let key = '';
	let name = '';
	let types: string[] = [];
	let comps: AlchComponent[] = [];
	let possibleComps: (IngredientCompSpec|AlchComponent)[] = [];
	if(item) {
		key = item.name;
		name = item.name;
		types = item.types;
		comps = item.comps;
	} else if(ingredient) {
		key = ingredient.id;
		name = ingredient.base.name;
		types = ingredient.base.types;
		comps = ingredient.comps;
	} else if(ingredientBase) {
		key = ingredientBase.name;
		name = ingredientBase.name;
		types = ingredientBase.types;
		possibleComps = ingredientBase.possibleComps;
	}

	function getCompsToDisplay():Array<JSX.Element> {
		let output:Array<JSX.Element> = comps.map((compOrSpec, compIndex) => {
			return (<AlchCompWithBacking key={name+"-"+compIndex} keyString={name+"-"+compIndex} alchData={compOrSpec as AlchComponent} displaySize={displaySize} />);
		});
		output.push(...possibleComps.map((compOrSpec, compIndex) => {
			let alchData: AlchComponent|null = null;
			if ('possibleShapes' in compOrSpec && compOrSpec.possibleShapes !== undefined && compOrSpec.possibleShapes.length > 0) { // It's an IngredientCompSpec
				alchData = {
					element: compOrSpec.element,
					shape: compOrSpec.possibleShapes.at(counter < compOrSpec.possibleShapes.length ? counter : (compOrSpec.possibleShapes.length - 1))
				} as AlchComponent;
			} else {
				alchData = compOrSpec as AlchComponent;
			}

			if(!alchData) 
				return <></>;

			return (<AlchCompWithBacking key={'possible-' + name + '-' + compIndex} keyString={'possible-' + name + '-' + compIndex} alchData={alchData} displaySize={displaySize} />);
		}));
		return output;
	}

	return (<>
		<div key={name}>
			<div className="flex flex-row flex-1 justify-between items-center">
				{displayHeading && <>
					<div className="flex flex-col">
						<label>{name}</label>
						<label>description</label>
					</div>
					<div><label>{types.join(', ')}</label></div>
				</>}
				{item?.quality && <>
					<div><label>Quality: {item?.quality}</label></div>
				</>}
			</div>
			<div className="flex flex-row flex-1 justify-start items-center gap-2">
				{getCompsToDisplay()}
			</div>
		</div>
	</>);
};

interface ComplexInventoryItemProps extends InventoryLineItemProps {
	hideFiltering?: boolean;
	hideSorting?: boolean;
}

const ComplexInventoryItem: React.FC<ComplexInventoryItemProps> = ({ item, ingredient, ingredientBase, displaySize = 35, hideFiltering = false, hideSorting = false }) => {
	let key = '';
	let name = '';
	let types: string[] = [];
	if(item) {
		key = item.name;
		name = item.name;
		types = item.types;
	} else if(ingredient) {
		key = ingredient.id;
		name = ingredient.base.name;
		types = ingredient.base.types;
	} else if(ingredientBase) {
		key = ingredientBase.name;
		name = ingredientBase.name;
		types = ingredientBase.types;
	}

	return (<>
		<div className="flex flex-row gap-4">
			<div className=""><span className="w-10 h-10 bg-red-500 block">Icon</span></div>
			<div className="flex flex-row flex-1 justify-between">
				<div className="flex flex-col">
					<label>{name}</label>
					<label>description</label>
				</div>
				<div><label>{types.join(', ')}</label></div>
			</div>
			<div className=""><span className="w-10 h-10 bg-blue-500 block">V</span></div>
		</div>
		<div>
			{!hideFiltering && <div><h3>Filtering</h3></div>}
			{!hideSorting && <div><h3>Sorting</h3></div>}
			<div><InventoryLineItem item={item} ingredient={ingredient} ingredientBase={ingredientBase} displaySize={displaySize} /></div>
		</div>
	</>);
};

export { InventoryLineItem, ComplexInventoryItem };