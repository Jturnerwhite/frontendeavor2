'use client';
import { useEffect, useState } from "react";
import { AlchComponent, Ingredient, IngredientBase, IngredientCompSpec, Item, Recipe } from "@/app/hex/architecture/typings";
import { IngedientBases } from "@/app/hex/architecture/data/ingedientBases";
import AlchCompWithBacking from "@/app/hex/sharedComponents/alchComponent/alchCompWithBacking";
import './itemDisplay.css';
import { Recipes } from "../../architecture/data/recipes";

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
		name = IngedientBases[ingredient.baseIngId].name;
		types = IngedientBases[ingredient.baseIngId].types;
		comps = ingredient.comps;
	} else if(ingredientBase) {
		key = ingredientBase.id;
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

	return (
		<div className="item-display-line" key={name}>
			<div className="item-display-line-header">
				{displayHeading && (
					<>
						<div className="item-display-complex-text">
							<label>{name}</label>
							<label className="item-display-line-desc">description</label>
						</div>
						<div>
							<label>{types.join(', ')}</label>
						</div>
					</>
				)}
				{item?.quality != null && (
					<div>
						<label>Quality: {item.quality}</label>
					</div>
				)}
			</div>
			<div className="item-display-line-comps">{getCompsToDisplay()}</div>
		</div>
	);
};

interface ComplexInventoryItemProps {
	items: Array<Item|Ingredient|IngredientBase|Recipe>;
	displaySize?: number;
	groupByBase?: boolean;
	hideDescription?: boolean;
	hideFiltering?: boolean;
	hideSorting?: boolean;
}

const ComplexInventoryItem: React.FC<ComplexInventoryItemProps> = ({ items, displaySize = 35, groupByBase, hideDescription = false, hideFiltering = false, hideSorting = false }) => {
	let image = '';
	let name = '';
	let types: string[] = [];
	let type:1|2|3|4 = 1; // 1 = Item, 2 = Ingredient, 3 = IngredientBase, 4 = Recipe
	const anyItem = items[0];

	if("baseRecipeId" in anyItem && anyItem.baseRecipeId !== undefined) {
		type = 1;
		let matchingRecipe = Recipes.find((recipe) => recipe.id === anyItem.baseRecipeId);
		if(matchingRecipe) {
			image = matchingRecipe.image ?? "";
			name = matchingRecipe.description ?? "";
			types = matchingRecipe.types ?? [];
		}
	} else if("baseIngId" in anyItem && anyItem.baseIngId !== undefined) {
		type = 2;
		let matchingIngredientBase = IngedientBases[anyItem.baseIngId];
		if(matchingIngredientBase) {
			image = matchingIngredientBase.image ?? "";
			name = matchingIngredientBase.name ?? "";
			types = matchingIngredientBase.types ?? [];
		}
	} else if ("ingTier" in anyItem && anyItem.ingTier !== undefined) {
		type = 3;
		let ingredientBase = (anyItem as IngredientBase);
		image = ingredientBase.image ?? "";
		name = ingredientBase.name ?? "";
		types = ingredientBase.types ?? [];
	} else {
		type = 4;
		let recipe = (anyItem as Recipe);
		image = recipe.image ?? "";
		name = recipe.description ?? "";
		types = recipe.types ?? [];
	}

	function GetLineItems() {
		let output:Array<JSX.Element> = [];
		items.forEach((item, index) => {
			if(type === 1) {
				output.push(<InventoryLineItem key={"t1-"+(item as Item).name+"-"+index} item={item as Item} displaySize={displaySize} />);
			} else if(type === 2) {
				output.push(<InventoryLineItem key={"t2-"+(item as Ingredient).id+"-"+index} ingredient={item as Ingredient} displaySize={displaySize} />);
			} else if(type === 3) {
				output.push(<InventoryLineItem key={"t3-"+(item as IngredientBase).id+"-"+index} ingredientBase={item as IngredientBase} displaySize={displaySize} />);
			} else if(type === 4) {
				//output.push(<InventoryLineItem key={item.id} recipe={item as Recipe} displaySize={displaySize} />);
			}
		});
		return output;
	}

	return (
		<div className="item-display-complex">
			<div className="item-display-complex-row">
				<div className="item-display-complex-icon" aria-hidden>
					{ image && (<img src={image} alt={name} style={{ height: "100%" }}/>) }
				</div>
				<div className="item-display-complex-main">
					<div className="item-display-complex-text">
						<label className="item-display-complex-name">{name}</label>
						{!hideDescription && (<label className="item-display-complex-desc">description</label>)}
					</div>
					<div className="item-display-complex-types">
						<label>{types.join(', ')}</label>
						<label>{items.length}x</label>
					</div>
				</div>
				<div className="item-display-complex-end" aria-hidden>
					V
				</div>
			</div>
			<div className="item-display-complex-tools">
				{!hideFiltering && (
					<div>
						<h3>Filtering</h3>
					</div>
				)}
				{!hideSorting && (
					<div>
						<h3>Sorting</h3>
					</div>
				)}
			</div>
			<div className="item-display-complex-lineitems">{GetLineItems()}</div>
		</div>
	);
};

export { InventoryLineItem, ComplexInventoryItem };