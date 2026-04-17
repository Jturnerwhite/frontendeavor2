import Link from 'next/link';
import { publicAsset } from '@/lib/publicAsset';
import '../town/town.css';
import './home.css';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="town-layout home-hub-layout">
			<img className="town-background" src={publicAsset('/art/landscape/town.png')} alt="" />
			<aside className="town-nav-panel" aria-label="Home">
				<h1>Home</h1>
				<h3>Where to?</h3>
				<ul>
					<li>
						<Link href="/hex/play/alchemy/selectRecipe">Craft</Link>
					</li>
					<li>
						<Link href="/hex/map/home/inventory">Inventory</Link>
					</li>
					<li>
						<Link href="/hex/encyclopedia">Encyclopedia</Link>
					</li>
					<li>
						<Link href="/hex/history">History</Link>
					</li>
					<li>
						<Link href="/hex/explanation">Explanation</Link>
					</li>
				</ul>
				<Link href="/hex/map" className="hover:underline">
					<h1>Back to Map</h1>
				</Link>
			</aside>
			<main className="town-main-panel">
				<div className="town-content home-hub-body">{children}</div>
			</main>
		</div>
	);
}
