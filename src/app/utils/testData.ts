import { SIGHTING_TYPE } from "./enums";
import type {SightingEvent} from "@/types/mapTypings";

const sightings:SightingEvent[] = [
	{
		id: "0",
		details: "I was out looking at the Aurora Borealis and up out of the Dugualla Bay water pops up this Blueish Gray circular Orb.",
		source: "https://nuforc.org/sighting/?id=183429",
		sightingType: SIGHTING_TYPE.TRAINED,
		location: { lat: 48.386604, lng:-122.562054 },
		generalRadius: 2000,
		timestamp: new Date(2024, 10, 10, 23, 4),
		duration: 1,
		tags: ["blue", "orb"]
	},
	{
		id: "1",
		details: "Three chevron shaped crafts extremely close together in a line flew across a portion of the sky before disappearing",
		source: "https://nuforc.org/sighting/?id=183443",
		sightingType: SIGHTING_TYPE.GENERAL,
		location: { lat: 34.131042, lng:-116.320080 },
		generalRadius: 2000,
		timestamp: new Date(2024, 10, 10, 20, 55),
		duration: 1,
		tags: ["multiple", "three", "chevron", "lights"]
	},
	{
		id: "2",
		details: "The ship was otherworldly. It wasn’t just a metal structure, it wasn’t just orbs of light - it looked like it was from a sci-fi movie.",
		source: "https://nuforc.org/sighting/?id=183458",
		sightingType: SIGHTING_TYPE.GENERAL,
		location: { lat: 34.131042, lng:-116.320080 },
		generalRadius: 2000,
		timestamp: new Date(2024, 10, 10, 20, 55),
		duration: 1,
		tags: ["multiple", "three", "chevron", "lights"]
	},
	{
		id: "3",
		details: "I saw a craft, lights in the night sky, approaching over our property from the south.",
		source: "https://nuforc.org/sighting/?id=183328",
		sightingType: SIGHTING_TYPE.GENERAL,
		location: { lat: 46.01417, lng:-123.91139 },
		generalRadius: 2000,
		timestamp: new Date(2024, 10, 10, 20, 55),
		duration: 1,
		tags: ["triangle", "metallic", "gray", "grey"]
	},
];

export default { SightingsTestData:sightings};