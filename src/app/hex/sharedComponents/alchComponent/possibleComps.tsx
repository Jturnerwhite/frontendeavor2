'use client';
import { AlchComponent } from "@/app/hex/architecture/typings";
import * as Helpers from "@/app/hex/architecture/helpers/alchHelpers";
import { AlchComponentDisplay, PlaceableAlchComponent } from ".";
import { AlchHexGrid } from "@/app/hex/sharedComponents/hex/hexGrid";
import "./alchComponent.css";
import AlchCompWithBacking from "./alchCompWithBacking";
import { useEffect, useState } from "react";

interface PossibleCompsProps {
	keyString: string;
	possibleComps: Array<AlchComponent>;
	displaySize: number;
	usePlaceable?: boolean;
	additionalClassString?: string;
}

const PossibleComps: React.FC<PossibleCompsProps> = ({
	keyString,
	possibleComps,
	displaySize,
	usePlaceable = false,
	additionalClassString = "",
}): JSX.Element => {
	const [counter, setCounter] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCounter((prev) => {
				return (prev >= (possibleComps.length - 1)) ? 0 : prev + 1
			});
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<AlchCompWithBacking 
			keyString={keyString} 
			alchData={possibleComps[counter]} 
			displaySize={displaySize} 
			usePlaceable={usePlaceable}
			additionalClassString={additionalClassString}
		/>
	);
};

export default PossibleComps;