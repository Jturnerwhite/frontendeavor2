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
	occupied: { index: number, alchComponent: AlchComponent } | undefined;
	neighbors: string[];
}

interface HexMap {
	[key: string]: HexTile
}

export type { Position, HexTile, HexMap};