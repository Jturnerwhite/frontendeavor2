'use client'
import { useState } from 'react';
import QuestBoard from '@/app/hex/map/components/questBoard';
import './town.css';

enum TOWN_LOC {
	ENTRANCE = 'Entrance',
	GROCER = 'Grocer',
	TAVERN = 'Tavern',
	SMITHY = 'Smithy',
	QUEST_BOARD = 'Quest Board',
}

export default function TownPage() {
	const [townLoc, setTownLoc] = useState<TOWN_LOC>(TOWN_LOC.ENTRANCE);

	return (<>
		<div className="town-layout">
			<img className="town-background" src="/art/landscape/town.png" alt="Town" />
			<aside className="town-nav-panel">
				<h1>TOWN NAME</h1>
				<h3>Locations:</h3>
				<ul>
					<li>Quest Board</li>
				</ul>
			</aside>
			<main className="town-main-panel">
				<div className="town-content">
					{townLoc === TOWN_LOC.QUEST_BOARD && (
						<QuestBoard/>
					)}
					<h1>Test</h1>
				</div>
			</main>
		</div>
	</>);
};
