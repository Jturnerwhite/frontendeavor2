'use client';

import { useState } from 'react';
import { HexTile } from '@/app/hex/architecture/interfaces';
import { styleHelper } from '@/app/hex/architecture/helpers/styleHelper';
import styles from './hex.module.css';

interface HexProps {
	radius: number;
	hexData: HexTile;
	onEnter?: Function;
	onLeave?: Function;
	onHexClick?: Function;
	displayIndex?: boolean;
}

const Hex: React.FC<HexProps> = ({
	radius,
	hexData,
	onEnter,
	onLeave,
	onHexClick,
	displayIndex = false
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
				className={styleHelper(styles.tile, 'hex-tile', hexData.additionalClassString)}
				points={points}
				pointerEvents="fill"
				onMouseEnter={hexEnter}
				onMouseLeave={hexLeave}
				onClick={hexClick}
			/>
			{displayIndex && (
				<>
				{/*
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
				*/}
				{/*
				<text
					className="hex-index-text"
					x={x}
					y={y + 18}
					textAnchor="middle"
					dominantBaseline="middle"
					fontSize={radius / 3}>
					{hexData.id}
				</text>
				*/}
				</>
			)}
		</>
	);
};

export default Hex;
