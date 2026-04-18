'use client'

import type { AlchComponent, Item } from '@/app/hex/architecture/typings'
import AlchCompWithBacking from '@/app/hex/sharedComponents/alchComponent/alchCompWithBacking'
import './ingredient-display.css'

interface CraftedItemLabDisplayProps {
	item: Item
	displaySize?: number
	usePlaceable?: boolean
	compPlaced?: boolean[]
	onPickComponent?: (alchData: AlchComponent) => void
}

const CraftedItemLabDisplay: React.FC<CraftedItemLabDisplayProps> = ({
	item,
	displaySize = 30,
	usePlaceable = true,
	compPlaced = [],
	onPickComponent,
}): JSX.Element => {
	const title = item.baseRecipeId ? `${item.name} (${item.baseRecipeId})` : item.name

	function handlePickComponent(comp: AlchComponent, placed: boolean) {
		console.log('handlePickComponent', comp, placed)
		if(!placed) {
			onPickComponent && onPickComponent(comp)
		}
	}

	return (
		<div className="ingredient-display crafted-item-lab-display">
			<label>{title}</label>
			<hr className="ingredient-display-separator" />
			<div>
				{item.types.map((type) => (
					<small key={type}>{type} </small>
				))}
			</div>
			<div className="ingredient-display-comps">
				{item.comps.map((comp, compIndex) => {
					const placed = compPlaced.length > 0 ? compPlaced[compIndex] : false
					return (
						<AlchCompWithBacking
							key={`crafted-lab-${comp.id ?? compIndex}-${compIndex}`}
							keyString={`item-comp-${compIndex}`}
							additionalClassString={placed ? 'placed' : ''}
							alchData={comp}
							displaySize={displaySize}
							usePlaceable={usePlaceable}
							onPickComponent={() => handlePickComponent(comp, placed)}
						/>
					)
				})}
			</div>
		</div>
	)
}

export default CraftedItemLabDisplay
