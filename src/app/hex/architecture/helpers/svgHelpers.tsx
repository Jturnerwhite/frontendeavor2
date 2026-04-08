import type { Position } from '@/app/hex/architecture/interfaces';

/** Corner / node positions for hex-based component SVG layout. */
export function GetHexPointPos(point: number, x: number, y: number, r: number): Position {
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
	return (
		<line
			key={key}
			className={'link ' + classString.replace(/\s+/g, '-').toLowerCase()}
			x1={pos.x}
			y1={pos.y}
			x2={nextPos.x}
			y2={nextPos.y}
			stroke={lineStroke}
			strokeWidth={size / 3}
		/>
	);
}