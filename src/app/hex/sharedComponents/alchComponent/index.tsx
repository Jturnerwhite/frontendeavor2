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
	rotation: number;
	size: number;
	canLink: boolean;
	element: ALCH_ELEMENT;
	placed: boolean;
}

const AlchNode: React.FC<NodeProps> = ({
	index,
	position,
	rotation,
	size,
	canLink,
	element,
	placed = false,
}): JSX.Element => {
	const ICON_SIZE = size / 2.0;
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

	let hexSize = size;
	if(size > 40) {
		hexSize = size / 2.5;
	} else {
		hexSize = size / 2;
	}

	let elemClass = element.replace(/\s+/g, '-').toLowerCase();
	const starPoints = SVGHelpers.GetHexStarPoints({x:0, y:0}, hexSize);
	const hexPoints:string = SVGHelpers.GetHexPoints({x:0, y:0}, hexSize);
	const borderFillPoints:string = SVGHelpers.GetHexPoints({x:0, y:0}, hexSize);

	const useHex = true;// size < 40;
	const showImage = size > 25;

	const r = size / 3;

	function getNodeShape():JSX.Element {
		if(canLink) {
			return (<g>
				{size < 25 && (
					<polygon
						className={'border-fill'}
						points={borderFillPoints}
						strokeWidth={strokeWidth}
					/>
				)}
				<polygon
					className={'node ' + elemClass}
					points={starPoints}
					strokeWidth={strokeWidth}
				/>
				<polygon className="node-sheen" points={starPoints} strokeWidth={strokeWidth} />
			</g>);
		} else if(useHex) {
			return (<>
				<polygon
					className={'node ' + elemClass}
					points={hexPoints}
					strokeWidth={strokeWidth}
				/>
				<polygon className="node-sheen" points={hexPoints} strokeWidth={strokeWidth} />
			</>);
		} else {
			return (<>
				<circle
					className={'node ' + elemClass}
					cx={0}
					cy={0}
					r={r}
					strokeWidth={strokeWidth}
				/>
				<circle className="node-sheen" cx={0} cy={0} r={r} strokeWidth={strokeWidth} />
			</>);
		}
	}

	function getImage():JSX.Element {
		return (<>
			<image
				href={`/icons/elements/${element.toLowerCase()}.svg`}
				x={-(ICON_SIZE / 2)}
				y={-(ICON_SIZE / 2)}
				width={ICON_SIZE}
				height={ICON_SIZE}
				style={{ filter: `brightness(0) invert(1)`}}
			/>
		</>);

	}

	return (
		<g className={placed ? 'placed' : undefined} transform={`translate(${position.x}, ${position.y}) rotate(${-(rotation * 60)} ${0} ${0})`}>
			{getNodeShape()}
			{showImage && getImage()}
		</g>
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
	let ringR = size;
	const nodeComps = [];
	const lines = [];
	const shapeValue = COMPONENT_SHAPE_VALUES[alchData.shape];

	if(size > 40) {
		ringR = size - 0.5;
	}

	for (let i = 0; i < shapeValue.length; i++) {
		if (shapeValue[i]) {
			const nodePos: Position = SVGHelpers.GetHexPointPos(i, position.x, position.y, ringR);
			nodeComps.push(
				<AlchNode
					key={`${position.x}-${position.y}-node-${i}`}
					index={i}
					position={nodePos}
					rotation={rotation}
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
				const nodePos: Position = SVGHelpers.GetHexPointPos(i, position.x, position.y, ringR);
				const nextPos: Position = SVGHelpers.GetHexPointPos(1, position.x, position.y, ringR);
				lines.push(SVGHelpers.GetSVGLine(`${position.x}-${position.y}-line-${lines.length}`, alchData.element, nodePos, nextPos, "white", size));
			}
			if (shapeValue[i]) {
				if (shapeValue[0]) {
					const nodePos: Position = SVGHelpers.GetHexPointPos(i, position.x, position.y, ringR);
					const nextPos: Position = SVGHelpers.GetHexPointPos(0, position.x, position.y, ringR);
					lines.push(SVGHelpers.GetSVGLine(`${position.x}-${position.y}-line-${lines.length}`, alchData.element, nodePos, nextPos, "white", size));
				}
				if (shapeValue[i + 1]) {
					const nodePos: Position = SVGHelpers.GetHexPointPos(i, position.x, position.y, ringR);
					const nextPos: Position = SVGHelpers.GetHexPointPos(i + 1, position.x, position.y, ringR,);
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
