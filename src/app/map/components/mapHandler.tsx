'use client'
import React from 'react';
import {
	APIProvider,
	Map,
	MapCameraChangedEvent,
} from '@vis.gl/react-google-maps';
import { Poi } from "@/types/mapTypings";
import { PoiMarkers } from './poiMarkers';

export const MapHandler = (props: { pois: Poi[] }) => {
	const cameraChange = (ev: MapCameraChangedEvent) => {
		console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom);
	}

	return <>
		<APIProvider apiKey={"AIzaSyDMewgwzKWX7kT4sxmp2N5jsTztW8GvNYc"}>
			<Map
				style={{ width: '100vw', height: '100vh' }}
				defaultCenter={{ lat: 22.54992, lng: 0 }}
				defaultZoom={3}
				gestureHandling={'greedy'}
				disableDefaultUI={true}
				mapId={"28752659370b9a3b"}
				onCameraChanged={cameraChange}
			>
				<PoiMarkers pois={props.pois} />
			</Map>
		</APIProvider>
	</>;
}