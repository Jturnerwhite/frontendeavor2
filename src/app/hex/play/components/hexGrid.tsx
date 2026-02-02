'use client'
import { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Hex from '@/app/hex/play/components/hex';
import { Position, HexTile, HexMap } from '@/app/hex/architecture/interfaces';
import * as Helpers from '@/app/hex/architecture/helpers';
import {AlchComponentDisplay, PlaceableAlchComponent} from '@/app/hex/play/components/alchComponent';

interface HexGridProps {
	hexMap: HexMap;
	radius: number;
	displayIndex?: boolean;
	preventHexHover?: boolean;
}

const HexGrid: React.FC<HexGridProps> = ({ hexMap, radius, displayIndex = false, preventHexHover = false }): JSX.Element => {
	const cursorState = useSelector((state: RootState) => state.Alchemy.cursor);
	const alchCompSize = 2 * Helpers.GetApothem(radius);

	let [previewPosition, setPreviewPosition] = useState<Position|null>(null);

	function hexEnter(hex: HexTile) {
		console.log("Hex Entered:", hex.id);
		if(cursorState.isPlacing) {
			setPreviewPosition(hex.position);
		}
	}
	function hexLeave() {

	}
	function hexClick() {
		if(cursorState.isPlacing) {
			// Place component logic
		}
	}

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
					preventHover={preventHexHover||!cursorState.isPlacing}/>
				);
			})}
			{cursorState.isPlacing && cursorState.selectedComponent && previewPosition !== null &&
				<AlchComponentDisplay 
					alchData={cursorState.selectedComponent} 
					position={previewPosition} 
					size={alchCompSize} 
					rotation={cursorState.rotation}/>
			}
		</>
	);
}

export default HexGrid;