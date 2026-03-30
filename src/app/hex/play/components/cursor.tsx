'use client'
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { useEffect, useState } from 'react';
import { AlchComponentDisplay } from '@/app/hex/play/components/alchComponent';
import AlchemyStoreSlice from '@/store/features/alchemySlice';

interface ComponentCursorGhostProps {
	defaultRotation?: number;
}

const ComponentCursorGhost: React.FC<ComponentCursorGhostProps> = ({ defaultRotation = 0 }): JSX.Element => {
	const dispatch = useDispatch();
	const cursorState = useSelector((state: RootState) => state.Alchemy.cursor);
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
		const handleRotate = (event: MouseEvent) => {
			if(event.button === 2) {
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation();
				dispatch(AlchemyStoreSlice.actions.setCursorRotation());
			}
		};

		window.addEventListener('mouseup', handleRotate);

		return () => {
			window.removeEventListener('mouseup', handleRotate);
		};
	}, []);

	if (!cursorState.isPlacing || !cursorState.selectedComponent)  {
		return (<></>);
	}

	return (
		<div style={{ 
		  position: 'fixed', 
		  left: cursorPosition.x,
		  top: cursorPosition.y,
		  pointerEvents: 'none',
		  transform: 'translate(-50%, -50%)'
		}}>
			<svg width="100" height="100">
				<AlchComponentDisplay 
					alchData={cursorState.selectedComponent}
					position={{ x: 50, y: 50 }}
					size={34.64}
					rotation={defaultRotation + (cursorState.rotation)}
				/>
			</svg>
		</div>
	  );
}

export default ComponentCursorGhost;