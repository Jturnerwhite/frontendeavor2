import { ItemAspect, ItemAspectComp } from "@/app/hex/architecture/typings";
import { ALCH_ELEMENT, SHAPE_NAME } from "@/app/hex/architecture/enums";

const SharedComponentAspects:Record<string, ItemAspect> = {
	sharedWater1: {
		id: 'sharedWater1',
		name: 'Water Infusion 1',
		type: 'component',
		description: `An item's additional water component.`,
		value: {
			element: ALCH_ELEMENT.WATER,
			shape: SHAPE_NAME.DOT,
			linkSpots: [1, 0, 0, 0, 0, 0, 0],
		} as ItemAspectComp,
	},
};

const EquipmentAspects:Record<string, ItemAspect> = {
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
};

const ItemAspects:Record<string, ItemAspect> = {
	...SharedComponentAspects,
	...EquipmentAspects,
}

export { SharedComponentAspects, EquipmentAspects, ItemAspects };
