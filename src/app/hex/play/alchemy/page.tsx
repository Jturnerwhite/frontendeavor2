'use client'
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from 'next/navigation'
import { RootState } from "@/store/store";
import HexGrid from '@/app/hex/play/components/hexGrid';
import { HexTile, Position } from '@/app/hex/architecture/interfaces';
import { ALCH_ELEMENT, SHAPE_NAME, ITEM_TAG } from '@/app/hex/architecture/enums';
import { IngedientBases} from '@/app/hex/architecture/data/ingedientBases';
import * as Helpers from '@/app/hex/architecture/helpers';
import {AlchComponentDisplay, PlaceableAlchComponent} from '@/app/hex/play/components/alchComponent';
import AlchemyStoreSlice from '@/store/features/alchemySlice';
import { AlchComponent } from '@/app/hex/architecture/typings';	

export default function Page() {
	const dispatch = useDispatch();
	const params = useSearchParams();
	const playGrid = useSelector((state: RootState) => state.Alchemy.playGrid);

	const testLayers = 6;
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
		shape: SHAPE_NAME.CLAW,
		linkSpots: [0, 0, 0, 0, 0, 0, 0],
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

	useEffect(() => {
		if (playGrid === undefined) {
			dispatch(AlchemyStoreSlice.actions.setPlayGrid({ pos: { x:0, y:0 }, size, layers: testLayers }));
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

	useEffect(() => {
		const interval = setInterval(() => {
			setRotation(prev => prev + 60);
		}, 2000);

		return () => clearInterval(interval);
	}, []);

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
			<svg width={windowSize.width} height={windowSize.height} style={{ position: "absolute" }}>
				<g transform={`translate(${gridCenter.x} ${gridCenter.y})`}>
					<HexGrid hexMap={playGrid} radius={size} />
				</g>
				<AlchComponentDisplay alchData={alchData} position={gridCenter} size={alchCompSize} rotation={rotation} />
			</svg>
		</>}
		<svg width="800" height="800" style={{ position: "absolute", top: "400px" }}>
			<HexGrid hexMap={Helpers.CreateHexGrid(gridCenter, size, 2)} radius={size} />
			<PlaceableAlchComponent alchData={staticAlcDataTest} position={gridCenter} size={alchCompSize} rotation={30} />
		</svg>
	</>;
}