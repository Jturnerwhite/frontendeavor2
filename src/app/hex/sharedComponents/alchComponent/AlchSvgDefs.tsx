'use client';

import {
	AlchemicalElements,
	getAlchElementPatternId,
} from '@/app/hex/architecture/data/elements';

const ELEMENT_PATTERN_TILE = 32;

/**
 * Single document-wide defs so `fill: url(#alch-node-sheen)` and element patterns resolve from any SVG subtree.
 * Mount once (e.g. in root layout).
 */
export function AlchSvgDefs() {
	return (
		<svg
			aria-hidden
			className="alch-svg-defs"
			width={0}
			height={0}
			style={{ position: 'absolute', overflow: 'hidden' }}
		>
			<defs>
				<linearGradient
					id="alch-node-sheen"
					gradientUnits="objectBoundingBox"
					x1="0"
					y1="0"
					x2="1"
					y2="1"
				>
					<stop offset="0%" stopColor="#ffffff" stopOpacity={1} />
					<stop offset="50%" stopColor="#ffffff" stopOpacity={0} />
				</linearGradient>
				{Object.values(AlchemicalElements).map((el) => (
					<pattern
						key={el.id}
						id={getAlchElementPatternId(el.type)}
						patternUnits="userSpaceOnUse"
						width={ELEMENT_PATTERN_TILE}
						height={ELEMENT_PATTERN_TILE}
					>
						<image
							href={`/icons/elements/${el.type.toLowerCase()}.svg`}
							width={ELEMENT_PATTERN_TILE}
							height={ELEMENT_PATTERN_TILE}
							preserveAspectRatio="xMidYMid meet"
						/>
					</pattern>
				))}
			</defs>
		</svg>
	);
}
