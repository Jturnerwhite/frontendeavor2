import { publicAsset } from '@/lib/publicAsset';
import { styleHelper } from '@/app/hex/architecture/helpers/styleHelper';
import styles from './requiredItem.module.css';

const RequiredItem: React.FC<{
	name: string;
	imgSource: string;
	qty: number;
	addClassName?: string;
}> = (props) => {
	return (
		<>
			<div className={styleHelper('required-item', styles.item, props.addClassName)}>
				<div className={styles.imageContainer}>
					<img src={publicAsset(props.imgSource)} alt={props.name} />
					<span>{props.qty}</span>
				</div>
				<label>{props.name}</label>
			</div>
		</>
	);
};

export default RequiredItem;
