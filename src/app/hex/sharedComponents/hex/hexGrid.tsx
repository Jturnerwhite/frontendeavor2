'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import Hex from './hex';
import './hex.css';
import { Position, HexTile, HexMap } from '@/app/hex/architecture/interfaces';
import * as Helpers from '@/app/hex/architecture/helpers';
import { COMPONENT_SHAPE_VALUES } from '@/app/hex/architecture/enums';
import { AlchComponentDisplay } from '@/app/hex/play/components/alchComponent';

interface HexGridProps {
	hexMap: HexMap;
	radius: number;
	onHexEnter?: Function;
	onHexLeave?: Function;
	onHexClick?: Function;
	displayIndex?: boolean;
	preventHexHover?: boolean;
	preventHexPlacementHover?: boolean;
}

const HexGrid: React.FC<HexGridProps> = ({
	hexMap,
	radius,
	onHexEnter,
	onHexLeave,
	onHexClick,
	displayIndex = false,
	preventHexHover = false,
}): JSX.Element => {
	const [hexHovered, setHexHovered] = useState<HexTile | null>(null);

	function hexEnter(hex: HexTile) {
		setHexHovered(hex);
		if (onHexEnter) onHexEnter(hex);
	}
	function hexLeave() {
		if (onHexLeave) onHexLeave(hexHovered);
	}
	function hexClick(clickedHex: HexTile) {
		if (onHexClick) onHexClick(clickedHex);
	}

	return (
		<g className="hex-grid">
			{Object.keys(hexMap).map((id) => {
				const hex = hexMap[id];
				return (
					<Hex
						key={hex.id}
						hexData={hex}
						radius={radius}
						onEnter={hexEnter}
						onLeave={hexLeave}
						onHexClick={hexClick}
						displayIndex={displayIndex}
						preventHover={preventHexHover}
					/>
				);
			})}
		</g>
	);
};

const AlchHexGrid: React.FC<HexGridProps> = ({
	hexMap,
	radius,
	onHexEnter,
	onHexLeave,
	onHexClick,
	displayIndex = false,
	preventHexHover = false,
}): JSX.Element => {
	const cursorState = useSelector((state: RootState) => state.Alchemy.cursor);
	const [hexHovered, setHexHovered] = useState<HexTile | null>(null);
	const [validTileHover, setValidTileHover] = useState<boolean | undefined>();

	function calcIsValidHover(hex: HexTile | null) {
		if (!hex) return;
		if (cursorState.isPlacing && cursorState.selectedComponent) {

			const shapeMask = COMPONENT_SHAPE_VALUES[cursorState.selectedComponent.shape];
			const hexIds = Helpers.GetPlacementHexIds(
				hex,
				shapeMask,
				cursorState.rotation,
				hexMap
			);

			if (!hexIds || !hexIds.every((id) => (id === "null" || !hexMap[id].occupied))) {
				setValidTileHover(false);
			} else {
				setValidTileHover(true);
			}
		}
	}

	function hexEnter(hex: HexTile) {
		setHexHovered(hex);
		if (onHexEnter) onHexEnter(hex, validTileHover);
	}
	function hexLeave() {
		if (onHexLeave) onHexLeave(hexHovered);
	}
	function hexClick(clickedHex: HexTile) {
		if (!cursorState.isPlacing || !cursorState.selectedComponent) return;
		if (onHexClick) onHexClick(clickedHex, validTileHover);
	}

	useEffect(() => {
		calcIsValidHover(hexHovered);
	}, [cursorState.rotation, hexHovered]);

	return (
		<>
			<HexGrid
				hexMap={hexMap}
				radius={radius}
				onHexEnter={hexEnter}
				onHexLeave={hexLeave}
				onHexClick={hexClick}
				displayIndex={displayIndex}
				preventHexHover={preventHexHover}
			/>
		</>
	);
};

export default AlchHexGrid;
