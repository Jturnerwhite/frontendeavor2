'use client'
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from 'next/navigation'
import { RootState } from "@/store/store";
import AlchemyStoreSlice from '@/store/features/alchemySlice';
import { AlchComponent } from '@/app/hex/architecture/typings';	
import { AlchHexGrid } from '@/app/hex/sharedComponents/hex/hexGrid';
import { HexTile, Position } from '@/app/hex/architecture/interfaces';
import { ALCH_ELEMENT, SHAPE_NAME, ITEM_TAG } from '@/app/hex/architecture/enums';
import * as Helpers from '@/app/hex/architecture/helpers/alchHelpers';
import {AlchComponentDisplay, PlaceableAlchComponent} from '@/app/hex/sharedComponents/alchComponent';
import ComponentCursorGhost from '@/app/hex/play/components/compCursorGhost';

export default function Page() {
	const dispatch = useDispatch();
	const params = useSearchParams();
	const playGrid = useSelector((state: RootState) => state.Alchemy.playGrid);
	const placedComponents = useSelector((state: RootState) => state.Alchemy.placedComponents);
	const cursorState = useSelector((state: RootState) => state.Alchemy.cursor);

	const gridLayers = 6;
	const size = 20;
	const alchCompSize = 2 * Helpers.GetApothem(size);

	const [rotation, setRotation] = useState(30);
	const [alchData, setAlchData] = useState({
		shapeId: 0,
		shape: SHAPE_NAME.DOT,
		linkSpots: [0, 0, 0, 0, 0, 0, 0],
		elementId: 0,
		element: ALCH_ELEMENT.EARTH
	});
	const staticAlcDataTest = {
		shape: SHAPE_NAME.CIRCLE,
		linkSpots: [0, 1, 0, 0, 0, 0, 0],
		element: ALCH_ELEMENT.EARTH
	} as AlchComponent;

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

	// Test Code to rotate alch data
	useEffect(() => {
		const interval = setInterval(() => {
			setRotation(prev => prev + 60);
		}, 2000);

		return () => clearInterval(interval);
	}, []);

	// Test data to cycle through all shapes and elements
	useEffect(() => {
		const interval = setInterval(() => {
			// cycle through all shapes and elements
			setAlchData(prev => {
				let newShapeId = prev.shapeId;
				if (prev.shapeId === Object.keys(SHAPE_NAME).length - 1) {
					newShapeId = 0;
				} else {
					newShapeId = prev.shapeId + 1;
				}
				let newElementId = prev.elementId;
				if (prev.elementId === Object.keys(ALCH_ELEMENT).length - 1) {
					newElementId = 0;
				} else {
					newElementId = prev.elementId + 1;
				}
				let randomLinkNode = Math.floor(Math.random() * 7);
				let newLinkSpots = [0, 0, 0, 0, 0, 0, 0];
				newLinkSpots[randomLinkNode] = 1;
				return {
					shapeId: newShapeId,
					shape: Object.values(SHAPE_NAME)[newShapeId],
					linkSpots: newLinkSpots,
					elementId: newElementId,
					element: Object.values(ALCH_ELEMENT)[newElementId],
				}
			});
		}, 500);

		return () => clearInterval(interval);
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
					<AlchHexGrid 
						hexMap={playGrid} 
						radius={size} 
						onHexClick={hexClick}
						displayIndex={true} 
						preventHexHover={false} 
						preventHexPlacementHover={true}
						placementCursor={cursorState}
					/>
					{/* <AlchComponentDisplay alchData={alchData} position={{x: 0, y:0}} size={alchCompSize} rotation={rotation} /> */}
					{renderPlacedComponents()}
				</g>
			</svg>
		</>}
		<svg width={windowSize.width} height="600" style={{  }}>
			<g transform={`translate(0 -300)`}>
				<AlchHexGrid hexMap={Helpers.CreateHexGrid(gridCenter, size, 2)} radius={size}  displayIndex={true} preventHexHover={true} preventHexPlacementHover={true}	/>
				<PlaceableAlchComponent
					alchData={staticAlcDataTest}
					position={gridCenter}
					size={alchCompSize}
					rotation={0}
					onPickComponent={(comp) =>
						dispatch(AlchemyStoreSlice.actions.setCursorComponent(comp))
					}
				/>
			</g>
		</svg>
		<ComponentCursorGhost displaySize={30} />
	</>;
}