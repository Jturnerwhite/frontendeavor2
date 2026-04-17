'use client'
import React from 'react';
import {
	APIProvider,
	Map,
} from '@vis.gl/react-google-maps';
import { Poi } from "@/types/mapTypings";
import { PoiMarkers } from './poiMarkers';

export const MapHandler = (props: { pois: Poi[] }) => {
	return <>
		<APIProvider apiKey={"AIzaSyDMewgwzKWX7kT4sxmp2N5jsTztW8GvNYc"}>
			<Map
				style={{ width: '100vw', height: '100vh' }}
				defaultCenter={{ lat: 22.54992, lng: 0 }}
				defaultZoom={3}
				gestureHandling={'greedy'}
				disableDefaultUI={true}
				mapId={"28752659370b9a3b"}
			>
				<PoiMarkers pois={props.pois} />
			</Map>
		</APIProvider>
	</>;
}