'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import * as AlchHelpers from '@/app/hex/architecture/helpers/alchHelpers';
import * as SVGHelpers from '@/app/hex/architecture/helpers/svgHelpers';
import Biomes from '@/app/hex/architecture/data/biomes';
import { MAP_TERRAIN } from '@/app/hex/architecture/enums';
import { HexMap, HexTile } from '@/app/hex/architecture/interfaces';
import { HexGrid } from '@/app/hex/sharedComponents/hex/hexGrid';
import InventoryDisplay from '@/app/hex/sharedComponents/inventory/inventory';
import PlayerStoreSlice from '@/store/features/playerSlice';
import ToastifyStore from '@/store/features/toastifySlice';
import { GatherIngredientsInBiome } from '@/app/hex/architecture/helpers/mapHelpers';
import { IngredientBases } from '@/app/hex/architecture/data/ingredientBases';
import MapFog from '@/app/hex/map/components/mapFog';
import '@/app/hex/map/map.css';
import { publicAsset } from '@/lib/publicAsset';
import { hardResetPersistedGameState } from '@/store/store';
import MapStoreSlice from '@/store/features/mapSlice';
import HexTimerOverlay from './components/hexTimerOverlay';

export default function MapPage() {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const inventoryItems = useAppSelector((state) => state.Player.inventory.crafted);
	const ingredients = useAppSelector((state) => state.Player.inventory.raw);
	const hexesOnCooldown = useAppSelector((state) => state.Map.hexesOnCooldown);

	const TILE_SIZE = 40;
	const MAP_LAYER_SIZE = 3;
	const HEX_TIMER_DURATION = 5000;
	const MAP_CONTENTS: Array<{
		tileIndexes: number[];
		biome: (typeof Biomes)[keyof typeof Biomes] | null;
		icon?: string;
	}> = [
		{ tileIndexes: [0], biome: null, icon: 'home' },
		{ tileIndexes: [15], biome: null, icon: 'village' },
		{
			tileIndexes: [1, 7, 8, 9, 19, 20, 21, 22],
			biome: Biomes.PineBarrens,
		},
		{
			tileIndexes: [2, 3, 5, 6, 11, 12, 17, 18, 32, 33, 34, 35, 36],
			biome: Biomes.FlowingFields,
		},
		{
			tileIndexes: [4, 13, 14, 16, 23, 24, 25, 26, 27, 28, 29, 30, 31],
			biome: Biomes.ValleyRidge,
		},
		{
			tileIndexes: [10],
			biome: Biomes.LacrimoseLake,
		}
	];

	const [hexMap, setHexMap] = useState<HexMap | undefined>(undefined);
	const [centerHexGridX, setCenterHexGridX] = useState<number>(0);
	const [centerHexGridY, setCenterHexGridY] = useState<number>(0);

	const FISHING_TERRAINS = new Set<MAP_TERRAIN>([
		MAP_TERRAIN.LAKE,
		MAP_TERRAIN.FRESHWATER,
		MAP_TERRAIN.OCEAN,
	]);

	function biomeKeyFor(biome: (typeof Biomes)[keyof typeof Biomes]): keyof typeof Biomes | undefined {
		const entry = (Object.entries(Biomes) as [keyof typeof Biomes, (typeof Biomes)[keyof typeof Biomes]][]).find(
			([, b]) => b === biome,
		);
		return entry?.[0];
	}

	function hexClick(hex: HexTile) {
		const content = MAP_CONTENTS.find((content) => content.tileIndexes.includes(hex.index));
		if (content !== undefined && content.biome === null) {
			if (hex.index === 0) {
				router.push('/hex/map/home');
				return;
			}
			if (hex.index === 15) {
				router.push('/hex/map/town');
				return;
			}
			return;
		}
		if (content !== undefined && content.biome !== null) {
			if (FISHING_TERRAINS.has(content.biome.terrain)) {
				const key = biomeKeyFor(content.biome);
				if (key !== undefined) {
					router.push('/hex/fishing?biome=' + encodeURIComponent(String(key)));
				}
				return;
			}

			if (hexesOnCooldown[hex.id]) return;

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

			startHexCooldown(hex.id);
		}
	}

	function onHexEnter(hex: HexTile) {
		// Display tooltip for the hex
	}

	function startHexCooldown(hexMapId: string) {
		dispatch(
			MapStoreSlice.actions.startHexCooldown({
				hexId: hexMapId,
				startedAt: Date.now(),
				duration: HEX_TIMER_DURATION,
			}),
		);
	}

	function endHexCooldown(hexMapId: string) {
		dispatch(MapStoreSlice.actions.endHexCooldown({ hexId: hexMapId }));
	}

	function renderMapContents() {
		if(hexMap === undefined) {
			return null;
		}

		return Object.values(hexMap).reduce((acc: JSX.Element[], tile: HexTile): JSX.Element[] => {
			const content = MAP_CONTENTS.find((content) => content.tileIndexes.includes(tile.index));
			if(content !== undefined) {
				acc.push(<image 
					key={tile.index}
					x={tile.position.x - (TILE_SIZE / 2)}
					y={tile.position.y - (TILE_SIZE / 2)}
					width={TILE_SIZE}
					height={TILE_SIZE}
					className="map-content-icon" 
					href={publicAsset(`/icons/${content.biome?.icon ?? content.icon ?? 'village'}.svg`)} />
				);
			}
			return acc;
		}, [] as JSX.Element[]);
	}

	function assignAdditionalClassStrings(hexMap: HexMap) {
		Object.values(hexMap).forEach((hex: HexTile) => {
			const content = MAP_CONTENTS.find((content) => content.tileIndexes.includes(hex.index));
			if(content !== undefined) {
				hex.additionalClassString = content.biome?.id ?? '';
			}
		});
	}

	function renderHexTimerOverlays() {
		if (hexMap === undefined) return null;
		const out: JSX.Element[] = [];
		for (const [hexMapId, entry] of Object.entries(hexesOnCooldown)) {
			const tile = hexMap[hexMapId];
			if (!tile) continue;
			out.push(
				<HexTimerOverlay
					key={hexMapId}
					hexIndex={hexMapId}
					position={tile.position}
					size={TILE_SIZE}
					duration={entry.duration}
					startedAt={entry.startedAt}
					onComplete={endHexCooldown}
				/>,
			);
		}
		return out;
	}

	useEffect(() => {
		if(hexMap) return;
		let newMap = AlchHelpers.CreateHexGrid({x: 0, y: 0}, TILE_SIZE, MAP_LAYER_SIZE);
		assignAdditionalClassStrings(newMap);
		setHexMap(newMap);
	}, []);

	useEffect(() => {
		const handleResize = () => {
			setCenterHexGridY(window.innerHeight / 2);
			setCenterHexGridX((window.innerWidth * 0.7) / 2);
		};
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return <div className="map-layout">
		<aside className="map-left-panel">
			{inventoryItems?.length > 0 || ingredients?.length > 0 && (
			<InventoryDisplay 
				inventoryItems={inventoryItems ?? []} 
				ingredients={ingredients ?? []}
				hideFiltering={true} 
				hideSorting={true} 
				hideSubFiltering={true} 
				hideSubSorting={true}/>
			)}
		</aside>
		<main className="map-main-panel" onContextMenu={(e: React.MouseEvent) => {}}>
			{(
				<button
					type="button"
					className="map-dev-hard-reset"
					title="Reset game state and localStorage (dev only)"
					onClick={() => {
						if (
							typeof window !== 'undefined' &&
							!window.confirm('Hard reset: clear inventory, alchemy, history, and persisted storage?')
						) {
							return;
						}
						hardResetPersistedGameState();
					}}
				>
					Dev: reset save
				</button>
			)}
			{hexMap && (<>
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
						<g>{renderHexTimerOverlays()}</g>
					</g>
				</svg>
			</>)}
		</main>
	</div>
}
