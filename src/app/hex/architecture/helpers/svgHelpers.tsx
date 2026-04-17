import type { Position } from '@/app/hex/architecture/interfaces';

/**
 * Integer neighbor offset from a hex center to an adjacent hex center, matching
 * `CreateHexGrid` (floored `hexagonOffsetX` / `hexagonOffsetY`). Direction 1..6.
 */
export function getHexNeighborStep(direction: number, hexCircumradius: number): Position {
	const hexagonOffsetX = Math.floor(1.5 * hexCircumradius);
	const hexagonOffsetY = Math.floor(hexCircumradius * Math.cos(Math.PI / 6));
	switch (direction) {
		case 1:
			return { x: 0, y: -2 * hexagonOffsetY };
		case 2:
			return { x: hexagonOffsetX, y: -hexagonOffsetY };
		case 3:
			return { x: hexagonOffsetX, y: hexagonOffsetY };
		case 4:
			return { x: 0, y: 2 * hexagonOffsetY };
		case 5:
			return { x: -hexagonOffsetX, y: hexagonOffsetY };
		case 6:
			return { x: -hexagonOffsetX, y: -hexagonOffsetY };
		default:
			return { x: 0, y: 0 };
	}
}

export function GetHexPoints(position: Position, radius: number): string {
	const adjustedRadius:number = parseFloat(radius.toFixed(2));
	
	return [
		`${position.x + adjustedRadius},${position.y}`,
		`${position.x + adjustedRadius * Math.cos(Math.PI / 3)},${position.y + adjustedRadius * Math.sin(Math.PI / 3)}`,
		`${position.x + adjustedRadius * Math.cos((2 * Math.PI) / 3)},${position.y + adjustedRadius * Math.sin((2 * Math.PI) / 3)}`,
		`${position.x - adjustedRadius},${position.y}`,
		`${position.x + adjustedRadius * Math.cos((4 * Math.PI) / 3)},${position.y + adjustedRadius * Math.sin((4 * Math.PI) / 3)}`,
		`${position.x + adjustedRadius * Math.cos((5 * Math.PI) / 3)},${position.y + adjustedRadius * Math.sin((5 * Math.PI) / 3)}`,
	].join(' ');
}

export function GetHexStarPoints(position: Position, radius: number): string {
	const adjustedRadius = parseFloat(radius.toFixed(2));
	const cx = position.x;
	const cy = position.y;

	const corners = [
		{ x: cx + adjustedRadius, y: cy },
		{
			x: cx + adjustedRadius * Math.cos(Math.PI / 3),
			y: cy + adjustedRadius * Math.sin(Math.PI / 3),
		},
		{
			x: cx + adjustedRadius * Math.cos((2 * Math.PI) / 3),
			y: cy + adjustedRadius * Math.sin((2 * Math.PI) / 3),
		},
		{ x: cx - adjustedRadius, y: cy },
		{
			x: cx + adjustedRadius * Math.cos((4 * Math.PI) / 3),
			y: cy + adjustedRadius * Math.sin((4 * Math.PI) / 3),
		},
		{
			x: cx + adjustedRadius * Math.cos((5 * Math.PI) / 3),
			y: cy + adjustedRadius * Math.sin((5 * Math.PI) / 3),
		},
	];

	const fmt = (v: number) => parseFloat(v.toFixed(2));
	const inwardTowardCenter = 0.2;
	const parts: string[] = [];
	for (let i = 0; i < 6; i++) {
		const a = corners[i]!;
		const b = corners[(i + 1) % 6]!;
		parts.push(`${fmt(a.x)},${fmt(a.y)}`);
		const midX = (a.x + b.x) / 2;
		const midY = (a.y + b.y) / 2;
		const pulledX = midX + inwardTowardCenter * (cx - midX);
		const pulledY = midY + inwardTowardCenter * (cy - midY);
		parts.push(`${fmt(pulledX)},${fmt(pulledY)}`);
	}
	return parts.join(' ');
}

/** Corner / node positions for hex-based component SVG layout. */
export function GetHexPointPos(
	point: number,
	x: number,
	y: number,
	r: number,
): Position {
	if (point === 0) {
		return { x, y };
	}
	const angle = (Math.PI / 3) * (point - 1);

	return {
		x: x + r * Math.sin(angle),
		y: y - r * Math.cos(angle),
	};
}

/** Point list for a star-shaped link node polygon. */
export function GetStarPoints(cx: number, cy: number, radius: number): string {
	const points: number[] = [];
	const spikes = 5;
	const rot = Math.PI / 2;
	const step = Math.PI / spikes;

	for (let i = 0; i < spikes * 2; i++) {
		const r = i % 2 === 0 ? radius : radius * 0.4;
		const angle = i * step - rot;
		points.push(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
	}

	return points.join(' ');
}

/** SVG `<line>` between two positions (e.g. component internal links). */
export function GetSVGLine(
	key: string,
	classString: string,
	pos: Position,
	nextPos: Position,
	lineStroke: string,
	size: number,
): JSX.Element {
	let strokeWidth = 18;
	if (size <= 20) {
		strokeWidth = 0;
	} else if (size <= 35) {
		strokeWidth = 0;
	} else if (size <= 40) {
		strokeWidth = 16;
	}

	return (
		<line
			key={key}
			className={'link ' + classString.replace(/\s+/g, '-').toLowerCase()}
			x1={pos.x}
			y1={pos.y}
			x2={nextPos.x}
			y2={nextPos.y}
			stroke={lineStroke}
			strokeWidth={strokeWidth}
		/>
	);
}