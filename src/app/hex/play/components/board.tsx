import * as Helpers from '@/app/hex/architecture/helpers/alchHelpers';

const BoardHex: React.FC<{radiusBase: number, layers: number}> = ({
	radiusBase,
	layers,
}) => {
	const { x, y } = { x: 0, y: 0 };

	function getBoardHexPoints(radius: number, layers: number): string {
		const boardHexRadius = (Helpers.GetApothem(radius) * 2 * layers) + (radius);
		return [
			`${x + boardHexRadius},${y}`,
			`${x + boardHexRadius * Math.cos(Math.PI / 3)},${y + boardHexRadius * Math.sin(Math.PI / 3)}`,
			`${x + boardHexRadius * Math.cos((2 * Math.PI) / 3)},${y + boardHexRadius * Math.sin((2 * Math.PI) / 3)}`,
			`${x - boardHexRadius},${y}`,
			`${x + boardHexRadius * Math.cos((4 * Math.PI) / 3)},${y + boardHexRadius * Math.sin((4 * Math.PI) / 3)}`,
			`${x + boardHexRadius * Math.cos((5 * Math.PI) / 3)},${y + boardHexRadius * Math.sin((5 * Math.PI) / 3)}`,
		].join(' ');
	}
	return (
		<g className="board-hex">
			<polygon
				className="outer-border"
				points={getBoardHexPoints(radiusBase, layers)}
				stroke="transparent"
				fill="transparent"/>
			<polygon
				className="inner-border-4"
				points={getBoardHexPoints(radiusBase * 0.94, layers)}
				stroke="transparent"
				fill="transparent"/>
			<polygon
				transform={`rotate(30)`}
				className="inner-border-3"
				points={getBoardHexPoints(radiusBase * 0.84, layers)}
				stroke="transparent"
				fill="transparent"/>
			<polygon
				className="inner-border-2"
				points={getBoardHexPoints(radiusBase * 0.825, layers)}
				stroke="transparent"
				fill="transparent"/>
			<polygon
				className="inner-border"
				points={getBoardHexPoints(radiusBase * 0.92, layers - 1)}
				stroke="transparent"
				fill="transparent"/>
		</g>
	);
};
export default BoardHex;