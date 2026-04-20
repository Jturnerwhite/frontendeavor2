'use client';

import { AlchComponent, IngredientBase, IngredientCompSpec } from '@/app/hex/architecture/typings';
import { IngredientBases } from '@/app/hex/architecture/data/ingredientBases';
import { AlchComponentDisplay } from '@/app/hex/sharedComponents/alchComponent';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import '@/app/hex/encyclopedia/encyclopedia.css';

function compKey(baseName: string, compIndex: number) {
	return `${baseName}-${compIndex}`;
}

export default function Page() {
	const [counter, setCounter] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCounter((prev) => (prev > 5 ? 0 : prev + 1));
		}, 500);

		return () => clearInterval(interval);
	}, []);

	function renderComponentSlots(base: IngredientBase): React.ReactNode[] {
		return base.possibleComps.map((compOrSpec, compIndex) => {
			if (
				'possibleShapes' in compOrSpec &&
				compOrSpec.possibleShapes !== undefined &&
				compOrSpec.possibleShapes.length > 0
			) {
				const spec = compOrSpec as IngredientCompSpec;
				const shapeIndex =
					counter < spec.possibleShapes.length ? counter : spec.possibleShapes.length - 1;
				const alchData = {
					element: spec.element,
					shape: spec.possibleShapes.at(shapeIndex),
				} as AlchComponent;
				return (
					<svg
						key={compKey(base.name, compIndex)}
						className="encyclopedia-comp-slot"
						width={100}
						height={100}
					>
						<AlchComponentDisplay alchData={alchData} position={{ x: 50, y: 50 }} size={30} rotation={0} />
					</svg>
				);
			}
			return (
				<svg
					key={compKey(base.name, compIndex)}
					className="encyclopedia-comp-slot"
					width={100}
					height={100}
				>
					<AlchComponentDisplay
						alchData={compOrSpec as AlchComponent}
						position={{ x: 50, y: 50 }}
						size={30}
						rotation={0}
					/>
				</svg>
			);
		});
	}

	const bases = Object.values(IngredientBases);

	return (
		<div className="encyclopedia-root">
			<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-12 lg:py-14">
				<header className="mb-10 flex flex-row items-start justify-between gap-4 sm:mb-12 sm:gap-8">
					<div className="min-w-0 flex-1 text-balance text-center md:text-left">
						<h1 className="encyclopedia-title">Encyclopedia</h1>
						<p className="encyclopedia-subtitle mx-auto md:mx-0">
							Ingredient bases and possible component shapes (cycles for multi-shape specs).
						</p>
					</div>
					<nav
						className="encyclopedia-back encyclopedia-back--top shrink-0 pt-1 text-right sm:pt-0.5"
						aria-label="Page navigation"
					>
						<Link href="/hex/map/home">Back to home</Link>
					</nav>
				</header>

				<div className="flex flex-col gap-10 md:gap-12">
					{bases.map((base) => (
						<section key={base.name} aria-labelledby={`ency-base-${base.name.replace(/\s+/g, '-')}`}>
							<h2 id={`ency-base-${base.name.replace(/\s+/g, '-')}`} className="encyclopedia-section-heading">
								{base.name}
							</h2>
							<div className="encyclopedia-card p-5 sm:p-6 md:p-7">
								<p className="encyclopedia-prose encyclopedia-meta">
									Types: {base.types.join(', ')}
								</p>
								<div className="encyclopedia-comp-grid">{renderComponentSlots(base)}</div>
							</div>
						</section>
					))}
				</div>
			</div>
		</div>
	);
}
