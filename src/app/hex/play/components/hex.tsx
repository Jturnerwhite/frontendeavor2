'use client'
import { HexTile } from '@/app/hex/architecture/interfaces';
import { useState } from 'react';

interface HexProps {
	radius: number;
	hexData: HexTile;
	onEnter?: Function;
	onLeave?: Function;
	onHexClick?: Function;
	displayIndex?: boolean;
	preventHover?: boolean
	isValidHover?: boolean;
}

const Hex: React.FC<HexProps> = ({ 
	radius, 
	hexData, 
	onEnter, 
	onLeave, 
	onHexClick,
	displayIndex = false, 
	preventHover = false, 
	isValidHover = false }): JSX.Element => {

	let { x, y } = hexData.position;
	// Calculate the points for a hexagon centered at (x, y)
	// Each point is calculated using the radius and the angle (in radians) from the center
	// The angles used are 0, 60, 120, 180, 240, and 300 degrees converted to radians
	const points = [
		`${x + radius},${y}`,
		`${x + radius * Math.cos(Math.PI / 3)},${y + radius * Math.sin(Math.PI / 3)}`,
		`${x + radius * Math.cos((2 * Math.PI) / 3)},${y + radius * Math.sin((2 * Math.PI) / 3)}`,
		`${x - radius},${y}`,
		`${x + radius * Math.cos((4 * Math.PI) / 3)},${y + radius * Math.sin((4 * Math.PI) / 3)}`,
		`${x + radius * Math.cos((5 * Math.PI) / 3)},${y + radius * Math.sin((5 * Math.PI) / 3)}`
	].join(' ');

	let [isHovered, setHovered] = useState(false);

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

	let fillColor = "none";
	if(isHovered && !preventHover) {
		if(isValidHover) {
			fillColor = "green";
		} else {
			fillColor = "red";
		}
	}

	return (
		<>
			<polygon
				points={points}
				fill={fillColor}
				stroke="white"
				strokeWidth={2}
				pointerEvents="fill"
				onMouseEnter={hexEnter}
				onMouseLeave={hexLeave}
				onClick={hexClick} />
			{displayIndex &&
				<>
					<text
						x={x}
						y={y-3}
						pointerEvents="none"
						textAnchor="middle"
						dominantBaseline="middle"
						fill="white"
						fontSize={radius / 2}
						fontWeight="bold"
					>
						{hexData.index}
					</text>
					<text
						x={x}
						y={y+6}
						pointerEvents="none"
						textAnchor="middle"
						dominantBaseline="middle"
						fill="white"
						fontSize={radius / 3}
					>{hexData.position.x},{hexData.position.y}</text>
				</>
			}
		</>
	);
}

export default Hex;