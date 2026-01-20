'use client'

import { Item } from "@/app/hex/architecture/typings";

interface ItemDisplayProps {
	item: Item;
}

const ItemDisplay: React.FC<ItemDisplayProps> = ({ item }): JSX.Element => {
	return (
		<div>
			<label>{ item.name }</label>
			{item.types.map((type) => <small>{ type }</small>)}
		</div>
	);
}

export default ItemDisplay;