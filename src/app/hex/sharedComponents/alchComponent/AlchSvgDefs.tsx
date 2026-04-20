'use client';

import {
	AlchemicalElements,
	getAlchElementPatternId,
} from '@/app/hex/architecture/data/elements';
import { publicAsset } from '@/lib/publicAsset';

const ELEMENT_PATTERN_TILE = 32;

/** `fill="url(#alch-radial-white-rose)"` — CSS-equivalent: radial-gradient(circle, transparent white 0%, #ff6e6e 100%). */
export const ALCH_RADIAL_WHITE_ROSE_GRADIENT_ID = 'alch-radial-white-rose';

/** `fill="url(#alch-pattern-radial-white-rose)"` — pattern tile wrapping the same radial (objectBoundingBox 1×1). */
export const ALCH_PATTERN_RADIAL_WHITE_ROSE_ID = 'alch-pattern-radial-white-rose';

/**
 * Single document-wide defs so `fill: url(#alch-node-sheen)`, radial/pattern fills, and element patterns resolve from any SVG subtree.
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
				<radialGradient
					id={ALCH_RADIAL_WHITE_ROSE_GRADIENT_ID}
					gradientUnits="objectBoundingBox"
					cx="0.5"
					cy="0.5"
					r="0.5"
				>
					<stop offset="0%" stopColor="#ffffff" stopOpacity={0} />
					<stop offset="100%" stopColor="#ff6e6e" stopOpacity={1} />
				</radialGradient>
				<pattern
					id={ALCH_PATTERN_RADIAL_WHITE_ROSE_ID}
					width={1}
					height={1}
					patternUnits="objectBoundingBox"
				>
					<rect width={1} height={1} fill={`url(#${ALCH_RADIAL_WHITE_ROSE_GRADIENT_ID})`} />
				</pattern>
				{Object.values(AlchemicalElements).map((el) => (
					<pattern
						key={el.id}
						id={getAlchElementPatternId(el.type)}
						patternUnits="userSpaceOnUse"
						width={ELEMENT_PATTERN_TILE}
						height={ELEMENT_PATTERN_TILE}
					>
						<image
							href={publicAsset(`/icons/elements/${el.type.toLowerCase()}.svg`)}
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
