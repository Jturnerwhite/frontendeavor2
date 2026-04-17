import { ALCH_ELEMENT } from "@/app/hex/architecture/enums";
import { publicAsset } from '@/lib/publicAsset';

const ElementIcon: React.FC<{element: ALCH_ELEMENT}> = ({element}): JSX.Element => {
	return (<>
		<img src={publicAsset(`/icons/elements/${element.toLowerCase().replace(" ", "_")}.svg`)} alt={element} />
	</>);
};

export default ElementIcon;