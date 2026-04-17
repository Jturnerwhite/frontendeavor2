import { HexMap, HexTile, LinkedComponents, PlacedComponent, Position } from "@/app/hex/architecture/interfaces";
import { getHexNeighborStep } from "./svgHelpers";
import { IngredientCompSpec, AlchComponent, Recipe, RecipeElementScore, RecipeResultingComponent } from "../typings";
import { ALCH_ELEMENT, COMPONENT_SHAPE_VALUES } from "../enums";

let tempIdSeq = 0;

/**
 * Short unique id for keys, temporary DOM ids, and other non-persistent uses.
 * Uses `crypto.randomUUID()` when available; otherwise a time- and counter-based fallback.
 * Not cryptographically strong; do not use for security-sensitive tokens.
 */
function GenerateTempId(): string {
	if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
		return globalThis.crypto.randomUUID();
	}
	tempIdSeq += 1;
	return `t-${Date.now().toString(36)}-${tempIdSeq.toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function GetApothem(radius: number): number {
	return radius * Math.sqrt(3) / 2;
};

function GetOppositeDirection(direction: number): number {
	return [0, 4, 5, 6, 1, 2, 3][direction];
};

function GetHexId(pos: Position):string {
	return `${pos.x},${pos.y}`
};

function GetRotatedMask(mask: number[], rotation: number): number[] {
	const k = (rotation % 6);
	const rotatedMask = new Array<number>(mask.length);
	if(rotation === 0) {
		return mask;
	}

	for (let j = 1; j < mask.length; j++) {
		let priorIndex = 0;
		if(((j - k) % 6) <= 0) {
			priorIndex = 6 + ((j - k) % 6)
		} else if(((j - k) % 6) > 5) {
			priorIndex = (j - k) % 6 - 6;
		} else {
			priorIndex = (j - k) % 6;
		}
		rotatedMask[j] = (mask[priorIndex]);
	}
	rotatedMask[0] = mask[0];
	return rotatedMask;
}

/**
 * Resolves hex tile ids that would be occupied by a component anchored at anchorHex,
 * using shape mask (COMPONENT_SHAPE_VALUES entry) and discrete clockwise 60° steps (cursor rotation).
 * Returns null if any node would lie outside the grid.
 */
function GetPlacementHexIds(
	anchorHex: HexTile,
	shapeMask: number[],
	rotation: number,
	hexMap: HexMap
): string[] | null {
	const k = (rotation % 6);
	const ids = new Array<string>();
	const rotatedMask = GetRotatedMask(shapeMask, rotation);

	for (let j = 0; j < 7 && j < rotatedMask.length; j++) {
		if (!rotatedMask[j]) {
			ids.push("null");
			continue;
		}

		let hexId: string;
		if (j === 0) {
			hexId = anchorHex.id;
		} else {
			//const neighborToCheck = (j + k) % 6;
			const neighborId = anchorHex.neighbors[j];
			if (!neighborId) return null;
			hexId = neighborId;
		}

		if (!hexMap[hexId]) return null;
		ids.push(hexId);
	}

	return Array.from(ids);
}

function CreateHexGrid(center:Position, radius:number, layers:number):HexMap {
	const centerX = center.x;
	const centerY = center.y;

	// Offset for adjacent hexagons based on trig calculations
	const hexagonOffsetX = Math.floor(1.5 * radius);
	const hexagonOffsetY = Math.floor(radius * Math.cos(Math.PI / 6));

	let hexMap = {} as HexMap;

	// Helper to add a hex and connect neighbors
	const addHex = (pos: Position, count: number) => {
		const id = GetHexId(pos);
		if (hexMap.hasOwnProperty(id)) 
			return;

		const newHex: HexTile = {
			position: pos,
			neighbors: [] as string[],
			id,
			index: count,
			occupied: undefined
		};
		// Calculate potential neighbor positions (same offsets as GetHexPointPos + hex grid)
		const neighborPositions = new Array<Position | null>();
		neighborPositions[0] = null;
		for (let d = 1; d <= 6; d++) {
			const step = getHexNeighborStep(d, radius);
			neighborPositions[d] = { x: pos.x + step.x, y: pos.y + step.y };
		}

		// Connect existing neighbors
		neighborPositions.map((neighborPos, direction) => {
			if(neighborPos === null) return;

			const neighborId = GetHexId(neighborPos);
			const neighbor = hexMap[neighborId];
			if (neighbor) {
				newHex.neighbors[direction] = neighborId;
				// Add reverse connection
				const reverseDirection = GetOppositeDirection(direction);
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

function OccupyHexes(hexMap: HexMap, newPlacedComponent:PlacedComponent) {
	newPlacedComponent.nodeHexes.forEach((id, index) => {
		if(id === null) return;
		let rotatedMask: number[] | null = null;
		if(newPlacedComponent.comp.linkSpots)
			rotatedMask = GetRotatedMask(newPlacedComponent.comp.linkSpots!, newPlacedComponent.rotation);
		hexMap[id].occupied = { 
			index: index, 
			alchComponent: newPlacedComponent.comp, 
			isLinkSpot: rotatedMask ? rotatedMask[index] === 1 : false
		};
	});
}

function GetNeighbors(hexMap: HexMap, hexId: string, component: AlchComponent, ignoreSelf: boolean = true, onlyOccupied: boolean = false, onlyLinks: boolean = false): HexTile[] {
	const neighbors: HexTile[] = [];
	if(hexMap[hexId]?.neighbors === undefined) {
		return neighbors;
	}

	return hexMap[hexId].neighbors.reduce((acc: HexTile[], id: string, index: number) => {
		if(id === null) return acc;
		const neighborsOccupied = hexMap[id].occupied;
		if(hexMap[id] === undefined || 
			(ignoreSelf && neighborsOccupied?.alchComponent.id === component.id) ||
			(onlyOccupied && neighborsOccupied === undefined) ||
			(neighborsOccupied?.alchComponent.element !== undefined && neighborsOccupied?.alchComponent.element !== component.element) ||
			(onlyLinks && neighborsOccupied?.isLinkSpot === false)
		) {
			return acc;
		}

		return [...acc, hexMap[id]];
	}, []);
}

function GetLinks(hexMap: HexMap, placedComponent: PlacedComponent):Array<LinkedComponents> {
	const links:Array<LinkedComponents> = [];
	if(placedComponent.comp.linkSpots === undefined) 
		return links;

	placedComponent.nodeHexes.forEach((hexId, index) => {
		let rotatedMask: number[] | null = null;
		if(placedComponent.comp.linkSpots)
			rotatedMask = GetRotatedMask(placedComponent.comp.linkSpots!, placedComponent.rotation);
		if(hexId === null || rotatedMask?.[index] === 0) 
			return;

		// Get neighbors that are occupied and have the same element and are 'link' type nodes
		const neighbors = GetNeighbors(hexMap, hexId, placedComponent.comp, true, true, true);
		neighbors.forEach((neighbor: HexTile, neighborIndex: number) => {
			links.push({
				element: placedComponent.comp.element,
				component1Id: placedComponent.comp.id!,
				component1NodeIndex: neighborIndex,
				component1HexId: hexId,
				component2Id: neighbor.occupied!.alchComponent.id!,
				component2NodeIndex: neighbor.occupied!.index,
				component2HexId: neighbor.id
			});
		});
	});
	return links;
}

function CompilePlacedComponent(hexMap: HexMap, centerHex:HexTile, position:Position, rotation:number, comp:AlchComponent):PlacedComponent {
	const newPlacedComponent:PlacedComponent = {
		comp: comp,
		position: position,
		rotation: rotation,
		centerHexId: centerHex.id,
		nodeHexes: new Array<string|null>(7)
	};

	const shapeMask = COMPONENT_SHAPE_VALUES[comp.shape];
	const hexIds = GetPlacementHexIds(hexMap[centerHex.id], shapeMask, rotation, hexMap);
	if (hexIds) {
		hexIds.forEach((id, index) => {
			if(id !== "null")
				newPlacedComponent.nodeHexes[index] = id;
		});
	}
	return newPlacedComponent;
}

function CalculateLinksInComponent(component: AlchComponent): number {
	let output = 0;

	if(component.linkSpots === undefined)
		return output;

	for(let i = 1; i < 7; i++) {
		if(component.linkSpots[i] === 1) {
			if(component.linkSpots[0] === 1)
				output++;
			
			if((i+1 < 7 && component.linkSpots[i+1] === 1) || 
				(i+1 == 7 && component.linkSpots[1] === 1))
				output++;
		}
	}

	return output;
}

function CalculateQuality(recipe: Recipe, elementScores: Record<ALCH_ELEMENT, {nodes: number, links: number}>): number {
	let output = 0;
	const nodeScaling = 2;
	const linkScaling = 4;
	const excessElementsScaling = -1;
	Object.keys(elementScores).forEach((element: string) => {
		const isValidElement = recipe.elementScores.some((e: RecipeElementScore) => e.element === element as ALCH_ELEMENT);
		if(isValidElement)
			output += elementScores[element as ALCH_ELEMENT].nodes * nodeScaling + elementScores[element as ALCH_ELEMENT].links * linkScaling;
		else
			output += (excessElementsScaling * elementScores[element as ALCH_ELEMENT].nodes);
	});
	return output;
}

function GetResultingComponents(recipe: Recipe, elementScores: Record<ALCH_ELEMENT, {nodes: number, links: number}>): Array<AlchComponent> {
	const output: Array<AlchComponent> = [];
	recipe.resultingComponents.forEach((resultComps: Array<RecipeResultingComponent>) => {
		let finalComponent: AlchComponent|null = null;
		resultComps.forEach((resultCompGoal: RecipeResultingComponent) => {
			let matchingElementScoreRequirements = recipe.elementScores.find((elementScore: RecipeElementScore) => elementScore.element === resultCompGoal.element);
			let maxScorePossible = matchingElementScoreRequirements?.cap ?? 0;
			if(matchingElementScoreRequirements && elementScores[resultCompGoal.element]) {
				// only allow the score to be as high as the soft cap + the number of links
				maxScorePossible = Math.min(maxScorePossible, (matchingElementScoreRequirements.softCap + elementScores[resultCompGoal.element].links));
				if(Math.min(elementScores[resultCompGoal.element].nodes, maxScorePossible) >= resultCompGoal.scoreRequirement) {
					finalComponent = {
						element: resultCompGoal.element,
						shape: resultCompGoal.shape,
						linkSpots: resultCompGoal.linkSpots,
					};
				}
			}
		});
		if(finalComponent)
			output.push(finalComponent);
	});
	return output;
}

export {
	CalculateLinksInComponent,
	CalculateQuality,
	CompilePlacedComponent,
	CreateHexGrid,
	GenerateTempId,
	GetApothem,
	GetHexId,
	GetLinks,
	GetOppositeDirection,
	GetPlacementHexIds,
	GetResultingComponents,
	OccupyHexes,
};
