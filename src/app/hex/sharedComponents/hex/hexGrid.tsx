'use client';

import { useState, useEffect, useCallback } from 'react';
import Hex from './hex';
import { styleHelper } from '@/app/hex/architecture/helpers/styleHelper';
import styles from './hex.module.css';
import type { HexTile, HexMap } from '@/app/hex/architecture/interfaces';
import type { AlchComponent } from '@/app/hex/architecture/typings';
import * as AlchHelpers from '@/app/hex/architecture/helpers/alchHelpers';
import { COMPONENT_SHAPE_VALUES } from '@/app/hex/architecture/enums';

/** Cursor state for placement hover validation (provided by the route/container; avoids Redux in this grid). */
export type AlchPlacementCursor = {
	isPlacing: boolean;
	selectedComponent: AlchComponent | null;
	rotation: number;
};

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

interface AlchHexGridProps extends HexGridProps {
	/** When set, placement hover/click gating uses this instead of Redux. Omit for static preview grids. */
	placementCursor?: AlchPlacementCursor;
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
		if (onHexEnter) 
			onHexEnter(hex);
	}
	function hexLeave() {
		if (onHexLeave) 
			onHexLeave(hexHovered);
	}
	function hexClick(clickedHex: HexTile) {
		if (onHexClick) 
			onHexClick(clickedHex);
	}

	return (
		<g className={styleHelper(styles.grid, 'hex-grid')}>
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
					/>
				);
			})}
		</g>
	);
};

const AlchHexGrid: React.FC<AlchHexGridProps> = ({
	hexMap,
	radius,
	onHexEnter,
	onHexLeave,
	onHexClick,
	displayIndex = false,
	preventHexHover = false,
	placementCursor,
}): JSX.Element => {
	const [hexHovered, setHexHovered] = useState<HexTile | null>(null);
	const [validTileHover, setValidTileHover] = useState<boolean | undefined>();

	const calcIsValidHover = useCallback(
		(hex: HexTile | null) => {
			if (!hex) return;
			if (
				!placementCursor?.isPlacing ||
				!placementCursor.selectedComponent
			) {
				setValidTileHover(undefined);
				return;
			}

			const shapeMask = COMPONENT_SHAPE_VALUES[placementCursor.selectedComponent.shape];
			const hexIds = AlchHelpers.GetPlacementHexIds(
				hex,
				shapeMask,
				placementCursor.rotation,
				hexMap
			);

			if (!hexIds || !hexIds.every((id: string) => (id === "null" || !hexMap[id].occupied))) {
				setValidTileHover(false);
			} else {
				setValidTileHover(true);
			}
		},
		[hexMap, placementCursor],
	);

	function hexEnter(hex: HexTile) {
		setHexHovered(hex);
		if (onHexEnter) onHexEnter(hex, validTileHover);
	}
	function hexLeave() {
		if (onHexLeave) onHexLeave(hexHovered);
	}
	function hexClick(clickedHex: HexTile) {
		if (
			!placementCursor?.isPlacing ||
			!placementCursor.selectedComponent
		) {
			return;
		}
		if (onHexClick) onHexClick(clickedHex, validTileHover);
	}

	useEffect(() => {
		calcIsValidHover(hexHovered);
	}, [hexHovered, calcIsValidHover]);

	let gridClassString = "alch-hex-grid";
	if (!preventHexHover) {
		if (placementCursor?.isPlacing && placementCursor.selectedComponent) {
			if (!validTileHover) {
				gridClassString += " alch-hex-grid--hover-invalid";
			} else {
				gridClassString += " alch-hex-grid--hover-valid";
			}
		}
	}

	return (
		<>
			<g className={gridClassString}>
				<HexGrid
					hexMap={hexMap}
					radius={radius}
					onHexEnter={hexEnter}
					onHexLeave={hexLeave}
					onHexClick={hexClick}
					displayIndex={displayIndex}
					preventHexHover={preventHexHover}
				/>
			</g>
		</>
	);
};

export { HexGrid,AlchHexGrid };
