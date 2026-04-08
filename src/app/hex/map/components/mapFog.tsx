import { useEffect, useId, useState } from "react";
import { HexMap } from "../../architecture/interfaces";

interface MapFogProps {
	hexMap: HexMap;
	radiusBase: number;
	currentLayers: number;
	mapFogLayers: number;
}

const MapFog: React.FC<MapFogProps> = ({
	hexMap,
	radiusBase,
	currentLayers,
	mapFogLayers,
}) => {
	const [counter, setCounter] = useState(0); //used for flipping between possible shapes
	const waveFidelity = 100;
	const waveSpeed = 100;
	const waveAmplitude = 8;
	const fogFillGradientId = useId().replace(/:/g, "");
	useEffect(() => {
		const interval = setInterval(() => {
			setCounter((prev: number) => {
				return (prev > waveFidelity) ? 0 : prev + 1
			});
		}, waveSpeed)

		return () => clearInterval(interval);
	}, []);

	const { x, y } = { x: 0, y: 0 };
	const mapFogRadius = (radiusBase * (mapFogLayers + 2.5)); // (GetApothem(radiusBase) * 2 * mapFogLayers) + (radiusBase / 2);
	let fogCorners: [number, number][] = [
		[x + mapFogRadius, y],
		[x + mapFogRadius * Math.cos(Math.PI / 3), y + mapFogRadius * Math.sin(Math.PI / 3)],
		[x + mapFogRadius * Math.cos((2 * Math.PI) / 3), y + mapFogRadius * Math.sin((2 * Math.PI) / 3)],
		[x - mapFogRadius, y],
		[x + mapFogRadius * Math.cos((4 * Math.PI) / 3), y + mapFogRadius * Math.sin((4 * Math.PI) / 3)],
		[x + mapFogRadius * Math.cos((5 * Math.PI) / 3), y + mapFogRadius * Math.sin((5 * Math.PI) / 3)],
	];

	fogCorners = fogCorners.map((corner, index) => {
		if(index % 2 === 0) {
			return [corner[0] + (Math.cos(counter) * waveAmplitude), corner[1] + (Math.sin(counter) * waveAmplitude)];
		} else {
			return [corner[0] - (Math.cos(counter) * waveAmplitude), corner[1] - (Math.sin(counter) * waveAmplitude)];
		}
	});

	const fogPathD =
		`M ${fogCorners[0][0]},${fogCorners[0][1]}` +
		fogCorners.slice(1).map((p) => ` L ${p[0]},${p[1]}`).join('') +
		' Z';

	return (
		<g className="map-fog-container">
			<defs>
				<radialGradient
					id={fogFillGradientId}
					cx="50%"
					cy="50%"
					r="50%"
					fx="50%"
					fy="50%"
					gradientUnits="objectBoundingBox"
				>
					<stop offset="0%" stopColor="#000000" stopOpacity="0" />
					<stop offset="70%" stopColor="#000000" stopOpacity="0" />
					<stop offset="80%" stopColor="#000000" stopOpacity="1" />
					<stop offset="100%" stopColor="#000000" stopOpacity="1" />
				</radialGradient>
			</defs>
			<path
				d={fogPathD}
				stroke="black"
				strokeWidth={50}
				fill={`url(#${fogFillGradientId})`}
			/>
		</g>
	)
}

export default MapFog;