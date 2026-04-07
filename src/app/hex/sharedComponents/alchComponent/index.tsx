'use client';
import type { AlchComponent } from '@/app/hex/architecture/typings';
import type { Position } from '@/app/hex/architecture/interfaces';
import { ALCH_ELEMENT, COMPONENT_SHAPE_VALUES } from '@/app/hex/architecture/enums';
import { AlchemicalElements } from '@/app/hex/architecture/data/elements';
import * as Helpers from '@/app/hex/architecture/helpers';
import { useDispatch } from 'react-redux';
import AlchemyStoreSlice from '@/store/features/alchemySlice';
import './alchComponent.css';

interface NodeProps {
	index: number;
	position: Position;
	size: number;
	canLink: boolean;
	element: ALCH_ELEMENT;
	placed: boolean;
}

const AlchNode: React.FC<NodeProps> = ({
	index,
	position,
	size,
	canLink,
	element,
	placed = false,
}): JSX.Element => {
	let strokeWidth = 2;
	if (size <= 20) {
		strokeWidth = 0;
	} else if (size <= 40) {
		strokeWidth = 2;
	} else if (size <= 60) {
		strokeWidth = 3;
	}

	if (canLink) {
		return (
			<polygon
				className={"node " + element.replace(/\s+/g, "-").toLowerCase()}
				points={Helpers.GetStarPoints(position.x, position.y, size / 3)}
				fill={"white"}
				stroke={"white"}
				strokeWidth={strokeWidth}
			/>
		);
	}

	return (
		<circle
			className={"node " + element.replace(/\s+/g, "-").toLowerCase()}
			cx={position.x}
			cy={position.y}
			r={size / 3}
			fill={"white"}
			stroke={"white"}
			strokeWidth={strokeWidth}
		/>
	);
};

interface CompProps {
	alchData: AlchComponent;
	position: Position;
	size: number;
	rotation: number;
	placed?: boolean;
}

const AlchComponentDisplay: React.FC<CompProps> = ({
	alchData,
	position,
	size,
	rotation,
	placed = false,
}): JSX.Element => {
	const nodeComps = [];
	const lines = [];
	const shapeValue = COMPONENT_SHAPE_VALUES[alchData.shape];

	for (let i = 0; i < shapeValue.length; i++) {
		if (shapeValue[i]) {
			const nodePos: Position = Helpers.GetHexPointPos(i, position.x, position.y, size);
			nodeComps.push(
				<AlchNode
					key={`${position.x}-${position.y}-node-${i}`}
					index={i}
					position={nodePos}
					size={size}
					canLink={alchData.linkSpots?.[i] === 1}
					element={alchData.element}
					placed={placed ?? false}
				/>
			);
		}
	}

	if (size > 20) {
		for (let i = 1; i < shapeValue.length; i++) {
			if (i === 6 && shapeValue[i] && shapeValue[1]) {
				const nodePos: Position = Helpers.GetHexPointPos(i, position.x, position.y, size);
				const nextPos: Position = Helpers.GetHexPointPos(1, position.x, position.y, size);
				lines.push(Helpers.GetSVGLine(`${position.x}-${position.y}-line-${lines.length}`, alchData.element, nodePos, nextPos, "white", size));
			}
			if (shapeValue[i]) {
				if (shapeValue[0]) {
					const nodePos: Position = Helpers.GetHexPointPos(i, position.x, position.y, size);
					const nextPos: Position = Helpers.GetHexPointPos(0, position.x, position.y, size);
					lines.push(Helpers.GetSVGLine(`${position.x}-${position.y}-line-${lines.length}`, alchData.element, nodePos, nextPos, "white", size));
				}
				if (shapeValue[i + 1]) {
					const nodePos: Position = Helpers.GetHexPointPos(i, position.x, position.y, size);
					const nextPos: Position = Helpers.GetHexPointPos(i + 1, position.x, position.y, size);
					lines.push(Helpers.GetSVGLine(`${position.x}-${position.y}-line-${lines.length}`, alchData.element, nodePos, nextPos, "white", size));
				}
			}
		}
	}
	return (
		<g transform={`rotate(${rotation * 60} ${position.x} ${position.y})`}>
			{lines}
			{nodeComps}
		</g>
	);
};

const PlaceableAlchComponent: React.FC<CompProps> = ({
	alchData,
	position,
	size,
	rotation,
	placed = false,
}): JSX.Element => {
	const dispatch = useDispatch();
	const handleClick = () => {
		if (placed) return;
		dispatch(AlchemyStoreSlice.actions.setCursorComponent(alchData));
	};
	return (
		<g>
			<AlchComponentDisplay
				alchData={alchData}
				position={position}
				size={size}
				rotation={rotation}
				placed={placed}
			/>
			<rect
				className="hitArea"
				x={position.x - (size * 3.25) / 2}
				y={position.y - (size * 3.25) / 2}
				width={size * 3.25}
				height={size * 3.25}
				fill="transparent"
				onClick={handleClick}
			/>
		</g>
	);
};

export { AlchComponentDisplay, PlaceableAlchComponent };
