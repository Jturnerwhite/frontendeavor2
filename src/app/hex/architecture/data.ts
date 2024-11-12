import { ALCH_ELEMENT } from '@/app/hex/architecture/enums'

export type AlchEleData = {
	id: number;
	type: ALCH_ELEMENT;
	colorHex: string;
	iconClass: string;
}

/**
 * A collection of alchemical elements with their properties.
 * 
 * Each element is represented by an object containing:
 * - `id`: A unique identifier for the element.
 * - `type`: The type of the alchemical element.
 * - `colorHex`: The hexadecimal color code associated with the element.
 * - `iconClass`: The CSS class for the icon representing the element.
 * 
 * @constant
 * @type {Object}
 * @property {Object} ALCH_ELEMENT.EARTH - Earth element properties.
 * @property {Object} ALCH_ELEMENT.WIND - Wind element properties.
 * @property {Object} ALCH_ELEMENT.FIRE - Fire element properties.
 * @property {Object} ALCH_ELEMENT.WATER - Water element properties.
 * @property {Object} ALCH_ELEMENT.AETHER - Aether element properties.
 * @property {Object} ALCH_ELEMENT.CHAOS - Chaos element properties.
 */
export const AlchemicalElements:Record<ALCH_ELEMENT, AlchEleData> = {
	[ALCH_ELEMENT.EARTH]: {
		id: 0,
		type: ALCH_ELEMENT.EARTH,
		colorHex: "#b92e00",
		iconClass: `typeicon-${ALCH_ELEMENT.EARTH}`
	},
	[ALCH_ELEMENT.WIND]: {
		id: 1,
		type: ALCH_ELEMENT.WIND,
		colorHex: "#78c74b",
		iconClass: `typeicon-${ALCH_ELEMENT.WIND}`
	},
	[ALCH_ELEMENT.FIRE]: {
		id: 2,
		type: ALCH_ELEMENT.FIRE,
		colorHex: "#ff5e00",
		iconClass: `typeicon-${ALCH_ELEMENT.FIRE}`
	},
	[ALCH_ELEMENT.WATER]: {
		id: 3,
		type: ALCH_ELEMENT.WATER,
		colorHex: "#0c66ef",
		iconClass: `typeicon-${ALCH_ELEMENT.WATER}`
	},
	[ALCH_ELEMENT.AETHER]: {
		id: 4,
		type: ALCH_ELEMENT.AETHER,
		colorHex: "#02b8cd",
		iconClass: `typeicon-${ALCH_ELEMENT.AETHER}`
	},
	[ALCH_ELEMENT.CHAOS]: {
		id: 5,
		type: ALCH_ELEMENT.CHAOS,
		colorHex: "#961892",
		iconClass: `typeicon-${ALCH_ELEMENT.CHAOS}`
	} 
}

export const Recipies = [
	{}
];