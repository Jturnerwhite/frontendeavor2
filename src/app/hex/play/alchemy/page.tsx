'use client'
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import AlchemyStoreSlice from '@/store/features/alchemySlice';
import { AlchComponent, Ingredient, IngredientBase } from '@/app/hex/architecture/typings';	
import HexGrid from '@/app/hex/play/components/hexGrid';
import * as Helpers from '@/app/hex/architecture/helpers';
import ComponentCursorGhost from '@/app/hex/play/components/cursor';
import { IngedientBases } from '@/app/hex/architecture/data/ingedientBases';
import IngredientDisplay from '../components/ingredientDisplay';
import styles from './page.module.css';
import { HexTile, Position } from '../../architecture/interfaces';
import { AlchComponentDisplay } from '../components/alchComponent';

export default function Page() {
	const dispatch = useDispatch();
	const playGrid = useSelector((state: RootState) => state.Alchemy.playGrid);
	const placedComponents = useSelector((state: RootState) => state.Alchemy.placedComponents);
	const ingredients = useSelector((state: RootState) => state.Alchemy.ingredients);
	const cursorState = useSelector((state: RootState) => state.Alchemy.cursor);

	const [centerHexGrid, setCenterHexGrid] = useState<number>(window.innerHeight / 2);
	const [flashOccupied, setFlashOccupied] = useState(false);

	// To track window resize with React hooks
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight
	});

	const testLayers = 6;
	const size = 40;
	const alchCompSize = 2 * Helpers.GetApothem(size);

	const hexAreaWidth = windowSize.width * 0.7;
	const hexAreaCenterX = hexAreaWidth / 2;

	function hexClick(hex: HexTile, validTileHover: boolean) {
		if(!validTileHover) return;
		if(cursorState.isPlacing && cursorState.selectedComponent) {
			dispatch(AlchemyStoreSlice.actions.addPlacedComponent(hex));
		}
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

	useEffect(() => {
		if (playGrid === undefined) {
			dispatch(AlchemyStoreSlice.actions.setPlayGrid({ pos: { x:0, y:0 }, size, layers: testLayers }));
		}
		if (ingredients.length === 0) {
			let ingredients = IngedientBases.map((base:IngredientBase) => Helpers.CreateIngredient(base));
			dispatch(AlchemyStoreSlice.actions.addIngredients(ingredients));
		}
	}, []);

	useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight
			});
			setCenterHexGrid(window.innerHeight / 2);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div className={styles.layout}>
			<aside className={styles.asidePanel} onContextMenu={(e: React.MouseEvent) => e.preventDefault()}>
				{ingredients.length > 0 && ingredients.map((ingredient: Ingredient) => (
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
					className={styles.flashOccupiedButton}
					onClick={flashOccupiedTiles}
				>
					DEBUG:Flash occupied
				</button>
			</aside>
			<main className={styles.mainPanel} onContextMenu={(e: React.MouseEvent) => e.preventDefault()}>
				{playGrid && (
					<svg
						className={styles.hexSvg}
						width={hexAreaWidth}
						pointerEvents="none"
					>
						<g transform={`translate(${hexAreaCenterX} ${centerHexGrid})`}>
							<HexGrid
								hexMap={playGrid}
								radius={size}
								onHexClick={hexClick}
								displayIndex={true}
								preventHexHover={false}
								preventHexPlacementHover={true}
								flashOccupied={flashOccupied}
							/>
							{renderPlacedComponents()}
						</g>
					</svg>
				)}
				<ComponentCursorGhost displaySize={alchCompSize} />
			</main>
		</div>
	);
}