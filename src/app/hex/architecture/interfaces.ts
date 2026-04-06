import { ALCH_ELEMENT } from "./enums";
import { AlchComponent } from "./typings";

interface Position {
	x: number;
	y: number;
}

//      1
//   /     \
//  6       2
//  |   0   |
//  5       3
//   \     /
//      4
interface HexTile {
	id: string;
	index: number;
	position: Position;
	occupied: { 
		index: number, 
		alchComponent: AlchComponent 
		isLinkSpot: boolean;
	} | undefined;
	neighbors: string[];
}

interface HexMap {
	[key: string]: HexTile
}

interface PlacedComponent {
	comp: AlchComponent;
	position: Position;
	rotation: number;
	centerHexId: string;
	nodeHexes: Array<string|null>; // 7 entries, one for each node slot, may be null
}

interface LinkedComponents {
	element: ALCH_ELEMENT;
	component1Id: string;
	component1NodeIndex: number;
	component1HexId: string;
	component2Id: string;
	component2NodeIndex: number;
	component2HexId: string;
}

export type { Position, HexTile, HexMap, PlacedComponent, LinkedComponents};