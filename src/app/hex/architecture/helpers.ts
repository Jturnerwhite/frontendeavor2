import { HexMap, HexTile, Position } from "@/app/hex/architecture/interfaces";

function GetApothem(radius: number): number {
	return radius * Math.sqrt(3) / 2;
};

function GetHexPointPos(point: number, x: number, y: number, r: number): Position {
	if (point === 0) {
		return { x, y };
	}
	const angle = (Math.PI / 3) * (point - 1);

	return {
		x: x + r * Math.cos(angle),
		y: y + r * Math.sin(angle)
	};
}

function GetStarPoints(cx: number, cy: number, radius: number): string {
	const points: number[] = [];
	const spikes = 5;
	const rot = Math.PI / 2; // rotation to point up
	const step = Math.PI / spikes;

	for (let i = 0; i < spikes * 2; i++) {
		const r = i % 2 === 0 ? radius : radius * 0.4; // outer and inner radius
		const angle = i * step - rot;
		points.push(
			cx + r * Math.cos(angle),
			cy + r * Math.sin(angle)
		);
	}

	return points.join(' ');
};

function GetOppositeDirection(direction: keyof HexTile['neighbors']): keyof HexTile['neighbors'] {
	const opposites: Record<string, keyof HexTile['neighbors']> = {
		topLeft: 'bottomRight',
		topRight: 'bottomLeft',
		right: 'left',
		bottomRight: 'topLeft',
		bottomLeft: 'topRight',
		left: 'right'
	};
	return opposites[direction];
};

function GetHexId(pos: Position):string {
	return `${pos.x},${pos.y}`
};

function CreateHexGrid(center:Position, radius:number, layers:number):HexMap {
	const centerX = center.x;
	const centerY = center.y;
	// Offset for adjacent hexagons based on trigonometric calculations
	const hexagonOffsetX = (1.5 * radius);						// Distance between hexagons horizontally
	const hexagonOffsetY = (radius * Math.cos(Math.PI / 6));	// Distance vertically to align with overlap

	let hexMap = {} as HexMap;

	// Helper to add a hex and connect neighbors
	const addHex = (pos: Position, count: number) => {
		const id = GetHexId(pos);
		if (hexMap.hasOwnProperty(id)) 
			return;

		const newHex: HexTile = {
			position: pos,
			neighbors: {},
			id,
			index: count
		};

		// Calculate potential neighbor positions
		const neighborPositions = {
			topLeft: { x: pos.x - hexagonOffsetX, y: pos.y - hexagonOffsetY },
			topRight: { x: pos.x + hexagonOffsetX, y: pos.y - hexagonOffsetY },
			right: { x: pos.x + hexagonOffsetX * 2, y: pos.y },
			bottomRight: { x: pos.x + hexagonOffsetX, y: pos.y + hexagonOffsetY },
			bottomLeft: { x: pos.x - hexagonOffsetX, y: pos.y + hexagonOffsetY },
			left: { x: pos.x - hexagonOffsetX * 2, y: pos.y }
		};

		// Connect existing neighbors
		Object.entries(neighborPositions).forEach(([direction, neighborPos]) => {
			const neighborId = GetHexId(neighborPos);
			const neighbor = hexMap[neighborId];
			if (neighbor) {
				newHex.neighbors[direction as keyof typeof newHex.neighbors] = neighborId;
				// Add reverse connection
				const reverseDirection = GetOppositeDirection(direction as keyof typeof newHex.neighbors);
				neighbor.neighbors[reverseDirection] = id;
			}
		});
		hexMap[id] = newHex;
	};

	let count = 0;
	addHex({ x: centerX, y: centerY }, count++);
	// Create the hex grid
	for (let i = 1; i < layers; i++) {
		// Add the top center hexagon
		const startHex: Position = { x: centerX, y: centerY - (2 * hexagonOffsetY * i) };
		addHex(startHex, count++);

		let tempHex: Position = Object.assign({}, startHex);
		for (let j = 1; j < i + 1; j++) {
			tempHex = { x: tempHex.x + hexagonOffsetX, y: tempHex.y + hexagonOffsetY };
			addHex(tempHex, count++);
		}
		for (let j = 1; j < i + 1; j++) {
			tempHex = { x: tempHex.x, y: tempHex.y + (2 * hexagonOffsetY) };
			addHex(tempHex, count++);
		}
		for (let j = 1; j < i + 1; j++) {
			tempHex = { x: tempHex.x - hexagonOffsetX, y: tempHex.y + hexagonOffsetY };
			addHex(tempHex, count++);
		}
		for (let j = 1; j < i + 1; j++) {
			tempHex = { x: tempHex.x - hexagonOffsetX, y: tempHex.y - hexagonOffsetY };
			addHex(tempHex, count++);
		}
		for (let j = 1; j < i + 1; j++) {
			tempHex = { x: tempHex.x, y: tempHex.y - (2 * hexagonOffsetY) };
			addHex(tempHex, count++);
		}
		for (let j = 1; j < i + 1; j++) {
			if (j !== i) {
				tempHex = { x: tempHex.x + hexagonOffsetX, y: tempHex.y - hexagonOffsetY };
				addHex(tempHex, count++);
			}
		}
	}

	return hexMap;
}

export { GetApothem, GetStarPoints, GetHexPointPos, GetHexId, GetOppositeDirection, CreateHexGrid };