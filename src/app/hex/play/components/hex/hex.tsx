'use client';

import { HexTile } from '@/app/hex/architecture/interfaces';
import { useState } from 'react';
import './hex.css';

interface HexProps {
	radius: number;
	hexData: HexTile;
	onEnter?: Function;
	onLeave?: Function;
	onHexClick?: Function;
	displayIndex?: boolean;
	preventHover?: boolean;
	isValidHover?: boolean;
	/** When true, occupied tiles render a red fill (e.g. brief debug flash). */
	flashOccupied?: boolean;
}

function tileClassName(
	flashOccupied: boolean,
	occupied: HexTile['occupied'],
	isHovered: boolean,
	preventHover: boolean,
	isValidHover: boolean
): string {
	if (flashOccupied && occupied) {
		return 'hex-tile hex-tile--flash-occupied';
	}
	if (isHovered && !preventHover) {
		return `hex-tile ${isValidHover ? 'hex-tile--hover-valid' : 'hex-tile--hover-invalid'}`;
	}
	return 'hex-tile';
}

const Hex: React.FC<HexProps> = ({
	radius,
	hexData,
	onEnter,
	onLeave,
	onHexClick,
	displayIndex = false,
	preventHover = false,
	isValidHover = false,
	flashOccupied = false,
}): JSX.Element => {
	const { x, y } = hexData.position;
	const points = [
		`${x + radius},${y}`,
		`${x + radius * Math.cos(Math.PI / 3)},${y + radius * Math.sin(Math.PI / 3)}`,
		`${x + radius * Math.cos((2 * Math.PI) / 3)},${y + radius * Math.sin((2 * Math.PI) / 3)}`,
		`${x - radius},${y}`,
		`${x + radius * Math.cos((4 * Math.PI) / 3)},${y + radius * Math.sin((4 * Math.PI) / 3)}`,
		`${x + radius * Math.cos((5 * Math.PI) / 3)},${y + radius * Math.sin((5 * Math.PI) / 3)}`,
	].join(' ');

	const [isHovered, setHovered] = useState(false);

	function hexEnter() {
		setHovered(true);
		onEnter ? onEnter(hexData) : null;
	}
	function hexLeave() {
		setHovered(false);
		onLeave ? onLeave(hexData) : null;
	}
	function hexClick() {
		onHexClick ? onHexClick(hexData) : null;
	}

	return (
		<>
			<polygon
				className={tileClassName(
					flashOccupied,
					hexData.occupied,
					isHovered,
					preventHover,
					isValidHover
				)}
				points={points}
				pointerEvents="fill"
				onMouseEnter={hexEnter}
				onMouseLeave={hexLeave}
				onClick={hexClick}
			/>
			{displayIndex && (
				<text
					className="hex-index-text"
					x={x}
					y={y + 1}
					textAnchor="middle"
					dominantBaseline="middle"
					fontSize={radius / 2}
				>
					{hexData.index}
				</text>
			)}
		</>
	);
};

export default Hex;
