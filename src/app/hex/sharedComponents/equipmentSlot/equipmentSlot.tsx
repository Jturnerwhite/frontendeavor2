import { publicAsset } from '@/lib/publicAsset';
import { EQUIPMENT_TYPE } from '@/app/hex/architecture/enums';
import { Recipes } from '@/app/hex/architecture/data/recipes';
import { Item } from '@/app/hex/architecture/typings';
import styles from './equipmentSlot.module.css';

interface EquipmentSlotProps {
	slotType: EQUIPMENT_TYPE;
	equipment?: Item;
	onClick?: (slotType: EQUIPMENT_TYPE) => void;
}

const EquipmentSlot: React.FC<EquipmentSlotProps> = ({ slotType, equipment, onClick }): JSX.Element => {
	const slotIcon = publicAsset(`/icons/itemTypes/${slotType.toLowerCase().replace(" ", "_")}.svg`);
	const equipmentIcon = equipment !== undefined ? Recipes.find((recipe) => recipe.id === equipment.baseRecipeId)?.image ?? '': '';
	
	const radius = 40;
	const imageSize = radius * 1.1;
	const strokeWidth = 4;
	const slotSize = (radius*2)+strokeWidth*2;
	const x = radius + (strokeWidth/2);
	const y = radius + (strokeWidth/2);
	const points = [
		`${x + radius},${y}`,
		`${x + radius * Math.cos(Math.PI / 3)},${y + radius * Math.sin(Math.PI / 3)}`,
		`${x + radius * Math.cos((2 * Math.PI) / 3)},${y + radius * Math.sin((2 * Math.PI) / 3)}`,
		`${x - radius},${y}`,
		`${x + radius * Math.cos((4 * Math.PI) / 3)},${y + radius * Math.sin((4 * Math.PI) / 3)}`,
		`${x + radius * Math.cos((5 * Math.PI) / 3)},${y + radius * Math.sin((5 * Math.PI) / 3)}`,
	].join(' ');

	function handleClick(): void {
		if (onClick !== undefined) {
			onClick(slotType);
		}
	}

	return (
		<div className={styles.slotContainer} onClick={handleClick}>
			<svg className={styles.slotHex} width={slotSize} height={slotSize} transform={`rotate(30)`}>
				<polygon points={points} strokeWidth={strokeWidth} />
			</svg>
			<div className={styles.slotImage}>
				{equipment !== undefined && (
					<img 
						src={publicAsset(equipmentIcon)} 
						alt={equipment.name} 
						title={equipment.name} 
						style={{ 
							width: `${imageSize}px`, 
							height: `${imageSize}px`
						}}
					/>
				)}
				{equipment === undefined && (
					<img 
						src={slotIcon} 
						alt={slotType} 
						style={{ 
							width: `${imageSize}px`, 
							height: `${imageSize}px` 
						}}
					/>
				)}
			</div>
		</div>
	);
};

export default EquipmentSlot;
