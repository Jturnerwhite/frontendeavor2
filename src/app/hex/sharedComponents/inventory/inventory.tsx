'use client';

import { Item } from "../../architecture/typings";

interface InventoryProps {
	inventoryItems: Item[];
}

const Inventory: React.FC<InventoryProps> = ({ inventoryItems }) => {
	return <div>Inventory</div>;
};

export default Inventory;