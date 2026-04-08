'use client';

/**
 * Single document-wide defs so `fill: url(#alch-node-sheen)` resolves from any SVG subtree.
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
			</defs>
		</svg>
	);
}
