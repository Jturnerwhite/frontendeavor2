'use client'
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useEffect, useState } from 'react';
import { AlchComponentDisplay } from '@/app/hex/sharedComponents/alchComponent';
import AlchemyStoreSlice from '@/store/features/alchemySlice';

interface ComponentCursorGhostProps {
	displaySize: number;
	defaultRotation?: number;
}

const ComponentCursorGhost: React.FC<ComponentCursorGhostProps> = ({ displaySize = 30, defaultRotation = 0 }): JSX.Element => {
	const dispatch = useAppDispatch();
	const cursorState = useAppSelector((state) => state.Alchemy.cursor);
	const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			setCursorPosition({ x: event.clientX, y: event.clientY });
		};

		window.addEventListener('mousemove', handleMouseMove);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
		};
	}, []);

	useEffect(() => {
		if (!cursorState.isPlacing || !cursorState.selectedComponent) {
			return;
		}

		const cancelPlacement = (e: Event) => {
			e.preventDefault();
			e.stopPropagation();
			dispatch(AlchemyStoreSlice.actions.resetCursor());
		};

		const onContextMenu = (e: MouseEvent) => {
			cancelPlacement(e);
		};

		const onWheel = (e: WheelEvent) => {
			if (e.deltaY === 0) return;
			e.preventDefault();
			e.stopPropagation();
			// Scroll down → clockwise (+1); scroll up → counter-clockwise (-1)
			const delta = e.deltaY > 0 ? 1 : -1;
			dispatch(AlchemyStoreSlice.actions.adjustCursorRotation(delta));
		};

		window.addEventListener('contextmenu', onContextMenu, true);
		window.addEventListener('wheel', onWheel, { passive: false, capture: true });

		return () => {
			window.removeEventListener('contextmenu', onContextMenu, true);
			window.removeEventListener('wheel', onWheel, { capture: true } as AddEventListenerOptions);
		};
	}, [cursorState.isPlacing, cursorState.selectedComponent, dispatch]);

	if (!cursorState.isPlacing || !cursorState.selectedComponent)  {
		return (<></>);
	}

	return (
		<div 
		className="component-cursor-ghost"
		style={{ 
		  position: 'fixed', 
		  left: cursorPosition.x,
		  top: cursorPosition.y,
		  pointerEvents: 'none',
		  transform: 'translate(-50%, -50%)',
		  width: displaySize * 4,
		  height: displaySize * 4,
		}}>
			<svg width={displaySize * 4} height={displaySize * 4}>
				<AlchComponentDisplay 
					alchData={cursorState.selectedComponent}
					position={{ x: displaySize*2, y: displaySize*2 }}
					size={displaySize}
					rotation={defaultRotation + (cursorState.rotation)}
				/>
			</svg>
		</div>
	  );
}

export default ComponentCursorGhost;
