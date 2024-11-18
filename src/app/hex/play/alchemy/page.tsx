'use client'
import { useSearchParams } from 'next/navigation'
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import HexGrid from '@/app/hex/play/components/hexGrid';
import { useEffect, useState } from 'react';
import { HexTile, Position } from '@/app/hex/architecture/interfaces';
import { ALCH_ELEMENT, SHAPE_NAME, ITEM_TAG } from '@/app/hex/architecture/enums';
import * as Helpers from '@/app/hex/architecture/helpers';
import AlchComponentDisplay from '@/app/hex/play/components/alchComponent';
import AlchemyStoreSlice from '@/store/features/alchemySlice';

export default function Page() {
	const dispatch = useDispatch();
	const params = useSearchParams();
	const playGrid = useSelector((state: RootState) => state.Alchemy.playGrid);

	const testPos = {x: 400, y: 400};
	const testLayers = 6;
	const size = 30;
	const [rotation, setRotation] = useState(30);
	const alchCompSize = 2 * Helpers.GetApothem(size);
	const [alchData, setAlchData] = useState({
		shapeId: 0,
		shape: SHAPE_NAME.DOT,
		linkSpots: [0, 0, 0, 0, 0, 0, 0],
		elementId: 0,
		element: ALCH_ELEMENT.EARTH
	});

    useEffect(() => {
		if(playGrid === undefined) {
			dispatch(AlchemyStoreSlice.actions.setPlayGrid({pos:testPos, size, layers:testLayers}));
		}
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(prev => prev + 60);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
			setAlchData(prev => {
				let newShapeId = prev.shapeId;
				if(prev.shapeId === Object.keys(SHAPE_NAME).length - 1) {
					newShapeId = 0;
				} else {
					newShapeId = prev.shapeId + 1;
				}
				let newElementId = prev.elementId;
				if(prev.elementId === Object.keys(ALCH_ELEMENT).length - 1) {
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
		<h1>~/hex/play/alchemy/</h1>
		{playGrid &&
			<svg width="800" height="800" style={{ position: "absolute" }}>
				<HexGrid hexMap={playGrid} radius={size}/>
			</svg>
		}
		<svg width="800" height="800" style={{ position: "absolute" }}>
			<g transform={`rotate(${rotation} ${testPos.x} ${testPos.y})`}>
                <AlchComponentDisplay alchData={alchData} position={testPos} size={alchCompSize}/>
            </g>
		</svg>
	</>;
}