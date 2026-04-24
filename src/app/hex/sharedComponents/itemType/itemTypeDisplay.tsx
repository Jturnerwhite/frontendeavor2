import { ITEM_TAG } from "@/app/hex/architecture/enums";
import { publicAsset } from '@/lib/publicAsset';
import { styleHelper } from '@/app/hex/architecture/helpers/styleHelper';
import styles from './itemTypeDisplay.module.css';

const ItemTypeDisplay: React.FC<{itemType: ITEM_TAG, hideImage?: boolean}> = ({itemType, hideImage = false}): JSX.Element => {
	return (
		<div className={styleHelper('item-type-display', styles.root)}>
			{!hideImage && (
				<div className={styleHelper('item-type-display-image', styles.imageWrap)}>
					<img src={publicAsset(`/icons/itemTypes/${itemType.toLowerCase().replace(" ", "_")}.svg`)} alt={itemType} />
				</div>
			)}
			<span>{itemType}</span>
		</div>
	);
};

export default ItemTypeDisplay;
