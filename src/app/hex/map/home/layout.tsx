import Link from 'next/link';
import { publicAsset } from '@/lib/publicAsset';
import './home.css';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="home-layout home-hub-layout">
			<img className="home-background" src={publicAsset('/art/landscape/town.png')} alt="" />
			<aside className="home-nav-panel" aria-label="Home">
				<h1>Home</h1>
				<ul>
					<li>
						<Link href="/hex/play/alchemy/selectRecipe">Craft</Link>
					</li>
					{/*<li><Link href="/hex/map/home/inventory">Inventory</Link></li>*/}
					<li>
						<Link href="/hex/encyclopedia">Encyclopedia</Link>
					</li>
					{/*<li><Link href="/hex/history">History</Link></li>*/}
					<li>
						<Link href="/hex/explanation">Help</Link>
					</li>
				</ul>
				<Link href="/hex/map" className="hover:underline">
					<h1>Back to Map</h1>
				</Link>
			</aside>
			<main className="home-main-panel">
				<div className="home-content home-hub-body">{children}</div>
			</main>
		</div>
	);
}
