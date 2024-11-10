'use client'
import { SIGHTING_TYPE } from "../utils/enums";
import { MapHandler } from "./components";
import type {Poi, SightingEvent } from "@/types/mapTypings";

export default function Page() {
	// test data
	const locations:Poi[] = [
		{key: 'operaHouse', location: { lat: -33.8567844, lng: 151.213108  }},
		{key: 'tarongaZoo', location: { lat: -33.8472767, lng: 151.2188164 }},
		{key: 'manlyBeach', location: { lat: -33.8209738, lng: 151.2563253 }},
		{key: 'hyderPark', location: { lat: -33.8690081, lng: 151.2052393 }},
		{key: 'theRocks', location: { lat: -33.8587568, lng: 151.2058246 }},
		{key: 'circularQuay', location: { lat: -33.858761, lng: 151.2055688 }},
		{key: 'harbourBridge', location: { lat: -33.852228, lng: 151.2038374 }},
		{key: 'kingsCross', location: { lat: -33.8737375, lng: 151.222569 }},
		{key: 'botanicGardens', location: { lat: -33.864167, lng: 151.216387 }},
		{key: 'museumOfSydney', location: { lat: -33.8636005, lng: 151.2092542 }},
		{key: 'maritimeMuseum', location: { lat: -33.869395, lng: 151.198648 }},
		{key: 'kingStreetWharf', location: { lat: -33.8665445, lng: 151.1989808 }},
		{key: 'aquarium', location: { lat: -33.869627, lng: 151.202146 }},
		{key: 'darlingHarbour', location: { lat: -33.87488, lng: 151.1987113 }},
		{key: 'barangaroo', location: { lat: -33.8605523, lng: 151.1972205 }},
		{key: 'circleTest', location: { lat: 48.386604, lng:-122.562054 }, radius:1500 },
	];

	const sightings:SightingEvent[] = [
		{
			id: "0",
			details: "I was out looking at the Aurora Borealis and up out of the Dugualla Bay water pops up this Blueish Gray circular Orb.",
			source: "https://nuforc.org/sighting/?id=183429",
			sightingType: SIGHTING_TYPE.TRAINED,
			location: { lat: 48.386604, lng:-122.562054 },
			timestamp: new Date(2024, 10, 10, 23, 4),
			duration: 1,
			tags: ["blue", "orb"]
		}
	];

	return <>
		<MapHandler pois={locations}/>
	</>;
}