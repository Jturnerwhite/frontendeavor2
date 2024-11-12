import Hex from './hex'
import { Position, HexTile } from '@/app/hex/architecture/interfaces';

interface HexGridProps {
	center:Position;
	radius:number;
	layers:number;
}

const HexGrid: React.FC<HexGridProps> = ({ center, radius, layers }): JSX.Element => {
	// Center position of the initial hexagon
	const centerX = center.x;
	const centerY = center.y;

	// Store hex tiles with their relationships
	const hexMap = new Map<string, HexTile>();

	// Offset for adjacent hexagons based on trigonometric calculations
	const hexagonOffsetX = (1.5 * radius); // Distance between hexagons horizontally
	const hexagonOffsetY = (radius * Math.cos(Math.PI / 6));      // Distance vertically to align with overlap

	const getHexId = (pos: Position): string => `${pos.x},${pos.y}`;
	// Helper to get opposite direction
	const getOppositeDirection = (direction: keyof HexTile['neighbors']): keyof HexTile['neighbors'] => {
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

	// Helper to add a hex and connect neighbors
	const addHex = (pos: Position, count: number) => {
		const id = getHexId(pos);
		if (hexMap.has(id)) return;

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
			const neighborId = getHexId(neighborPos);
			const neighbor = hexMap.get(neighborId);
			if (neighbor) {
				newHex.neighbors[direction as keyof typeof newHex.neighbors] = neighborId;
				// Add reverse connection
				const reverseDirection = getOppositeDirection(direction as keyof typeof newHex.neighbors);
				neighbor.neighbors[reverseDirection] = id;
			}
		});

		hexMap.set(id, newHex);
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

	return (
		<>
			{Array.from(hexMap.values()).map((hex) => (
				<Hex key={hex.id} hexData={hex} radius={radius}/>
			))}
		</>
	);
}

export default HexGrid;