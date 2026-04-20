import { ALCH_ELEMENT } from "@/app/hex/architecture/enums";
import { publicAsset } from '@/lib/publicAsset';

const ElementIcon: React.FC<{element: ALCH_ELEMENT}> = ({element}): JSX.Element => {
	return (<>
		<img 
			className={`element-icon ei-${element}`}
			src={publicAsset(`/icons/elements/${element.toLowerCase().replace(" ", "_")}.svg`)} 
			alt={element}
			style={{
				userSelect: 'none',
			}}
		/>
	</>);
};

export default ElementIcon;