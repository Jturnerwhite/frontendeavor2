'use client'

import HexGrid from '@/app/hex/test/components/hexGrid';
import type { AlchComponent } from '@/app/hex/architecture/typings';
import { ALCH_ELEMENT, SHAPE_NAME, ITEM_TAG } from '@/app/hex/architecture/enums'
import AlchComponentDisplay from '@/app/hex/test/components/alchComponent';
import * as Helpers from '@/app/hex/architecture/helpers';
import { useEffect, useState } from 'react';

export default function Page() {
	const testPos = {x: 400, y: 400};
	const size = 30;
	// const alchData:AlchComponent = {
	// 	shape: SHAPE_NAME.UMBRELLA,
	// 	linkSpots: [0, 0, 0, 0, 0, 0, 0],
	// 	element: ALCH_ELEMENT.FIRE
	// };
	const alchCompSize = 2 * Helpers.GetApothem(size);
	const [alchData, setAlchData] = useState({
		shapeId: 0,
		shape: SHAPE_NAME.DOT,
		linkSpots: [0, 0, 0, 0, 0, 0, 0],
		elementId: 0,
		element: ALCH_ELEMENT.EARTH
	});
	const [rotation, setRotation] = useState(30);

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
		<svg width="800" height="800" style={{ position: "absolute" }}>
			<HexGrid center={testPos} radius={size} layers={6}/>
		</svg>
		<svg width="800" height="800" style={{ position: "absolute" }}>
			<g transform={`rotate(${rotation} ${testPos.x} ${testPos.y})`}>
                <AlchComponentDisplay alchData={alchData} position={testPos} size={alchCompSize}/>
            </g>
		</svg>
		<svg width="800" height="800" style={{ position: "absolute", top: '400px' }}>
			<g>
				<HexGrid center={testPos} radius={10} layers={2}/>
			</g>
			<g transform={`rotate(${rotation} ${testPos.x} ${testPos.y})`}>
                <AlchComponentDisplay alchData={alchData} position={testPos} size={ 2 * Helpers.GetApothem(10)}/>
            </g>
		</svg>
	</>;
}