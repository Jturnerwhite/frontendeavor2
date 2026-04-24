import { ALCH_ELEMENT } from "@/app/hex/architecture/enums";
import { publicAsset } from '@/lib/publicAsset';
import { styleHelper } from '@/app/hex/architecture/helpers/styleHelper';
import styles from './elementIcon.module.css';

const ElementIcon: React.FC<{ element: ALCH_ELEMENT }> = ({ element }): JSX.Element => {
	return (
		<img
			className={styleHelper(styles.root, 'element-icon', `ei-${element}`)}
			src={publicAsset(`/icons/elements/${element.toLowerCase().replace(" ", "_")}.svg`)}
			alt={element}
		/>
	);
};

export default ElementIcon;
