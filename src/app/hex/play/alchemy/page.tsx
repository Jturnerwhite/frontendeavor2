'use client'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'next/navigation';
import { RootState } from "@/store/store";
import AlchemyStoreSlice from '@/store/features/alchemySlice';
import PlayerStoreSlice from '@/store/features/playerSlice';
import ToastifyStore from '@/store/features/toastifySlice';
import HistoryStoreSlice from '@/store/features/historySlice';
import type { AlchemyLabSource, AlchComponent, Item } from '@/app/hex/architecture/typings';
import {
	collectConsumptionFromLabSources,
	flattenLabSourcesToIngredients,
} from '@/app/hex/architecture/helpers/alchemyLabSources';
import { AlchHexGrid } from '@/app/hex/sharedComponents/hex/hexGrid';
import * as AlchHelpers from '@/app/hex/architecture/helpers/alchHelpers';
import * as SVGHelpers from '@/app/hex/architecture/helpers/svgHelpers';
import ComponentCursorGhost from '@/app/hex/play/components/compCursorGhost';
import IngredientDisplay from '@/app/hex/play/components/ingredientDisplay';
import CraftedItemLabDisplay from '@/app/hex/play/components/ingredientDisplay/craftedItemLabDisplay';
import { HexTile, LinkedComponents, Position } from '@/app/hex/architecture/interfaces';
import { AlchComponentDisplay } from '@/app/hex/sharedComponents/alchComponent';
import { Recipes } from '@/app/hex/architecture/data/recipes';
import RecipeDisplay from '@/app/hex/play/components/recipeDisplay';
import { ALCH_ELEMENT, COMPONENT_SHAPE_VALUES } from '@/app/hex/architecture/enums';
import BoardHex from '@/app/hex/play/components/board';
import './alchemy.css';

export default function Page() {
	const dispatch = useDispatch();
	const router = useRouter();
	const playGrid = useSelector((state: RootState) => state.Alchemy.playGrid);
	const placedComponents = useSelector((state: RootState) => state.Alchemy.placedComponents);
	const ingredients = useSelector((state: RootState) => state.Alchemy.ingredients);
	const cursorState = useSelector((state: RootState) => state.Alchemy.cursor);
	const currentRecipeId = useSelector((state: RootState) => state.Alchemy.currentRecipe);

	const recipe = currentRecipeId ? Recipes.find((r) => r.id === currentRecipeId) : undefined;

	const [centerHexGridX, setCenterHexGridX] = useState<number>((window.innerWidth * 0.6) / 2);
	const [centerHexGridY, setCenterHexGridY] = useState<number>(window.innerHeight / 2);
	const [crossComponentLinks, setLinks] = useState<LinkedComponents[]>([]);
	const canUndoPlacement = useSelector((state: RootState) => state.Alchemy.placementUndoPast.length > 0);
	const canRedoPlacement = useSelector((state: RootState) => state.Alchemy.placementUndoFuture.length > 0);

	const playGridLayers = 4;
	const size = 40;
	const alchCompSize = 2 * AlchHelpers.GetApothem(size);

	function hexClick(hex: HexTile, validTileHover: boolean) {
		if(!validTileHover) return;
		if(cursorState.isPlacing && cursorState.selectedComponent) {
			dispatch(AlchemyStoreSlice.actions.addPlacedComponent(hex));
		}
	}

	function renderComponentLinks(): JSX.Element[] {
		return crossComponentLinks.map((link, index) => {
			const component1Pos = playGrid![link.component1HexId].position;
			const component2Pos = playGrid![link.component2HexId].position;
			return SVGHelpers.GetSVGLine(
				`${link.component1Id}-${link.component2Id}-line-${index}`, 
				link.element.toLowerCase().replace(/\s+/g, "-"),
				component1Pos, 
				component2Pos, 
				"black", 
				alchCompSize);
		});
	}

	function renderPlacedComponents() {
		return placedComponents?.map((component, index) => {
			return <AlchComponentDisplay 
				key={"comp" + index} 
				alchData={component.comp} 
				position={component.position}
				size={alchCompSize} 
				rotation={component.rotation}
				/>
		});
	}

	function getCompPlacedForSource(sourceId: string, comps: AlchComponent[]): boolean[] {
		return comps.map((comp, index) => {
			return placedComponents.some((component: {
				comp: AlchComponent;
				position: Position;
				rotation: number;
				centerHexId: string;
			}) => component.comp.sourceIngredientId === sourceId && component.comp.ingredientIndex === index);
		});
	}

	function getCurrentElementScores(): Record<ALCH_ELEMENT, { nodes: number; links: number }> {
		const output = {
			[ALCH_ELEMENT.EARTH]: { nodes: 0, links: 0 },
			[ALCH_ELEMENT.WIND]: { nodes: 0, links: 0 },
			[ALCH_ELEMENT.FIRE]: { nodes: 0, links: 0 },
			[ALCH_ELEMENT.WATER]: { nodes: 0, links: 0 },
			[ALCH_ELEMENT.AETHER]: { nodes: 0, links: 0 },
			[ALCH_ELEMENT.CHAOS]: { nodes: 0, links: 0 },
		};

		placedComponents.forEach((component: {
			comp: AlchComponent;
			position: Position;
			rotation: number;
			centerHexId: string;
		}) => {
			output[component.comp.element].nodes += COMPONENT_SHAPE_VALUES[component.comp.shape].reduce((acc, curr) => acc + curr, 0);
			output[component.comp.element].links += AlchHelpers.CalculateLinksInComponent(component.comp);
		});

		crossComponentLinks.forEach((link: LinkedComponents) => {
			output[link.element].links++;
		});

		return output;
	}

	const canComplete = useMemo(
		() =>
			ingredients.length > 0 &&
			ingredients.every((row: AlchemyLabSource) => {
				if (row.labKind === 'ingredient') {
					return getCompPlacedForSource(row.ingredient.id, row.ingredient.comps).some(Boolean);
				}
				return getCompPlacedForSource(row.labSlotId, row.item.comps).some(Boolean);
			}),
		[ingredients, placedComponents],
	);

	const handleComplete = useCallback(() => {
		if (!recipe || !canComplete) return;
		const elementScores = getCurrentElementScores();
		const quality = AlchHelpers.CalculateQuality(recipe, elementScores);
		const item: Item = {
			id: AlchHelpers.GenerateTempId(),
			name: recipe.description,
			baseRecipeId: recipe.id,
			description: recipe.description,
			comps: AlchHelpers.GetResultingComponents(recipe, elementScores),
			types: [...recipe.types],
			quality,
			ingredients: flattenLabSourcesToIngredients(ingredients),
		};
		const { rawIds, craftedItemIds } = collectConsumptionFromLabSources(ingredients);
		if (rawIds.length > 0 || craftedItemIds.length > 0) {
			dispatch(PlayerStoreSlice.actions.removeInventorySlots({ rawIds, craftedItemIds }));
		}
		dispatch(PlayerStoreSlice.actions.completeCraft({ item }));
		dispatch(ToastifyStore.actions.showToast({ message: item.name }));
		dispatch(
			HistoryStoreSlice.actions.recordCompletedCraft({
				item,
				recipe,
				elementScores,
			}),
		);
		router.push('/hex/play/alchemy/complete');
	}, [recipe, canComplete, placedComponents, ingredients, dispatch, router, crossComponentLinks]);

	useEffect(() => {
		if (playGrid === undefined) {
			dispatch(AlchemyStoreSlice.actions.setPlayGrid({ pos: { x:0, y:0 }, size, layers: playGridLayers }));
		}
	}, []);

	// useLayoutEffect runs after AlchemyRehydrate's layout effect (parent before child), so recipe reflects localStorage.
	useLayoutEffect(() => {
		if (!recipe) {
			router.replace('/hex/play/alchemy/selectRecipe');
		}
	}, [recipe, router]);

	useEffect(() => {
		const handleResize = () => {
			setCenterHexGridY(window.innerHeight / 2);
			setCenterHexGridX((window.innerWidth * 0.6) / 2);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		if (!playGrid) {
			setLinks([]);
			return;
		}
		if (placedComponents.length === 0) {
			setLinks([]);
			return;
		}
		const rebuilt: LinkedComponents[] = [];
		for (const pc of placedComponents) {
			rebuilt.push(...AlchHelpers.GetLinks(playGrid, pc));
		}
		setLinks(rebuilt);
	}, [placedComponents, playGrid]);

	const currentElementScores = getCurrentElementScores();
	const recipeQuality = recipe ? AlchHelpers.CalculateQuality(recipe, currentElementScores) : 0;

	if (!recipe) {
		return null;
	}

	return (
		<div className="alchemy-layout">
			<aside className="alchemy-left-panel" onContextMenu={(e: React.MouseEvent) => e.preventDefault()}>
				{ingredients.length > 0 &&
					ingredients.map((row: AlchemyLabSource, index: number) =>
						row.labKind === 'ingredient' ? (
							<IngredientDisplay
								key={row.ingredient.id + '-' + index}
								ingredient={row.ingredient}
								displaySize={20}
								usePlaceable={true}
								compPlaced={getCompPlacedForSource(row.ingredient.id, row.ingredient.comps)}
								onPickComponent={(comp) =>
									dispatch(AlchemyStoreSlice.actions.setCursorComponent(comp))
								}
							/>
						) : (
							<CraftedItemLabDisplay
								key={row.labSlotId + '-' + index}
								item={row.item}
								displaySize={20}
								usePlaceable={true}
								compPlaced={getCompPlacedForSource(row.labSlotId, row.item.comps)}
								onPickComponent={(comp) =>
									dispatch(AlchemyStoreSlice.actions.setCursorComponent(comp))
								}
							/>
						),
					)}
			</aside>
			<main className="alchemy-main-panel" onContextMenu={(e: React.MouseEvent) => e.preventDefault()}>
				<div className="alchemy-undo-redo" role="group" aria-label="Placement undo and redo">
					<button
						type="button"
						className="alchemy-undo-redo-button"
						disabled={!canUndoPlacement}
						onClick={() => dispatch(AlchemyStoreSlice.actions.undoPlacement())}
					>
						Undo
					</button>
					<button
						type="button"
						className="alchemy-undo-redo-button"
						disabled={!canRedoPlacement}
						onClick={() => dispatch(AlchemyStoreSlice.actions.redoPlacement())}
					>
						Redo
					</button>
				</div>
				{playGrid && (
					<svg
						className="alchemy-hex-svg"
						width="100%"
						height="100%"
						pointerEvents="none"
					>
						<g transform={`translate(${centerHexGridX} ${centerHexGridY})`}>
							<BoardHex radiusBase={size} layers={playGridLayers} />
							<AlchHexGrid
								hexMap={playGrid}
								radius={size}
								onHexClick={hexClick}
								displayIndex={true}
								preventHexHover={false}
								placementCursor={cursorState}
							/>
							<g>
								{renderComponentLinks()}
							</g>
							<g>
								{renderPlacedComponents()}
							</g>
						</g>
					</svg>
				)}
				<ComponentCursorGhost displaySize={alchCompSize} />
			</main>
			<aside className="alchemy-right-panel" onContextMenu={(e: React.MouseEvent) => e.preventDefault()}>
				<RecipeDisplay recipe={recipe} quality={recipeQuality} currentElementScores={currentElementScores} hideImage={true} />
				<button
					type="button"
					className="alchemy-complete-button"
					disabled={!canComplete}
					onClick={handleComplete}
				>
					Complete
				</button>
			</aside>
		</div>
	);
}