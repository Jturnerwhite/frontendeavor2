'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
	AdvancedMarker,
	useMap,
	Pin,
} from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Circle, CircleProps } from './circle';
import type { Marker } from '@googlemaps/markerclusterer';
import type { Poi } from "@/types/mapTypings";

export const PoiMarkers = (props: { pois: Poi[] }) => {
	const map = useMap();
	const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
	const clusterer = useRef<MarkerClusterer | null>(null);

	// Initialize MarkerClusterer, if the map has changed
	useEffect(() => {
		if (!map) return;
		if (!clusterer.current) {
			clusterer.current = new MarkerClusterer({ map });
		}
	}, [map]);

	// Update markers, if the markers array has changed
	useEffect(() => {
		clusterer.current?.clearMarkers();
		clusterer.current?.addMarkers(Object.values(markers));
	}, [markers]);

	const setMarkerRef = (marker: Marker | null, key: string) => {
		if (marker && markers[key]) return;
		if (!marker && !markers[key]) return;

		setMarkers(prev => {
			if (marker) {
				return { ...prev, [key]: marker };
			} else {
				const newMarkers = { ...prev };
				delete newMarkers[key];
				return newMarkers;
			}
		});
	};

	const handleClick = useCallback((poi:Poi, ev:google.maps.MapMouseEvent) => {
		if (!map) return;
		if (!ev.latLng) return;
		console.log('marker clicked:', poi, ev);
		map.panTo(ev.latLng);
	}, [props.pois]);

	const showMarkers = () => {
		let markers = props.pois.map((poi: Poi) => {
			if(poi.radius) {
				return (
					<Circle key={poi.key} center={poi.location} radius={poi.radius}/>
				);
			}

			return (
				<AdvancedMarker
					key={poi.key}
					position={poi.location}
					ref={marker => setMarkerRef(marker, poi.key)}
					clickable={true}
					onClick={ev => {handleClick(poi, ev)}}
				>
					<Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
				</AdvancedMarker>
			);
		});

		return markers;
	}

	return showMarkers();
};