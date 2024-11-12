'use client'
import type { AlchComponent } from '@/app/hex/architecture/typings';
import type { Position } from '@/app/hex/architecture/interfaces';
import { ALCH_ELEMENT, COMPONENT_SHAPE_VALUES } from '@/app/hex/architecture/enums';
import { AlchemicalElements } from '@/app/hex/architecture/data';
import type { AlchEleData } from '@/app/hex/architecture/data';
import * as Helpers from '@/app/hex/architecture/helpers';

interface NodeProps {
	index: number;
	position: Position;
	size: number;
	canLink: boolean;
	element: ALCH_ELEMENT;
}

const AlchNode: React.FC<NodeProps> = ({ index, position, size, canLink, element }): JSX.Element => {
	let strokeWidth = 2;
	if(size <= 20) {
		strokeWidth = 0;
	} else if(size <= 40) {
		strokeWidth = 2;
	} else if(size <= 60) {
		strokeWidth = 3;
	}

	if(canLink) {
		return (
			<>
				<polygon
					points={Helpers.GetStarPoints(position.x, position.y, size / 3)}
					fill={AlchemicalElements[element].colorHex}
					stroke="white"
					// stroke={AlchemicalElements[element].colorHex}
					// fill="none"
					strokeWidth={strokeWidth}
				/>
			</>
		);
	} else 
	{
		return (
			<>
				<circle
				cx={position.x}
				cy={position.y}
				r={size / 3}
				fill={AlchemicalElements[element].colorHex}
				stroke="white"
				//   stroke={AlchemicalElements[element].colorHex}
				//   fill="none"
				strokeWidth={strokeWidth}
				/>
				{/* <text 
				x={position.x} 
				y={position.y} 
				textAnchor="middle" 
				dominantBaseline="middle"
				fill="white" 
				fontSize={size / 3}>
					{index}
				</text> */}
			</>
		);
	}
}

interface CompProps {
	alchData: AlchComponent;
	position: Position;
	size: number;
}

const AlchComponentDisplay: React.FC<CompProps> = ({alchData, position, size}): JSX.Element => {
	const nodeComps = [];
	const lines = [];
	const shapeValue = COMPONENT_SHAPE_VALUES[alchData.shape];

	const getLine = (key:string, pos:Position, nextPos:Position):JSX.Element => {
		return <line 
			key={key} 
			x1={pos.x} 
			y1={pos.y} 
			x2={nextPos.x} 
			y2={nextPos.y} 
			stroke={AlchemicalElements[alchData.element].colorHex} 
			strokeWidth={size/6} />;
	}

	// draw each node
	for(let i = 0; i < shapeValue.length; i++) {
		if(shapeValue[i]) {
			const nodePos:Position = Helpers.GetHexPointPos(i, position.x, position.y, size);
			nodeComps.push(
				<AlchNode key={`${position.x}-${position.y}-node-${i}`} index={i} position={nodePos} size={size} canLink={alchData.linkSpots?.[i] === 1} element={alchData.element} />
			);
		}
	}

	if(size > 20) {
		// draw lines between adjacent nodes
		for(let i = 1; i < shapeValue.length; i++) {
			if(i === 6 && shapeValue[i] && shapeValue[1]) {
				const nodePos:Position = Helpers.GetHexPointPos(i, position.x, position.y, size);
				const nextPos:Position = Helpers.GetHexPointPos(1, position.x, position.y, size);
				lines.push(
					getLine(`${position.x}-${position.y}-line-${lines.length}`, nodePos, nextPos)
				);
			}
			// if both nodes are present, draw a line between them
			if(shapeValue[i]) {
				if(shapeValue[0]) {
					const nodePos:Position = Helpers.GetHexPointPos(i, position.x, position.y, size);
					const nextPos:Position = Helpers.GetHexPointPos(0, position.x, position.y, size);
					lines.push(
						getLine(`${position.x}-${position.y}-line-${lines.length}`, nodePos, nextPos)
					);
				}
				if(shapeValue[i + 1]) {
					const nodePos:Position = Helpers.GetHexPointPos(i, position.x, position.y, size);
					const nextPos:Position = Helpers.GetHexPointPos(i + 1, position.x, position.y, size);
					lines.push(
						getLine(`${position.x}-${position.y}-line-${lines.length}`, nodePos, nextPos)
					);
				}
			}
		}
	}

	return <>
		{lines}
		{nodeComps}
	</>;
}

export default AlchComponentDisplay;