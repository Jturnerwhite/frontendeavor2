'use client';

import { useEffect, useState } from 'react';
import { Item, Ingredient } from "@/app/hex/architecture/typings";
import { ComplexInventoryItem } from "@/app/hex/sharedComponents/itemDisplay/lineItem";
import '@/app/hex/sharedComponents/inventory/inventory.css';

type InventoryTab = 'ingredients' | 'crafted';
interface InventoryProps {
	inventoryItems: Array<Item>;
	ingredients: Array<Ingredient>;
	hideFiltering?: boolean;
	hideSorting?: boolean;
	hideSubFiltering?: boolean;
	hideSubSorting?: boolean;
		/** When set with selectedKeys + onToggleKey, each row shows a checkbox (keys: `Item.id`, `Ingredient.id`). */
	selectable?: boolean;
	selectedKeys?: Set<string>;
	onToggleKey?: (key: string) => void;
	showTitle?: boolean;
}

const InventoryDisplay: React.FC<InventoryProps> = ({
	inventoryItems,
	ingredients,
	hideFiltering = false,
	hideSorting = false,
	hideSubFiltering = false,
	hideSubSorting = false,
	selectable = false,
	selectedKeys,
	onToggleKey,
	showTitle = true,
}) => {
	const [activeTab, setActiveTab] = useState<InventoryTab>('ingredients');
	const [onlyIngredients, setOnlyIngredients] = useState(false);
	const [onlyCrafted, setOnlyCrafted] = useState(false);
	const DISPLAY_SIZE = 20;
	const canSelect = selectable && selectedKeys !== undefined && onToggleKey !== undefined;

	function wrapRow(rowKey: string, node: JSX.Element): JSX.Element {
		if (!canSelect) {
			return node;
		}
		return (
			<label key={rowKey} className="inventory-select-row">
				<input
					type="checkbox"
					checked={selectedKeys.has(rowKey)}
					onChange={() => onToggleKey(rowKey)}
				/>
				<span className="inventory-select-row-body">{node}</span>
			</label>
		);
	}

	function renderInventoryItems(): JSX.Element[] {
		const output: JSX.Element[] = [];

		// Selection (e.g. alchemy / quest stages) needs one row per slot with stable ids — not grouped `ING:baseId` keys.
		if (canSelect) {
			if (activeTab === 'crafted') {
				inventoryItems.forEach((item, index) => {
					const rowKey = item.id;
					const inner = (
						<ComplexInventoryItem
							key={item.name + '-' + index}
							items={[item]}
							displaySize={DISPLAY_SIZE}
							hideFiltering={hideSubFiltering}
							hideSorting={hideSubSorting}
						/>
					);
					output.push(wrapRow(rowKey, inner));
				});
			} else {
				ingredients.forEach((ingredient, index) => {
					const inner = (
						<ComplexInventoryItem
							key={ingredient.id + '-' + index}
							items={[ingredient]}
							displaySize={DISPLAY_SIZE}
							hideFiltering={hideSubFiltering}
							hideSorting={hideSubSorting}
						/>
					);
					output.push(wrapRow(ingredient.id, inner));
				});
			}
			return output;
		}

		const allItems: Array<Item | Ingredient> =
			activeTab === 'ingredients' ? [...ingredients] : [...inventoryItems];

		const groupedItems = Object.groupBy(allItems, (item) => {
			if ("baseRecipeId" in item && item.baseRecipeId !== undefined) {
				return "BRI:" + item.baseRecipeId;
			} else if ("baseIngId" in item && item.baseIngId !== undefined) {
				return "ING:" + item.baseIngId;
			} else if ("ingTier" in item && item.ingTier !== undefined) {
				return "INGB:" + item.ingTier;
			} else {
				return "UNK";
			}
		});

		Object.keys(groupedItems).forEach((objKey) => {
			const inner = (
				<ComplexInventoryItem
					key={objKey}
					items={groupedItems[objKey] ?? []}
					displaySize={DISPLAY_SIZE}
					hideFiltering={hideSubFiltering}
					hideSorting={hideSubSorting}
				/>
			);
			output.push(wrapRow(objKey, inner));
		});

		return output;
	}

	useEffect(() => {
		console.log('inventoryItems', inventoryItems.length);
		console.log('ingredients', ingredients.length);
		if(ingredients.length > 0 && inventoryItems.length === 0) {
			setOnlyIngredients(true);
			setOnlyCrafted(false);
			setActiveTab('ingredients');
		} else if (ingredients.length === 0 && inventoryItems.length > 0) {
			setOnlyCrafted(true);
			setOnlyIngredients(false);
			setActiveTab('crafted');
		} else {
			setOnlyIngredients(false);
			setOnlyCrafted(false);
			setActiveTab('ingredients');
		}
	}, [inventoryItems, ingredients]);

	return <div className="inventory-display">
		{showTitle && <h1>Inventory</h1>}
		{!(onlyIngredients || onlyCrafted) && (
		<div className="inventory-tabs" role="tablist" aria-label="Inventory category">
			<button
				type="button"
				role="tab"
				id="inventory-tab-ingredients"
				aria-selected={activeTab === 'ingredients'}
				className={'inventory-tab' + (activeTab === 'ingredients' ? ' inventory-tab--active' : '')}
				onClick={() => setActiveTab('ingredients')}
			>
				Ingredients
			</button>
			<button
				type="button"
				role="tab"
				id="inventory-tab-crafted"
				aria-selected={activeTab === 'crafted'}
				className={'inventory-tab' + (activeTab === 'crafted' ? ' inventory-tab--active' : '')}
				onClick={() => setActiveTab('crafted')}
			>
				Crafted
			</button>
		</div>
		)}
		{!hideFiltering && <div><h2>Filtering</h2></div>}
		{!hideSorting && <div><h2>Sorting</h2></div>}
		<div className="inventory-display-items">
			{renderInventoryItems()}
		</div>
	</div>;
};

export default InventoryDisplay;