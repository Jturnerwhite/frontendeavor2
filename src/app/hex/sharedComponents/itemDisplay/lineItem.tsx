'use client';
import { useEffect, useState } from "react";
import { Recipes } from "@/app/hex/architecture/data/recipes";
import { AlchComponent, Ingredient, IngredientAspectSpec, IngredientBase, IngredientCompSpec, Item, ItemAspect, Recipe } from "@/app/hex/architecture/typings";
import { IngredientBases } from '@/app/hex/architecture/data/ingredientBases';
import AlchCompWithBacking from "@/app/hex/sharedComponents/alchComponent/alchCompWithBacking";
import { styleHelper } from '@/app/hex/architecture/helpers/styleHelper';
import styles from './itemDisplay.module.css';

interface InventoryLineItemProps {
	item?: Item;
	ingredient?: Ingredient;
	ingredientBase?: IngredientBase;
	displaySize?: number;
	displayHeading?: boolean;
	/** When true, renders a checkbox inline with the row. `selected` + `onToggle` drive state. */
	selectable?: boolean;
	selected?: boolean;
	onToggle?: () => void;
}

const InventoryLineItem: React.FC<InventoryLineItemProps> = ({ item, ingredient, ingredientBase, displaySize = 35, displayHeading = false, selectable = false, selected = false, onToggle }) => {
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
	let quality = -1;
	let types: string[] = [];
	let comps: AlchComponent[] = [];
	let possibleComps: (IngredientCompSpec|AlchComponent)[] = [];
	let possibleAspects: (ItemAspect)[] = [];
	let innateAspects: (ItemAspect)[] = [];
	let saleValue = 0;

	if(item) {
		key = item.name;
		name = item.name;
		quality = item.quality;
		types = item.types;
		comps = item.comps;
		possibleAspects = item.aspects ?? [];
		saleValue = item.saleValue;
		innateAspects = item.innateAspects ?? [];
	} else if(ingredient) {
		key = ingredient.id;
		name = IngredientBases[ingredient.baseIngId].name;
		quality = ingredient.quality;
		types = IngredientBases[ingredient.baseIngId].types;
		comps = ingredient.comps;
		possibleAspects = ingredient.aspects ?? [];
		saleValue = ingredient.saleValue;
	} else if(ingredientBase) {
		key = ingredientBase.id;
		name = ingredientBase.name;
		types = ingredientBase.types;
		possibleComps = ingredientBase.possibleComps;
		possibleAspects = [];
		saleValue = ingredientBase.baseSaleValue ?? 1;
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

	function getAspectsToDisplay():Array<JSX.Element> {
		let output:Array<JSX.Element> = possibleAspects.map((aspect, aspectIndex) => {
			return (<label key={'aspect-' + name + '-' + aspectIndex}>{aspect.name}</label>);
		});
		return output;
	}

	function getInnateAspectsToDisplay():Array<JSX.Element> {
		let output:Array<JSX.Element> = innateAspects.map((aspect, aspectIndex) => {
			return (<label key={'aspect-' + name + '-' + aspectIndex}>{aspect.name}</label>);
		});
		return output;
	}


	let qualityClass = 'quality-10';
	if(quality > 0) {
		if(quality >= 100) {
			qualityClass = 'quality-100';
		} else if(quality >= 75) {
			qualityClass = 'quality-75';
		} else if(quality >= 50) {
			qualityClass = 'quality-50';
		} else if(quality >= 20) {
			qualityClass = 'quality-20';
		} else {
			qualityClass = 'quality-10';
		}
	}

	const body = (
		<>
			<div className={styles.lineHeader}>
				{displayHeading && (
					<>
						<div className={styles.complexText}>
							<label>{name}</label>
							<label className={styles.lineDesc}>description</label>
						</div>
						<div>
							<label>{types.join(', ')}</label>
						</div>
					</>
				)}
			</div>
			<div className={styles.lineInstData}>
				{quality > -1 && (<>
					<div className={styles.lineQualityValue}>
						<div className={styles.qualityBar}>
							<span className={styleHelper(styles.qualityBarFill, qualityClass)} style={{ width: `${quality}%` }}></span>
						</div>
						<label className={styles.lineQualityText}>{quality}%</label>
						<label className={styles.lineValueText}>${saleValue}</label>
					</div>
				</>)}
				<div className={styles.lineComps}>{getCompsToDisplay()}</div>
				{innateAspects.length > 0 && (
					<div className={styles.lineAspects}>
						{getInnateAspectsToDisplay()}
					</div>
				)}
				{possibleAspects.length > 0 && (
					<div className={styles.lineAspects}>
						{getAspectsToDisplay()}
					</div>
				)}
			</div>
		</>
	);

	if (selectable) {
		return (
			<label className={styleHelper(styles.line, styles.lineSelectable)} key={name}>
				<input
					type="checkbox"
					className={styles.lineSelect}
					checked={selected}
					onChange={() => onToggle?.()}
				/>
				<span className={styles.lineBody}>{body}</span>
				<span className={styles.lineSelectIcon}>
					{selected && (
						<span className={styles.lineSelectIconCheck}></span>
					)}
				</span>
			</label>
		);
	}

	return (
		<div className={styles.line} key={name}>
			{body}
		</div>
	);
};

interface ComplexInventoryItemProps {
	items: Array<Item|Ingredient|IngredientBase|Recipe>;
	displaySize?: number;
	hideDescription?: boolean;
	hideFiltering?: boolean;
	hideSorting?: boolean;
	defaultOpen?: boolean;
	/**
	 * When true, each contained `InventoryLineItem` renders a checkbox. Selection state is
	 * keyed by the underlying slot id (`Item.id` / `Ingredient.id` / `IngredientBase.id`).
	 */
	selectable?: boolean;
	selectedKeys?: Set<string>;
	onToggleKey?: (key: string) => void;
}

const ComplexInventoryItem: React.FC<ComplexInventoryItemProps> = ({ items, displaySize = 35, hideDescription = false, hideFiltering = false, hideSorting = false, defaultOpen = false, selectable = false, selectedKeys, onToggleKey }) => {
	const [detailsOpen, setDetailsOpen] = useState(defaultOpen);
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
		let matchingIngredientBase = IngredientBases[anyItem.baseIngId];
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

	function getRowKey(item: Item | Ingredient | IngredientBase | Recipe): string | undefined {
		if (type === 1) return (item as Item).id;
		if (type === 2) return (item as Ingredient).id;
		if (type === 3) return (item as IngredientBase).id;
		return undefined;
	}

	function GetLineItems() {
		let output:Array<JSX.Element> = [];
		items.forEach((item, index) => {
			const rowKey = getRowKey(item);
			const canSelectRow = selectable && rowKey !== undefined && onToggleKey !== undefined;
			const commonSelectProps = canSelectRow
				? {
						selectable: true,
						selected: selectedKeys?.has(rowKey!) ?? false,
						onToggle: () => onToggleKey!(rowKey!),
				  }
				: {};
			if(type === 1) {
				output.push(<InventoryLineItem key={"t1-"+(item as Item).name+"-"+index} item={item as Item} displaySize={displaySize} {...commonSelectProps} />);
			} else if(type === 2) {
				output.push(<InventoryLineItem key={"t2-"+(item as Ingredient).id+"-"+index} ingredient={item as Ingredient} displaySize={displaySize} {...commonSelectProps} />);
			} else if(type === 3) {
				output.push(<InventoryLineItem key={"t3-"+(item as IngredientBase).id+"-"+index} ingredientBase={item as IngredientBase} displaySize={displaySize} {...commonSelectProps} />);
			} else if(type === 4) {
				//output.push(<InventoryLineItem key={item.id} recipe={item as Recipe} displaySize={displaySize} />);
			}
		});
		return output;
	}

	return (
		<details
			className={styles.complex}
			open={detailsOpen}
			onToggle={(e) => setDetailsOpen(e.currentTarget.open)}
		>
			<summary className={styles.complexRow}>
				<span className={styles.complexIcon} aria-hidden>
					{ image && (<img src={image} alt="" style={{ height: "100%" }}/>) }
				</span>
				<span className={styles.complexMain}>
					<span className={styles.complexText}>
						<span className={styles.complexName}>{name}</span>
						<span>{types.join(', ')}</span>
					</span>
					<span className={styles.complexTypes}>
						{items.length > 1 && (<span className={styles.complexCount}>Qty: {items.length}</span>)}
					</span>
				</span>
				<span className={styles.complexEnd} aria-hidden>
					❯
				</span>
			</summary>
			<div className={styles.complexTools}>
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
			<div className={styles.complexLineitems}>
				{GetLineItems()}
			</div>
		</details>
	);
};

export { InventoryLineItem, ComplexInventoryItem };