import Link from 'next/link';
import './town.css';

export default function TownLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="town-layout">
			<img className="town-background" src="/art/landscape/town.png" alt="Town" />
			<aside className="town-nav-panel" aria-label="Town locations">
				<h1>TOWN NAME</h1>
				<h3>Locations:</h3>
				<ul>
					<li>
						<Link href="/hex/map/town/questBoard">Quest Board</Link>
					</li>
				</ul>
				<Link href="/hex/map" className="hover:underline"><h1>Back to Map</h1></Link>
			</aside>
			<main className="town-main-panel">
				<div className="town-content">{children}</div>
			</main>
		</div>
	);
}
