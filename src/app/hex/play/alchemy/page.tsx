'use client'
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from 'next/navigation';
import { RootState } from "@/store/store";
import AlchemyStoreSlice from '@/store/features/alchemySlice';
import PlayerStoreSlice from '@/store/features/playerSlice';
import { AlchComponent, Ingredient, Item } from '@/app/hex/architecture/typings';	
import HexGrid from '@/app/hex/play/components/hex/hexGrid';
import * as Helpers from '@/app/hex/architecture/helpers';
import ComponentCursorGhost from '@/app/hex/play/components/compCursorGhost';
import IngredientDisplay from '../components/ingredientDisplay';
import './alchemy.css';
import { HexTile, LinkedComponents, Position } from '../../architecture/interfaces';
import { AlchComponentDisplay } from '../components/alchComponent';
import { Recipes } from '../../architecture/data/recipes';
import RecipeDisplay from '../components/recipeDisplay';
import { ALCH_ELEMENT, COMPONENT_SHAPE_VALUES } from '../../architecture/enums';

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
	const [flashOccupied, setFlashOccupied] = useState(false);
	const [lastPlacedCompCount, setLastPlacedCompCount] = useState(0);
	const [crossComponentLinks, setLinks] = useState<LinkedComponents[]>([]);

	const testLayers = 6;
	const size = 40;
	const alchCompSize = 2 * Helpers.GetApothem(size);

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
			return Helpers.GetSVGLine(
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
				rotation={component.rotation} />
		});
	}

	function flashOccupiedTiles() {
		setFlashOccupied(true);
		window.setTimeout(() => setFlashOccupied(false), 450);
	}

	function getCompPlaced(ingredient: Ingredient): boolean[] {
		return ingredient.comps.map((comp, index) => {
			return placedComponents.some((component: {
				comp: AlchComponent;
				position: Position;
				rotation: number;
				centerHexId: string;
			}) => component.comp.sourceIngredientId === ingredient.id && component.comp.ingredientIndex === index);
		});
	}

	const currentElementScores = useMemo((): Record<ALCH_ELEMENT, { nodes: number; links: number }> => {
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
			output[component.comp.element].links += Helpers.CalculateLinksInComponent(component.comp);
		});

		crossComponentLinks.forEach((link: LinkedComponents) => {
			output[link.element].links++;
		});

		return output;
	}, [placedComponents, crossComponentLinks]);

	const recipeQuality = useMemo(() => {
		if (!recipe) return 0;
		return Helpers.CalculateQuality(recipe, currentElementScores);
	}, [recipe, currentElementScores]);

	const canComplete = useMemo(
		() =>
			ingredients.length > 0 &&
			ingredients.every((ing) => getCompPlaced(ing).some(Boolean)),
		[ingredients, placedComponents],
	);

	const handleComplete = useCallback(() => {
		if (!recipe || !canComplete) return;
		const item: Item = {
			name: recipe.description,
			comps: placedComponents.map((p) => ({ ...p.comp })),
			types: [...recipe.types],
			quality: recipeQuality,
			ingredients: structuredClone(ingredients),
		};
		dispatch(
			PlayerStoreSlice.actions.completeCraft({
				item,
				recipe,
				elementScores: currentElementScores,
			}),
		);
		router.push('/hex/play/alchemy/complete');
	}, [recipe, canComplete, placedComponents, ingredients, dispatch, router, currentElementScores, recipeQuality]);

	useEffect(() => {
		if (playGrid === undefined) {
			dispatch(AlchemyStoreSlice.actions.setPlayGrid({ pos: { x:0, y:0 }, size, layers: testLayers }));
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
		if(placedComponents.length === lastPlacedCompCount) return;
		if(placedComponents.length === 0) return;
		if(placedComponents.length > lastPlacedCompCount) {
			const newLinks = Helpers.GetLinks(playGrid!, placedComponents[placedComponents.length - 1]);
			setLinks(newLinks);
			setLastPlacedCompCount(placedComponents.length);
		} else { // Remove links for the removed components
			const updatedLinks = crossComponentLinks.filter((link) => {
				return !placedComponents.some((component) => {
					return component.comp.id === link.component1Id || component.comp.id === link.component2Id;
				});
			});
			setLinks(updatedLinks);
			setLastPlacedCompCount(placedComponents.length);
		}
	}, [placedComponents]);

	if (!recipe) {
		return null;
	}

	return (
		<div className="alchemy-layout">
			<aside className="alchemy-left-panel" onContextMenu={(e: React.MouseEvent) => {}}>
				{ingredients.length > 0 &&
					ingredients.map((ingredient: Ingredient) => (
						<IngredientDisplay
							key={ingredient.base.name}
							ingredient={ingredient}
							displaySize={alchCompSize / 2}
							usePlaceable={true}
							compPlaced={getCompPlaced(ingredient)}
						/>
					))}
				<button
					type="button"
					className="alchemy-flash-occupied-button"
					onClick={flashOccupiedTiles}
				>
					DEBUG:Flash occupied
				</button>
			</aside>
			<main className="alchemy-main-panel" onContextMenu={(e: React.MouseEvent) => e.preventDefault()}>
				{playGrid && (
					<svg
						className="alchemy-hex-svg"
						width="100%"
						height="100%"
						pointerEvents="none"
					>
						<g transform={`translate(${centerHexGridX} ${centerHexGridY})`}>
							<HexGrid
								hexMap={playGrid}
								radius={size}
								onHexClick={hexClick}
								displayIndex={true}
								preventHexHover={false}
								preventHexPlacementHover={true}
								flashOccupied={flashOccupied}
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
			<aside className="alchemy-right-panel" onContextMenu={(e: React.MouseEvent) => {}}>
				<RecipeDisplay recipe={recipe} quality={recipeQuality} currentElementScores={currentElementScores} />
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