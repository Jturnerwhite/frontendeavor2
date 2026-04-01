'use client';
import type { AlchComponent } from '@/app/hex/architecture/typings';
import type { Position } from '@/app/hex/architecture/interfaces';
import { ALCH_ELEMENT, COMPONENT_SHAPE_VALUES } from '@/app/hex/architecture/enums';
import { AlchemicalElements } from '@/app/hex/architecture/data/elements';
import * as Helpers from '@/app/hex/architecture/helpers';
import { useDispatch } from 'react-redux';
import AlchemyStoreSlice from '@/store/features/alchemySlice';
import styles from './alchComponent.module.css';

/** Fill/stroke when a component is already placed on the grid */
const PLACED_NODE_FILL = '#7d7d7d';
const PLACED_NODE_STROKE = '#a3a3a3';
const PLACED_LINE_STROKE = '#6e6e6e';

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

	const colorHex = AlchemicalElements[element].colorHex;
	const fill = placed ? PLACED_NODE_FILL : colorHex;
	const stroke = placed ? PLACED_NODE_STROKE : 'white';

	if (canLink) {
		return (
			<polygon
				className={styles.node}
				points={Helpers.GetStarPoints(position.x, position.y, size / 3)}
				fill={fill}
				stroke={stroke}
				strokeWidth={strokeWidth}
			/>
		);
	}

	return (
		<circle
			className={styles.node}
			cx={position.x}
			cy={position.y}
			r={size / 3}
			fill={fill}
			stroke={stroke}
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
	const colorHex = AlchemicalElements[alchData.element].colorHex;
	const lineStroke = placed ? PLACED_LINE_STROKE : colorHex;

	const getLine = (key: string, pos: Position, nextPos: Position): JSX.Element => (
		<line
			key={key}
			className={styles.line}
			x1={pos.x}
			y1={pos.y}
			x2={nextPos.x}
			y2={nextPos.y}
			stroke={lineStroke}
			strokeWidth={size / 3}
		/>
	);

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
				lines.push(getLine(`${position.x}-${position.y}-line-${lines.length}`, nodePos, nextPos));
			}
			if (shapeValue[i]) {
				if (shapeValue[0]) {
					const nodePos: Position = Helpers.GetHexPointPos(i, position.x, position.y, size);
					const nextPos: Position = Helpers.GetHexPointPos(0, position.x, position.y, size);
					lines.push(getLine(`${position.x}-${position.y}-line-${lines.length}`, nodePos, nextPos));
				}
				if (shapeValue[i + 1]) {
					const nodePos: Position = Helpers.GetHexPointPos(i, position.x, position.y, size);
					const nextPos: Position = Helpers.GetHexPointPos(i + 1, position.x, position.y, size);
					lines.push(getLine(`${position.x}-${position.y}-line-${lines.length}`, nodePos, nextPos));
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
				className={styles.hitArea}
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
