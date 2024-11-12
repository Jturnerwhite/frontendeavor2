import { Position } from "@/app/hex/architecture/interfaces";

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
const GetStarPoints = (cx: number, cy: number, radius: number) => {
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

export { GetApothem, GetStarPoints, GetHexPointPos };