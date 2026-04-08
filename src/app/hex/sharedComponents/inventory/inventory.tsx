'use client';

import { Item, Ingredient } from "@/app/hex/architecture/typings";
import { ComplexInventoryItem } from "@/app/hex/sharedComponents/itemDisplay/lineItem";
import '@/app/hex/sharedComponents/inventory/inventory.css';

interface InventoryProps {
	inventoryItems: Array<Item>;
	ingredients: Array<Ingredient>;	
	hideFiltering?: boolean;
	hideSorting?: boolean;
	hideSubFiltering?: boolean;
	hideSubSorting?: boolean;
}

const InventoryDisplay: React.FC<InventoryProps> = ({ inventoryItems, ingredients, hideFiltering = false, hideSorting = false, hideSubFiltering = false, hideSubSorting = false }) => {
	const DISPLAY_SIZE = 25;
	function renderInventoryItems(): JSX.Element[] {
		let output:JSX.Element[] = [];
		output.push(...inventoryItems.map((item, index) => {
			return <ComplexInventoryItem 
				key={item.name + "-" + index} 
				item={item} 
				hideFiltering={hideSubFiltering} 
				hideSorting={hideSubSorting} 
				displaySize={DISPLAY_SIZE} />;
		}));
		output.push(...ingredients.map((ingredient, index) => {
			return <ComplexInventoryItem 
				key={ingredient.id + "-" + index} 
				ingredient={ingredient} 
				hideFiltering={hideSubFiltering} 
				hideSorting={hideSubSorting} 
				displaySize={DISPLAY_SIZE} />;
		}));
		return output;
	}

	return <div className="inventory-display">
		<h1>Inventory</h1>
		{!hideFiltering && <div><h2>Filtering</h2></div>}
		{!hideSorting && <div><h2>Sorting</h2></div>}
		<div className="inventory-display-items">
			{renderInventoryItems()}
		</div>
	</div>;
};

export default InventoryDisplay;