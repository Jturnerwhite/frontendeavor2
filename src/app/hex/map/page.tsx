'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as AlchHelpers from '@/app/hex/architecture/helpers/alchHelpers';
import * as SVGHelpers from '@/app/hex/architecture/helpers/svgHelpers';
import Biomes from '@/app/hex/architecture/data/biomes';
import { HexMap, HexTile } from '@/app/hex/architecture/interfaces';
import { HexGrid } from '@/app/hex/sharedComponents/hex/hexGrid';
import InventoryDisplay from '@/app/hex/sharedComponents/inventory/inventory';
import { RootState } from '@/store/store';
import PlayerStoreSlice from '@/store/features/playerSlice';
import ToastifyStore from '@/store/features/toastifySlice';
import { GatherIngredientsInBiome } from '@/app/hex/architecture/helpers/mapHelpers';
import { IngredientBases } from '@/app/hex/architecture/data/ingredientBases';
import MapFog from './components/mapFog';
import '@/app/hex/map/map.css';

export default function MapPage() {
	const dispatch = useDispatch();
	const inventoryItems = useSelector((state: RootState) => state.Player.inventory.crafted);
	const ingredients = useSelector((state: RootState) => state.Player.inventory.raw);

	const TILE_SIZE = 40;
	const MAP_LAYER_SIZE = 3;
	const [hexMap, setHexMap] = useState<HexMap | undefined>(undefined);
	const [centerHexGridX, setCenterHexGridX] = useState<number>((window.innerWidth * 0.7) / 2);
	const [centerHexGridY, setCenterHexGridY] = useState<number>(window.innerHeight / 2);
	const mapContents = [
		{
			tileIndexes: [0],
			biome: null,
		},
		{
			tileIndexes: [1, 7, 8, 9, 19, 20, 21, 22],
			biome: Biomes.PineBarrens,
		},
		{
			tileIndexes: [2, 3, 5, 6, 10, 11, 12, 15, 17, 18, 32, 33, 34, 35, 36],
			biome: Biomes.FlowingFields,
		},
		{
			tileIndexes: [4, 13, 14, 16, 23, 24, 25, 26, 27, 28, 29, 30, 31],
			biome: Biomes.ValleyRidge,
		}
	];

	function hexClick(hex: HexTile) {
		const content = mapContents.find((content) => content.tileIndexes.includes(hex.index));
		if (content !== undefined && content.biome !== null) {
			const ingredients = GatherIngredientsInBiome(content.biome, 1);

			dispatch(PlayerStoreSlice.actions.addGatheredIngredients({ ingredients }));
			ingredients.forEach((ing) => {
				const base = IngredientBases[ing.baseIngId];
				dispatch(
					ToastifyStore.actions.showToast({
						message: 'Gathered ' + base.name + ' (Quality: ' + ing.quality + '%)',
						...(base.image ? { imagePath: base.image } : {}),
					}),
				);
			});
		}
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
					href={`/icons/${content.biome?.icon ?? "village"}.svg`} />
				);
			}
			return acc;
		}, [] as JSX.Element[]);
	}

	useEffect(() => {
		if(hexMap) return;
		setHexMap(AlchHelpers.CreateHexGrid({x: 0, y: 0}, TILE_SIZE, MAP_LAYER_SIZE));
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
				hideFiltering={true} 
				hideSorting={true} 
				hideSubFiltering={true} 
				hideSubSorting={true}/>
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
						<MapFog 
							hexMap={hexMap} 
							radiusBase={TILE_SIZE} 
							currentLayers={MAP_LAYER_SIZE} 
							mapFogLayers={MAP_LAYER_SIZE - 1} 
						/>
					</g>
				</svg>
				</>
			)}
		</main>
	</div>
}
