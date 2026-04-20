'use client';

import { AlchComponent, IngredientBase, IngredientCompSpec } from '@/app/hex/architecture/typings';
import { IngredientBases } from '@/app/hex/architecture/data/ingredientBases';
import { Recipes } from '@/app/hex/architecture/data/recipes';
import { AlchComponentDisplay } from '@/app/hex/sharedComponents/alchComponent';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import '@/app/hex/encyclopedia/encyclopedia.css';
import { ComplexInventoryItem } from '@/app/hex/sharedComponents/itemDisplay/lineItem';

const TABS = [
	{ id: 'ingredients' as const, label: 'Ingredients' },
	{ id: 'items' as const, label: 'Items' },
	{ id: 'equipment' as const, label: 'Equipment' },
];

type TabId = (typeof TABS)[number]['id'];

function compKey(baseName: string, compIndex: number) {
	return `${baseName}-${compIndex}`;
}

function slugId(raw: string) {
	return raw.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_-]/g, '');
}

export default function Page() {
	const [counter, setCounter] = useState(0);
	const [activeTab, setActiveTab] = useState<TabId>('ingredients');

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
							Ingredient bases, craftable recipes, and equipment reference.
						</p>
					</div>
					<nav
						className="encyclopedia-back encyclopedia-back--top shrink-0 pt-1 text-right sm:pt-0.5"
						aria-label="Page navigation"
					>
						<Link href="/hex/map/home">Back to home</Link>
					</nav>
				</header>

				<div
					className="encyclopedia-tabs"
					role="tablist"
					aria-label="Encyclopedia categories"
				>
					{TABS.map((tab) => {
						const selected = activeTab === tab.id;
						return (
							<button
								key={tab.id}
								type="button"
								role="tab"
								id={`ency-tab-${tab.id}`}
								aria-selected={selected}
								aria-controls={`ency-panel-${tab.id}`}
								tabIndex={selected ? 0 : -1}
								className={`encyclopedia-tab${selected ? ' encyclopedia-tab--active' : ''}`}
								onClick={() => setActiveTab(tab.id)}
							>
								{tab.label}
							</button>
						);
					})}
				</div>

				<div
					id="ency-panel-ingredients"
					role="tabpanel"
					aria-labelledby="ency-tab-ingredients"
					hidden={activeTab !== 'ingredients'}
					className="flex flex-col gap-10 md:gap-2"
				>
					{activeTab === 'ingredients' && bases.map((base) => (
						<section key={base.name} aria-labelledby={`ency-base-${slugId(base.name)}`}>
							<ComplexInventoryItem
								items={[base]}
								displaySize={20}
								hideDescription={true}
								hideFiltering={true}
								hideSorting={true}
							/>
							{/*
							<h2 id={`ency-base-${slugId(base.name)}`} className="encyclopedia-section-heading">
								{base.name}
							</h2>
							<div className="encyclopedia-card p-5 sm:p-6 md:p-7">
								<p className="encyclopedia-prose encyclopedia-meta">
									Types: {base.types.join(', ')}
								</p>
								<div className="encyclopedia-comp-grid">{renderComponentSlots(base)}</div>
							</div>
							*/}
						</section>
					))}
				</div>

				<div
					id="ency-panel-items"
					role="tabpanel"
					aria-labelledby="ency-tab-items"
					hidden={activeTab !== 'items'}
					className="flex flex-col gap-10 md:gap-2"
				>
					{activeTab === 'items' && Recipes.map((recipe) => (
						<section key={recipe.id} aria-labelledby={`ency-recipe-${slugId(recipe.id)}`}>
							<ComplexInventoryItem
								items={[recipe]}
								displaySize={20}
								hideDescription={true}
								hideFiltering={true}
								hideSorting={true}
							/>
							{/*
							<h2 id={`ency-recipe-${slugId(recipe.id)}`} className="encyclopedia-section-heading">
								{recipe.description}
							</h2>
							<div className="encyclopedia-card p-5 sm:p-6 md:p-7">
								<div className="encyclopedia-recipe-row">
									{recipe.image ? (
										<img
											className="encyclopedia-recipe-thumb"
											src={recipe.image}
											alt=""
											width={72}
											height={72}
										/>
									) : null}
									<div className="min-w-0 flex-1">
										<p className="encyclopedia-prose encyclopedia-meta">ID: {recipe.id}</p>
										<p className="encyclopedia-prose encyclopedia-meta">
											Tags: {recipe.types.join(', ')}
										</p>
									</div>
								</div>
							</div>
							*/}
						</section>
					))}
				</div>

				<div
					id="ency-panel-equipment"
					role="tabpanel"
					aria-labelledby="ency-tab-equipment"
					hidden={activeTab !== 'equipment'}
				>
					<div className="encyclopedia-card p-5 sm:p-6 md:p-7">
						<p className="encyclopedia-empty">No equipment entries yet.</p>
					</div>
				</div>
			</div>
		</div>
	);
}
