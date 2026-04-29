'use client';

import { useState } from 'react';
import { EQUIPMENT_TYPE, ITEM_TAG } from '@/app/hex/architecture/enums';
import { Item } from '@/app/hex/architecture/typings';
import EquipmentSlot from '@/app/hex/sharedComponents/equipmentSlot/equipmentSlot';
import { EquipmentSlots } from '@/store/features/playerSlice';
import PlayerStoreSlice from '@/store/features/playerSlice';
import { useAppDispatch } from '@/store/hooks';
import { GenericDialog } from '@/app/hex/sharedComponents/genericDialog';
import { InventoryLineItem } from '@/app/hex/sharedComponents/itemDisplay/lineItem';
import styles from './equipmentSlots.module.css';

function filterItemsForEquipmentSlot(items: Item[], slot: EQUIPMENT_TYPE): Item[] {
	return items.filter((item) => item.types.includes(slot as unknown as ITEM_TAG));
}

interface EquipmentSlotsProps {
	inventoryItems: Item[];
	equipmentSlots: EquipmentSlots;
}

const EquipmentSlotsDisplay: React.FC<EquipmentSlotsProps> = ({ inventoryItems, equipmentSlots }): JSX.Element => {
	const dispatch = useAppDispatch();
	const [activeSlot, setActiveSlot] = useState<EQUIPMENT_TYPE | null>(null);

	const filtered = activeSlot !== null ? filterItemsForEquipmentSlot(inventoryItems, activeSlot) : [];
	const equippedIdForActiveSlot =
		activeSlot !== null ? (equipmentSlots as Record<EQUIPMENT_TYPE, string | null>)[activeSlot] : null;

	function onEquipmentSlotClick(slotType: EQUIPMENT_TYPE): void {
		setActiveSlot(slotType);
	}

	function closePicker(): void {
		setActiveSlot(null);
	}

	function onItemToggle(item: Item): void {
		if (activeSlot === null) return;
		dispatch(PlayerStoreSlice.actions.equipItem({ itemId: item.id, equipmentType: activeSlot }));
		setActiveSlot(null);
	}

	function getEquipmentSlots(): JSX.Element[] {
		const out: JSX.Element[] = [];
		Object.keys(equipmentSlots).forEach((slotType: string) => {
			const slotTypeEnum = slotType as EQUIPMENT_TYPE;
			const value = (equipmentSlots as Record<EQUIPMENT_TYPE, string | null>)[slotTypeEnum];
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
		<>
			<div className={styles.slotRow}>
				{getEquipmentSlots()}
			</div>
			<GenericDialog
				open={activeSlot !== null}
				onClose={closePicker}
				title={activeSlot !== null ? `Equip ${activeSlot}` : 'Equip'}
			>
				<div className={styles.dialogBody}>
					<h2 className={styles.dialogHeading}>
						{activeSlot !== null ? `Choose a ${activeSlot} to equip` : 'Equip'}
					</h2>
					{filtered.length === 0 ? (
						<p>No items in inventory match this slot type.</p>
					) : (
						<ul className={styles.itemList}>
							{filtered.map((item) => (
								<li key={item.id} className={styles.itemListItem}>
									<InventoryLineItem
										item={item}
										displayHeading={true}
										displaySize={28}
										selectable
										selected={equippedIdForActiveSlot === item.id}
										onToggle={() => onItemToggle(item)}
									/>
								</li>
							))}
						</ul>
					)}
				</div>
			</GenericDialog>
		</>
	);
};

export default EquipmentSlotsDisplay;
