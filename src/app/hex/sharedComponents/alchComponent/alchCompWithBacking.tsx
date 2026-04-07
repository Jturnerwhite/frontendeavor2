'use client';
import { AlchComponent } from "@/app/hex/architecture/typings";
import * as Helpers from "@/app/hex/architecture/helpers";
import { AlchComponentDisplay, PlaceableAlchComponent } from ".";
import AlchHexGrid from "@/app/hex/sharedComponents/hex/hexGrid";
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
	return (
		<svg 
		key={keyString} 
		className={"alch-comp-with-backing " + additionalClassString}
		width={100} 
		height={100} 
		style={{ position: "relative", display:"inline-block" }}>
			<g transform={`translate(50 50)`}>
				<AlchHexGrid
					hexMap={Helpers.CreateHexGrid({ x: 0, y: 0 }, displaySize / 2, 2)}
					radius={displaySize / 2}
					displayIndex={false}
					preventHexHover={true}
					preventHexPlacementHover={true}
				/>
			</g>
			{usePlaceable && (<PlaceableAlchComponent alchData={alchData} position={{x:50, y:50}} size={displaySize * 0.85} rotation={0} />)}
			{!usePlaceable && (<AlchComponentDisplay alchData={alchData} position={{x:50, y:50}} size={displaySize * 0.85} rotation={0} />)}
		</svg>
	);
};

export default AlchCompWithBacking;