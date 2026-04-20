import { publicAsset } from '@/lib/publicAsset';

const RequiredItem: React.FC<{name:string, imgSource:string, qty:number, addClassName?:string}> = ({...props}): JSX.Element => {
	return (<>
		<div className={`required-item ${props.addClassName ?? ''}`}>
			<div className="required-item-image-container">
				<img src={publicAsset(props.imgSource)} alt={props.name} />
				<span className="required-item-qty">{props.qty}</span>
			</div>
			<label className="required-item-name">{props.name}</label>
		</div>
	</>);
};

export default RequiredItem;