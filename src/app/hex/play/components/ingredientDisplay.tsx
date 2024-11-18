'use client'

import { Item } from "@/app/hex/architecture/typings";

interface ItemDisplayProps {
	item: Item;
}

const ItemDisplay: React.FC<ItemDisplayProps> = ({ item }): JSX.Element => {
	const displayTypes = item.types.map((type) => {
		return (
			<small>{ type }</small>
		);
	});

	return (
		<div>
			<label>{ item.name }</label>
			{ displayTypes }
		</div>
	);
}

export default ItemDisplay;