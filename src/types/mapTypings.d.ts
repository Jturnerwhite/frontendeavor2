import { SIGHTING_TYPE } from "@/app/utils/enums";

export type SightingEvent = {
	id: string,
	details: string,
	source: string,
	sightingType: SIGHTING_TYPE,
	location: google.maps.LatLngLiteral,
	generalRadius?: number,
	timestamp: Date,
	duration?: number,
	tags?: string[],
	relatedIds?: string[],
	related?: SightingEvent[]
}

export type Poi = {
	key: string,
	location: google.maps.LatLngLiteral,
	radius?: number
};