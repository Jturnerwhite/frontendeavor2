'use client'
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import AlchComponentDisplay from './alchComponent';


const ItemDisplay: React.FC = (): JSX.Element => {
	const cursorState = useSelector((state: RootState) => state.Alchemy.cursor);

	if (!cursorState.isPlacing || !cursorState.selectedComponent) 
		return (<></>);

	return (
		<div style={{ 
		  position: 'fixed', 
		  left: cursorState.position.x,
		  top: cursorState.position.y,
		  pointerEvents: 'none',
		  transform: 'translate(-50%, -50%)'
		}}>
		  <AlchComponentDisplay 
			alchData={cursorState.selectedComponent}
			position={{ x: 0, y: 0 }}
			size={40}
			rotation={cursorState.rotation}
		  />
		</div>
	  );
}

export default ItemDisplay;