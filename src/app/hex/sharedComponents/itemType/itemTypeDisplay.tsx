import { ITEM_TAG } from "@/app/hex/architecture/enums";
import { publicAsset } from '@/lib/publicAsset';
import './itemTypeDisplay.css';

const ItemTypeDisplay: React.FC<{itemType: ITEM_TAG, hideImage?: boolean}> = ({itemType, hideImage = false}): JSX.Element => {
	return (
		<div className="item-type-display">
			{!hideImage && (
				<div className="item-type-display-image">
					<img src={publicAsset(`/icons/itemTypes/${itemType.toLowerCase().replace(" ", "_")}.svg`)} alt={itemType} />
				</div>
			)}
			<span>{itemType}</span>
		</div>
	);
};

export default ItemTypeDisplay;