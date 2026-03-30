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
	/** True when an alchemical component occupies this hex (placement logic). */
	occupied?: boolean;
	neighbors: string[];
}

interface HexMap {
	[key: string]: HexTile
}

export type { Position, HexTile, HexMap};