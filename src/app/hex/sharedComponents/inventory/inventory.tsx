'use client';

import { Item, Ingredient } from "@/app/hex/architecture/typings";
import { ComplexInventoryItem } from "@/app/hex/sharedComponents/itemDisplay/lineItem";
import '@/app/hex/sharedComponents/inventory/inventory.css';
interface InventoryProps {
	inventoryItems: Array<Item>;
	ingredients: Array<Ingredient>;
	groupByBase?: boolean;
	hideFiltering?: boolean;
	hideSorting?: boolean;
	hideSubFiltering?: boolean;
	hideSubSorting?: boolean;
	/** When set with selectedKeys + onToggleKey, each row shows a checkbox (keys: `crafted:${index}`, ingredient.id). */
	selectable?: boolean;
	selectedKeys?: Set<string>;
	onToggleKey?: (key: string) => void;
	showTitle?: boolean;
	/** Override crafted row keys (e.g. stable indices into the full inventory array). */
	getCraftedRowKey?: (item: Item, index: number) => string;
}

/** Stable key for a crafted row at index (used with selectable inventory). */
export function craftedRowKey(index: number): string {
	return `crafted:${index}`;
}

const InventoryDisplay: React.FC<InventoryProps> = ({
	inventoryItems,
	ingredients,
	groupByBase = false,
	hideFiltering = false,
	hideSorting = false,
	hideSubFiltering = false,
	hideSubSorting = false,
	selectable = false,
	selectedKeys,
	onToggleKey,
	showTitle = true,
	getCraftedRowKey,
}) => {
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

		// Selection (e.g. alchemy ingredient stages) needs one row per stack slot with keys that
		// match `ingredient.id` and `crafted:${globalIndex}` — not grouped `ING:baseId` keys.
		if (canSelect) {
			inventoryItems.forEach((item, index) => {
				const rowKey = getCraftedRowKey ? getCraftedRowKey(item, index) : craftedRowKey(index);
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
			return output;
		}

		const allItems = [...inventoryItems, ...ingredients];

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

	return <div className="inventory-display">
		{showTitle && <h1>Inventory</h1>}
		{!hideFiltering && <div><h2>Filtering</h2></div>}
		{!hideSorting && <div><h2>Sorting</h2></div>}
		<div className="inventory-display-items">
			{renderInventoryItems()}
		</div>
	</div>;
};

export default InventoryDisplay;