'use client';
import { AlchComponent } from "@/app/hex/architecture/typings";
import * as Helpers from "@/app/hex/architecture/helpers/alchHelpers";
import { AlchComponentDisplay, PlaceableAlchComponent } from ".";
import { AlchHexGrid } from "@/app/hex/sharedComponents/hex/hexGrid";
import "./alchComponent.css";

interface CompProps {
	keyString: string;
	alchData: AlchComponent;
	displaySize: number;
	usePlaceable?: boolean;
	additionalClassString?: string;
}

/**
 * Self contained component display with hex background
 */
const AlchCompWithBacking: React.FC<CompProps> = ({
	keyString,
	alchData,
	displaySize,
	usePlaceable = false,
	additionalClassString = "",
}): JSX.Element => {
	let areaSize = 100;
	switch(displaySize) {
		case 25:
			areaSize = 75;
			break;
		case 35:
			areaSize = 100;
			break;
	}
	return (
		<svg 
		key={keyString} 
		className={"alch-comp-with-backing " + additionalClassString}
		width={areaSize} 
		height={areaSize} 
		style={{ position: "relative", display:"inline-block" }}>
			<g transform={`translate(${areaSize / 2} ${areaSize / 2})`}>
				<AlchHexGrid
					hexMap={Helpers.CreateHexGrid({ x: 0, y: 0 }, displaySize / 2, 2)}
					radius={displaySize / 2}
					displayIndex={false}
					preventHexHover={true}
					preventHexPlacementHover={true}
				/>
			</g>
			{usePlaceable && (<PlaceableAlchComponent alchData={alchData} position={{x:areaSize / 2, y:areaSize / 2}} size={displaySize * 0.85} rotation={0} />)}
			{!usePlaceable && (<AlchComponentDisplay alchData={alchData} position={{x:areaSize / 2, y:areaSize / 2}} size={displaySize * 0.85} rotation={0} />)}
		</svg>
	);
};

export default AlchCompWithBacking;