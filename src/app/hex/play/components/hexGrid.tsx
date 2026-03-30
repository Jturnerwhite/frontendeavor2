'use client'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Hex from '@/app/hex/play/components/hex';
import { Position, HexTile, HexMap } from '@/app/hex/architecture/interfaces';
import * as Helpers from '@/app/hex/architecture/helpers';
import { COMPONENT_SHAPE_VALUES } from '@/app/hex/architecture/enums';
import { AlchComponentDisplay } from '@/app/hex/play/components/alchComponent';
import AlchemyStoreSlice from '@/store/features/alchemySlice';

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

const PREVIEW_ROTATION_BASE = 30;

const HexGrid: React.FC<HexGridProps> = ({ hexMap, radius, onHexEnter, onHexLeave, onHexClick, displayIndex = false, preventHexHover = false, preventHexPlacementHover = false }): JSX.Element => {
	const dispatch = useDispatch();
	const cursorState = useSelector((state: RootState) => state.Alchemy.cursor);
	const [hexHovered, setHexHovered] = useState<HexTile|null>(null);
	const [validTileHover, setValidTileHover] = useState<boolean | undefined>();

	const alchCompSize = 2 * Helpers.GetApothem(radius);

	let [previewPosition, setPreviewPosition] = useState<Position|null>(null);

	function calcIsValidHover(hex: HexTile|null) {
		if(!hex) return;
		if(cursorState.isPlacing && cursorState.selectedComponent) {
			setPreviewPosition(hex.position);
	
			const shapeMask = COMPONENT_SHAPE_VALUES[cursorState.selectedComponent.shape];
			const hexIds = Helpers.GetPlacementHexIds(
				hex,
				shapeMask,
				cursorState.rotation,
				hexMap
			);
	
			if(!hexIds || (!hexIds.every((id) => !hexMap[id].occupied))) {
				setValidTileHover(false);
			} else {
				setValidTileHover(true);
			}
		}
	}

	function hexEnter(hex: HexTile) {
		setHexHovered(hex);
		if(onHexEnter)
			onHexEnter(hex, validTileHover);
	}
	function hexLeave() {
		if(onHexLeave)
			onHexLeave(hexHovered);
	}
	function hexClick(clickedHex: HexTile) {
		if (!cursorState.isPlacing || !cursorState.selectedComponent) return;
		if(onHexClick)
			onHexClick(clickedHex, validTileHover);
	}

	useEffect(() => {
		calcIsValidHover(hexHovered);
	}, [cursorState.rotation, hexHovered]);

	return (
		<>
			{Object.keys(hexMap).map((id) => {
				const hex = hexMap[id];
				return (<Hex 
					key={hex.id} 
					hexData={hex} 
					radius={radius} 
					onEnter={hexEnter}
					onLeave={hexLeave}
					onHexClick={hexClick}
					displayIndex={displayIndex}
					preventHover={preventHexHover||!cursorState.isPlacing}
					isValidHover={validTileHover}/>
				);
			})}
			{cursorState.isPlacing && cursorState.selectedComponent && previewPosition !== null && !preventHexPlacementHover &&
				<AlchComponentDisplay 
					alchData={cursorState.selectedComponent} 
					position={previewPosition} 
					size={alchCompSize} 
					rotation={PREVIEW_ROTATION_BASE + cursorState.rotation * 60}/>
			}
		</>
	);
}

export default HexGrid;