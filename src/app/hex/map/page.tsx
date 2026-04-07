'use client';
import { useEffect, useState } from 'react';
import '@/app/hex/map/map.css';
import * as Helpers from '@/app/hex/architecture/helpers';
import { HexMap, HexTile } from '@/app/hex/architecture/interfaces';
import HexGrid from '@/app/hex/sharedComponents/hex/hexGrid';
import InventoryDisplay from '@/app/hex/sharedComponents/inventory/inventory';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function MapPage() {
	const inventoryItems = useSelector((state: RootState) => state.Player.inventory.crafted);
	const ingredients = useSelector((state: RootState) => state.Player.inventory.raw);

	const TILE_SIZE = 40;
	const MAP_LAYER_SIZE = 2;
	const [hexMap, setHexMap] = useState<HexMap | undefined>(undefined);
	const [centerHexGridX, setCenterHexGridX] = useState<number>((window.innerWidth * 0.7) / 2);
	const [centerHexGridY, setCenterHexGridY] = useState<number>(window.innerHeight / 2);
	const mapContents = [
		{
			tileIndexes: [0],
			icon: 'village',
			description: 'Town'
		},
		{
			tileIndexes: [1, 7, 8, 9, 19, 20, 21, 22],
			icon: 'pine-tree',
			description: 'A dense forest'
		},
		{
			tileIndexes: [2, 3, 4, 5, 6, 10, 11, 12, 15, 17, 18, 32, 33, 34, 35, 36],
			icon: 'high-grass',
			description: 'An open field'
		},
		{
			tileIndexes: [13, 14, 16, 23, 24, 25, 26, 27, 28, 29, 30, 31],
			icon: 'peaks',
			description: 'A mountain'
		}
	];

	function hexClick(hex: HexTile) {
	}

	function onHexEnter(hex: HexTile) {
		// Display tooltip for the hex
	}

	function renderMapContents() {
		if(hexMap === undefined) {
			return null;
		}

		return Object.values(hexMap).reduce((acc: JSX.Element[], tile: HexTile): JSX.Element[] => {
			const content = mapContents.find((content) => content.tileIndexes.includes(tile.index));
			if(content !== undefined) {
				acc.push(<image 
					key={tile.index}
					x={tile.position.x - (TILE_SIZE / 2)}
					y={tile.position.y - (TILE_SIZE / 2)}
					width={TILE_SIZE}
					height={TILE_SIZE}
					className="map-content-icon" 
					href={`/icons/${content.icon}.svg`} />
				);
			}
			return acc;
		}, [] as JSX.Element[]);
	}

	useEffect(() => {
		if(hexMap) return;
		setHexMap(Helpers.CreateHexGrid({x: 0, y: 0}, TILE_SIZE, MAP_LAYER_SIZE));
	}, []);

	useEffect(() => {
		const handleResize = () => {
			setCenterHexGridY(window.innerHeight / 2);
			setCenterHexGridX((window.innerWidth * 0.7) / 2);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return <div className="map-layout">
		<aside className="map-left-panel">
			<InventoryDisplay 
				inventoryItems={inventoryItems} 
				ingredients={ingredients}
				hideFiltering={false} 
				hideSorting={false} 
				hideSubFiltering={false} 
				hideSubSorting={false} />
		</aside>
		<main className="map-main-panel" onContextMenu={(e: React.MouseEvent) => {}}>
			{hexMap && (
				<>
				<svg
					className="map-hex-svg"
					width="100%"
					height="100%"
					pointerEvents="none"
				>
					<g transform={`translate(${centerHexGridX} ${centerHexGridY})`}>
						<HexGrid
							hexMap={hexMap}
							radius={TILE_SIZE}
							onHexClick={hexClick}
							displayIndex={true}
							preventHexHover={false}
							preventHexPlacementHover={true}
						/>
						<g>{renderMapContents()}</g>
					</g>
				</svg>
				</>
			)}
		</main>
	</div>
}
