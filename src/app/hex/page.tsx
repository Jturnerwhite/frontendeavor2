import Link from 'next/link'

export default function Page() {
	return <>
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<h1>Alchahexy</h1>
				<Link href="/hex/map" className="hover:underline"><h1>Map</h1></Link>
				<Link href="/hex/play/alchemy/selectRecipe" className="hover:underline"><h1>Play</h1></Link>
				<Link href="/hex/encyclopedia" className="hover:underline"><h1>Encyclopedia</h1></Link>
				<Link href="/hex/history" className="hover:underline"><h1>History</h1></Link>
				<button>Explanation</button>
			</main>
			<footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
				<small>derpderp all derps and derps @ 2024</small>
			</footer>
		</div>
	</>;
}