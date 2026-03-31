'use client'
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from 'next/navigation';
import { RootState } from "@/store/store";
import AlchemyStoreSlice from '@/store/features/alchemySlice';
import { AlchComponent } from '@/app/hex/architecture/typings';	
import HexGrid from '@/app/hex/play/components/hexGrid';
import { HexTile, Position } from '@/app/hex/architecture/interfaces';
import { ALCH_ELEMENT, SHAPE_NAME, ITEM_TAG } from '@/app/hex/architecture/enums';
import * as Helpers from '@/app/hex/architecture/helpers';
import {AlchComponentDisplay, PlaceableAlchComponent} from '@/app/hex/play/components/alchComponent';
import ComponentCursorGhost from '@/app/hex/play/components/cursor';

export default function Page() {
	const dispatch = useDispatch();
	const params = useSearchParams();
	const playGrid = useSelector((state: RootState) => state.Alchemy.playGrid);
	const placedComponents = useSelector((state: RootState) => state.Alchemy.placedComponents);
	const cursorState = useSelector((state: RootState) => state.Alchemy.cursor);

	const gridLayers = 6;
	const size = 20;
	const alchCompSize = 2 * Helpers.GetApothem(size);

	// To track window resize with React hooks
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight
	});
	const [gridCenter, setGridCenter] = useState({
		x: window.innerWidth / 2,
		y: window.innerHeight / 2
	} as Position);

	function hexClick(hex: HexTile, validTileHover: boolean) {
		if(!validTileHover) return;
		if(cursorState.isPlacing && cursorState.selectedComponent) {
			dispatch(AlchemyStoreSlice.actions.addPlacedComponent(hex));
		}
	}

	function renderPlacedComponents() {
		return placedComponents?.map((component, index) => {
			return <AlchComponentDisplay 
				key={"comp" + index} 
				alchData={component.comp} 
				position={component.position}
				size={alchCompSize} 
				rotation={component.rotation} />
		});
	}

	useEffect(() => {
		if (playGrid === undefined) {
			dispatch(AlchemyStoreSlice.actions.setPlayGrid({ pos: { x:0, y:0 }, size, layers: gridLayers }));
		}
	}, []);

	useEffect(() => {
		const handleResize = (event:any) => {
			console.log("Resizing", event);
			console.log("Resizing", window.innerWidth, window.innerHeight);
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight
			});
			setGridCenter({
				x: window.innerWidth / 2,
				y: window.innerHeight / 2
			});
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return <>
		{playGrid && <>
			<svg 
				width={windowSize.width} 
				height={600} 
				style={{pointerEvents:"none" }} 
				pointerEvents="none">
				<g 
					onContextMenu={(e:any) => e.preventDefault()}
					transform={`translate(${gridCenter.x} 300)`}>
					<HexGrid 
						hexMap={playGrid} 
						radius={size} 
						onHexClick={hexClick}
						displayIndex={true} 
						preventHexHover={false} 
						preventHexPlacementHover={true}
					/>
					{renderPlacedComponents()}
				</g>
			</svg>
		</>}
		{/*
		<svg width={windowSize.width} height="600" style={{  }}>
			<g transform={`translate(0 -300)`}>
				<HexGrid hexMap={Helpers.CreateHexGrid(gridCenter, size, 2)} radius={size}  displayIndex={true} preventHexHover={true} preventHexPlacementHover={true}	/>
				<PlaceableAlchComponent alchData={staticAlcDataTest} position={gridCenter} size={alchCompSize} rotation={0} />
			</g>
		</svg>
		*/}
		<ComponentCursorGhost />
	</>;
}