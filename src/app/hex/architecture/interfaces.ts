interface Position {
	x: number;
	y: number;
}

interface HexTile {
	id: string;
	index: number;
	position: Position;
	neighbors: {
		topLeft?: string;
		topRight?: string;
		right?: string;
		bottomRight?: string;
		bottomLeft?: string;
		left?: string;
	};
}

interface HexMap {
	[key: string]: HexTile
}

export type { Position, HexTile, HexMap};