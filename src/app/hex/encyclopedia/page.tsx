'use client'
import { AlchComponent, IngredientBase, IngredientCompSpec } from "@/app/hex/architecture/typings";
import { IngedientBases } from '@/app/hex/architecture/data/ingedientBases';
import { AlchComponentDisplay } from "../play/components/alchComponent";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Page() {
	const [counter, setCounter] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCounter((prev) => {
				return (prev > 5) ? 0 : prev + 1
			});
		}, 500)

		return () => clearInterval(interval);
	}, []);

	function getIngredientBases():Array<JSX.Element> {
		let output:Array<JSX.Element> = [];
		IngedientBases.forEach((base:IngredientBase) => {
			let comps:Array<JSX.Element> = [];
			//console.log(base.name, base);
			base.possibleComps.forEach((compOrSpec, compIndex) => {
				//console.log(compOrSpec);
				if ('possibleShapes' in compOrSpec && compOrSpec.possibleShapes !== undefined && compOrSpec.possibleShapes.length > 0) { // It's an IngredientCompSpec
					let alchData = {
						element: compOrSpec.element,
						shape: compOrSpec.possibleShapes.at(counter < compOrSpec.possibleShapes.length ? counter : (compOrSpec.possibleShapes.length - 1))
					} as AlchComponent;
					comps.push(
						<svg key={base.name+"-"+compIndex}  width={100} height={100} style={{ position: "relative", display:"inline-block" }}>
							<AlchComponentDisplay alchData={alchData} position={{x:50, y:50}} size={30} rotation={0} />
						</svg>
					);
				} else {
					comps.push(
						<svg key={base.name+"-"+compIndex}  width={100} height={100} style={{ position: "relative", display:"inline-block" }}>
							<AlchComponentDisplay alchData={compOrSpec as AlchComponent} position={{x:50, y:50}} size={30} rotation={0} />
						</svg>
					);
				}
			});
			output.push(<div key={base.name}>
				<h2>{base.name}</h2>
				<div>{base.types.map((type) => <small key={base.name+"-"+type}>{ type }, </small>)}</div>
				{comps}
			</div>);
		});

		return output;
	}

	return <>
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<h1>Ingredient Types</h1>
				{getIngredientBases()}

				<Link href="/hex/" className="hover:underline"><h1>Return</h1></Link>
			</main>
			<footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
				<small>derpderp all derps and derps @ 2024</small>
			</footer>
		</div>
	</>;
	return <>
	</>;
}