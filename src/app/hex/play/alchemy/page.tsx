'use client'
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import AlchemyStoreSlice from '@/store/features/alchemySlice';
import { AlchComponent, Ingredient, IngredientBase } from '@/app/hex/architecture/typings';	
import HexGrid from '@/app/hex/play/components/hex/hexGrid';
import * as Helpers from '@/app/hex/architecture/helpers';
import ComponentCursorGhost from '@/app/hex/play/components/cursor';
import { IngedientBases } from '@/app/hex/architecture/data/ingedientBases';
import IngredientDisplay from '../components/ingredientDisplay';
import './alchemy.css';
import { HexTile, Position } from '../../architecture/interfaces';
import { AlchComponentDisplay } from '../components/alchComponent';

export default function Page() {
	const dispatch = useDispatch();
	const playGrid = useSelector((state: RootState) => state.Alchemy.playGrid);
	const placedComponents = useSelector((state: RootState) => state.Alchemy.placedComponents);
	const ingredients = useSelector((state: RootState) => state.Alchemy.ingredients);
	const cursorState = useSelector((state: RootState) => state.Alchemy.cursor);

	const [centerHexGridX, setCenterHexGridX] = useState<number>((window.innerWidth * 0.6) / 2);
	const [centerHexGridY, setCenterHexGridY] = useState<number>(window.innerHeight / 2);
	const [flashOccupied, setFlashOccupied] = useState(false);

	const testLayers = 6;
	const size = 40;
	const alchCompSize = 2 * Helpers.GetApothem(size);

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
			setCenterHexGridY(window.innerHeight / 2);
			setCenterHexGridX((window.innerWidth * 0.6) / 2);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

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
							{renderPlacedComponents()}
						</g>
					</svg>
				)}
				<ComponentCursorGhost displaySize={alchCompSize} />
			</main>
			<aside className="alchemy-right-panel" onContextMenu={(e: React.MouseEvent) => e.preventDefault()}>
			</aside>
		</div>
	);
}