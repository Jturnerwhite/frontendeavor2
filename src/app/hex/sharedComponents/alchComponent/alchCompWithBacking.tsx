'use client';
import { AlchComponent } from "@/app/hex/architecture/typings";
import * as Helpers from "@/app/hex/architecture/helpers/alchHelpers";
import { AlchComponentDisplay, PlaceableAlchComponent } from ".";
import { AlchHexGrid } from "@/app/hex/sharedComponents/hex/hexGrid";
import ElementIcon from "@/app/hex/sharedComponents/elementIcon/elementIcon";
import { styleHelper } from '@/app/hex/architecture/helpers/styleHelper';
import styles from "./alchComponent.module.css";

interface CompProps {
	keyString: string;
	alchData: AlchComponent;
	displaySize: number;
	usePlaceable?: boolean;
	additionalClassString?: string;
	onPickComponent?: (alchData: AlchComponent) => void;
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
	onPickComponent,
}): JSX.Element => {
	let areaSize = 140;
	if(displaySize <= 20) {
		areaSize = 70;
	} else if(displaySize <= 25) {
		areaSize = 80;
	} else if(displaySize <= 30) {
		areaSize = 100;
	} else if(displaySize <= 35) {
		areaSize = 120;
	}

	const hexSize = displaySize / 1.7;

	return (<>
		<div className={styleHelper('alch-comp-with-backing', styles.backing, additionalClassString)}>
			<ElementIcon element={alchData.element} />
			<svg 
			key={keyString} 
			width={areaSize} 
			height={areaSize} 
			style={{ position: "relative", display:"inline-block" }}>
				<g transform={`translate(${areaSize / 2} ${areaSize / 2})`}>
					<AlchHexGrid
						hexMap={Helpers.CreateHexGrid({ x: 0, y: 0 }, hexSize, 2)}
						radius={hexSize}
						displayIndex={false}
						preventHexHover={true}
						preventHexPlacementHover={true}
					/>
				</g>
				{usePlaceable && (
					<PlaceableAlchComponent
						alchData={alchData}
						position={{ x: areaSize / 2, y: areaSize / 2 }}
						size={displaySize}
						rotation={0}
						onPickComponent={onPickComponent}
					/>
				)}
				{!usePlaceable && (
					<AlchComponentDisplay
						alchData={alchData}
						position={{ x: areaSize / 2, y: areaSize / 2 }}
						size={displaySize}
						rotation={0}
					/>
				)}
			</svg>
		</div>
	</>);
};

export default AlchCompWithBacking;