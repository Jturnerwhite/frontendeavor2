import { useEffect, useState } from "react";
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
	const waveFidelity = 120;
	const waveSpeed = 100;
	const waveAmplitude = 4;
	useEffect(() => {
		const interval = setInterval(() => {
			setCounter((prev: number) => {
				return (prev > waveFidelity) ? 0 : prev + 1
			});
		}, waveSpeed)

		return () => clearInterval(interval);
	}, []);

	const { x, y } = { x: 0, y: 0 };
	const mapFogRadius = ((radiusBase * 2.4) * (mapFogLayers)); // (GetApothem(radiusBase) * 2 * mapFogLayers) + (radiusBase / 2);
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
			<path
				className="map-fog-path"
				transform="rotate(30)"
				d={fogPathD}
				strokeWidth={50}
			/>
			<path
				className="map-storm-1"
				transform={`rotate(${(counter % 60) * 3})`}
				d={fogPathD}
				strokeWidth={18}
			/>
			<path
				className="map-storm-2"
				transform={`rotate(${(counter % 60) * 2})`}
				d={fogPathD}
				strokeWidth={22}
			/>
		</g>
	)
}

export default MapFog;