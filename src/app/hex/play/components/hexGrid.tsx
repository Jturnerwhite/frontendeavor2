import Hex from '@/app/hex/play/components/hex';
import { Position, HexTile, HexMap } from '@/app/hex/architecture/interfaces';

interface HexGridProps {
	hexMap: HexMap;
	radius: number;
}

const HexGrid: React.FC<HexGridProps> = ({ hexMap, radius }): JSX.Element => {
	return (
		<>
			{Object.keys(hexMap).map((id) => {
				const hex = hexMap[id];
				return <Hex key={hex.id} hexData={hex} radius={radius}/>;
			})}
		</>
	);
}

export default HexGrid;