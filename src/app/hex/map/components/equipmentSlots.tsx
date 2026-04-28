import { EQUIPMENT_TYPE } from '@/app/hex/architecture/enums';
import { Item } from '@/app/hex/architecture/typings';
import EquipmentSlot from '@/app/hex/sharedComponents/equipmentSlot/equipmentSlot';
import { EquipmentSlots } from '@/store/features/playerSlice';

interface EquipmentSlotsProps {
	inventoryItems: Item[];
	equipmentSlots: EquipmentSlots;
}

const EquipmentSlotsDisplay: React.FC<EquipmentSlotsProps> = ({ inventoryItems, equipmentSlots }): JSX.Element => {
	function onEquipmentSlotClick(slotType: EQUIPMENT_TYPE): void {
		// bring up selection dialog for the given EQUIPMENT_TYPE (specifically, should have the user select an item with an ITEM_TAG that matches EQUIPMENT_TYPE)
	}

	function getEquipmentSlots(): JSX.Element[] {
		const out: JSX.Element[] = [];
		console.log(equipmentSlots);
		Object.keys(equipmentSlots).forEach((slotType: string) => {
			const slotTypeEnum = slotType as EQUIPMENT_TYPE;
			const value = (equipmentSlots as Record<EQUIPMENT_TYPE, string|null>)[slotTypeEnum];
			const equipment = value !== null ? inventoryItems.find((item) => item.id === value) : undefined;
			out.push(
				<EquipmentSlot 
					key={slotType} 
					slotType={slotTypeEnum} 
					equipment={equipment} 
					onClick={onEquipmentSlotClick}
				/>
			);
		});

		return out;
	}

	return (
		<div style={{ display: 'flex', flexDirection: 'row', gap: '0px' }}>
			{getEquipmentSlots()}
		</div>
	);
};

export default EquipmentSlotsDisplay;
