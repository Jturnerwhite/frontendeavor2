import { EquipmentSkill } from "@/app/hex/architecture/typings";

export const EquipmentSkills:Record<string, EquipmentSkill> = {
	castingAccuracy1: {
		id: 'castingAccuracy1',
		name: 'Cast ACC: 1',
		type: 'stat',
		description: 'Abysmal Cast Accuracy',
		value: 1,
	},
	castingAccuracy2: {
		id: 'castingAccuracy2',
		name: 'Cast ACC: 2',
		type: 'stat',
		description: 'Mediocre Cast Accuracy',
		value: 5,
	},
	castingAccuracy3: {
		id: 'castingAccuracy3',
		name: 'Cast ACC: 3',
		type: 'stat',
		description: 'Fair Cast Accuracy',
		value: 7,
	},
	reelSpeed1: {
		id: 'reelSpeed1',
		name: 'Reel SPD: 1',
		type: 'stat',
		description: 'Super Slow Reel Speed',
		value: 1,
	},
	reelSpeed2: {
		id: 'reelSpeed2',
		name: 'Reel SPD: 2',
		type: 'stat',
		description: 'Somewhat Slow Reel Speed',
		value: 3,
	},
	reelSpeed3: {
		id: 'reelSpeed3',
		name: 'Reel SPD: 3',
		type: 'stat',
		description: 'Basic Reel Speed',
		value: 5,
	},
}