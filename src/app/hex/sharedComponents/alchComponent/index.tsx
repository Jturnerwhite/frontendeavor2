'use client';
import type { AlchComponent } from '@/app/hex/architecture/typings';
import type { Position } from '@/app/hex/architecture/interfaces';
import { ALCH_ELEMENT, COMPONENT_SHAPE_VALUES } from '@/app/hex/architecture/enums';
import * as SVGHelpers from '@/app/hex/architecture/helpers/svgHelpers';
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
	if(size <= 20) {
		strokeWidth = 0;
	} else if (size <= 25) {
		strokeWidth = 1;
	} else if (size <= 40) {
		strokeWidth = 1.5;
	} else if (size <= 60) {
		strokeWidth = 3;
	}

	function getHexPoints(radius: number): string {
		return [
			`${position.x + radius},${position.y}`,
			`${position.x + radius * Math.cos(Math.PI / 3)},${position.y + radius * Math.sin(Math.PI / 3)}`,
			`${position.x + radius * Math.cos((2 * Math.PI) / 3)},${position.y + radius * Math.sin((2 * Math.PI) / 3)}`,
			`${position.x - radius},${position.y}`,
			`${position.x + radius * Math.cos((4 * Math.PI) / 3)},${position.y + radius * Math.sin((4 * Math.PI) / 3)}`,
			`${position.x + radius * Math.cos((5 * Math.PI) / 3)},${position.y + radius * Math.sin((5 * Math.PI) / 3)}`,
		].join(' ');
	}

	const elemClass = element.replace(/\s+/g, '-').toLowerCase();
	const starPoints = SVGHelpers.GetStarPoints(position.x, position.y, size / 2.7);
	const hexPoints:string = getHexPoints(size / 2);
	const borderFillPoints:string = getHexPoints(size / 1.8);

	const useHex = size < 40;

	const r = size / 3;

	if (canLink) {
		return (
			<g className={placed ? 'placed' : undefined}>
				<polygon
					className={'border-fill'}
					points={borderFillPoints}
					strokeWidth={strokeWidth}
				/>
				<polygon
					className={'node ' + elemClass}
					points={starPoints}
					strokeWidth={strokeWidth}
				/>
				<polygon className="node-sheen" points={starPoints} strokeWidth={0} />
			</g>
		);
	}

	return (
		<g className={placed ? 'placed' : undefined}>
			{!useHex && (
				<>
				<circle
					className={'node ' + elemClass}
					cx={position.x}
					cy={position.y}
					r={r}
					strokeWidth={strokeWidth}
				/>
				<circle className="node-sheen" cx={position.x} cy={position.y} r={r} strokeWidth={strokeWidth} />
			</>)}
			{useHex && (
				<>
					<polygon
						className={'node ' + elemClass}
						points={hexPoints}
						strokeWidth={strokeWidth}
					/>
					<polygon className="node-sheen" points={hexPoints} strokeWidth={strokeWidth} />
				</>
			)}
		</g>
	);
};

interface CompProps {
	alchData: AlchComponent;
	position: Position;
	size: number;
	rotation: number;
	placed?: boolean;
	/**
	 * Hex tile circumradius R used by `CreateHexGrid` for this view. When set, peripheral
	 * node positions (1–6) use the same floored neighbor offsets as the grid, not a polar ring.
	 * Omit for standalone displays (e.g. cursor ghost) where `size` defines the ring radius.
	 */
	hexGridCircumradius?: number;
}

const AlchComponentDisplay: React.FC<CompProps> = ({
	alchData,
	position,
	size,
	rotation,
	placed = false,
	hexGridCircumradius,
}): JSX.Element => {
	const ringR = size;
	const nodeComps = [];
	const lines = [];
	const shapeValue = COMPONENT_SHAPE_VALUES[alchData.shape];

	for (let i = 0; i < shapeValue.length; i++) {
		if (shapeValue[i]) {
			const nodePos: Position = SVGHelpers.GetHexPointPos(i, position.x, position.y, ringR, hexGridCircumradius);
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

	if (size > 5) {
		for (let i = 1; i < shapeValue.length; i++) {
			if (i === 6 && shapeValue[i] && shapeValue[1]) {
				const nodePos: Position = SVGHelpers.GetHexPointPos(i, position.x, position.y, ringR, hexGridCircumradius);
				const nextPos: Position = SVGHelpers.GetHexPointPos(1, position.x, position.y, ringR, hexGridCircumradius);
				lines.push(SVGHelpers.GetSVGLine(`${position.x}-${position.y}-line-${lines.length}`, alchData.element, nodePos, nextPos, "white", size));
			}
			if (shapeValue[i]) {
				if (shapeValue[0]) {
					const nodePos: Position = SVGHelpers.GetHexPointPos(i, position.x, position.y, ringR, hexGridCircumradius);
					const nextPos: Position = SVGHelpers.GetHexPointPos(0, position.x, position.y, ringR, hexGridCircumradius);
					lines.push(SVGHelpers.GetSVGLine(`${position.x}-${position.y}-line-${lines.length}`, alchData.element, nodePos, nextPos, "white", size));
				}
				if (shapeValue[i + 1]) {
					const nodePos: Position = SVGHelpers.GetHexPointPos(i, position.x, position.y, ringR, hexGridCircumradius);
					const nextPos: Position = SVGHelpers.GetHexPointPos(i + 1, position.x, position.y, ringR, hexGridCircumradius);
					lines.push(SVGHelpers.GetSVGLine(`${position.x}-${position.y}-line-${lines.length}`, alchData.element, nodePos, nextPos, "white", size));
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
	hexGridCircumradius,
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
				hexGridCircumradius={hexGridCircumradius}
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
