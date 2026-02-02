'use client'
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { AlchComponentDisplay } from '@/app/hex/play/components/alchComponent';
import { useEffect, useState } from 'react';

const ComponentCursorGhost: React.FC = (): JSX.Element => {
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
					rotation={cursorState.rotation}
				/>
			</svg>
		</div>
	  );
}

export default ComponentCursorGhost;