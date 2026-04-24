'use client';
import {
	AlchComponent,
	Ingredient,
	ItemAspectComp,
	Recipe,
	RecipeElementScore,
} from '@/app/hex/architecture/typings';
import { ALCH_ELEMENT, ITEM_TAG } from '@/app/hex/architecture/enums';
import AlchCompWithBacking from '@/app/hex/sharedComponents/alchComponent/alchCompWithBacking';
import * as Helpers from '@/app/hex/architecture/helpers/alchHelpers';
import styles from './recipeDisplay.module.css';
import PossibleComps from '@/app/hex/sharedComponents/alchComponent/possibleComps';
import ItemTypeDisplay from '@/app/hex/sharedComponents/itemType/itemTypeDisplay';
import { playerMeetsRequirement } from '@/app/hex/architecture/helpers/recipeRequirements';
import ElementIcon from '@/app/hex/sharedComponents/elementIcon/elementIcon';

interface RecipeDisplayProps {
	recipe: Recipe;
	quality?: number;
	currentElementScores?: Record<ALCH_ELEMENT, {nodes: number, links: number}>;
	hideImage?: boolean;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({recipe, quality, currentElementScores, hideImage = false}): JSX.Element => {
	const displaySize = 20;

	function getCurrentElementScore(element: ALCH_ELEMENT): JSX.Element {
		const eleToCheck = recipe.elementScores.find((elementScore: RecipeElementScore) => elementScore.element === element);
		if(eleToCheck === undefined || (currentElementScores !== undefined && currentElementScores?.[element] === undefined)) {
			return <></>;
		}
		const output:Array<JSX.Element> = [];
		const matchingScore = currentElementScores?.[element];
		for(let i = 0; i < eleToCheck.cap; i++) {
			let classString = 'node ' + element.toLowerCase().replace(/\s+/g, "-");
			if(i >= eleToCheck.softCap + (matchingScore?.links ?? 0)) {
				if(matchingScore === undefined || (i > matchingScore.links)) {
					classString += ' locked';
				} else if(matchingScore !== undefined && i < matchingScore.nodes) {
					classString += ' filled';
				}
			} else if(matchingScore !== undefined && i < matchingScore.nodes) {
				classString += ' filled';
			}
			output.push(<span key={i} className={classString}></span>);
		}
		return <div className={styles.elementScoreLine}>
			{output}
		</div>;
	}

	function getResultingCompDisplay(resultingComp: AlchComponent, index: number): JSX.Element {
		if(resultingComp === undefined) {
			return <></>;
		}
		return <AlchCompWithBacking keyString={recipe.id + '-resulting-comp-' + index} alchData={resultingComp} displaySize={displaySize} />;
	}

	function aspectValueToAlchComponent(value: unknown): AlchComponent | null {
		if (
			typeof value === 'object' &&
			value !== null &&
			'shape' in value &&
			'element' in value
		) {
			const v = value as ItemAspectComp;
			return { element: v.element, shape: v.shape, linkSpots: v.linkSpots };
		}
		return null;
	}

	function getPossibleCompsDisplay(element: ALCH_ELEMENT): JSX.Element {
		const rows = recipe.goalsAndRewards[element];
		const tiers = (rows ?? [])
			.filter((g) => g.reward.type === 'component' && g.reward.value != null)
			.sort((a, b) => a.goal - b.goal)
			.map((g) => aspectValueToAlchComponent(g.reward.value))
			.filter((c): c is AlchComponent => c !== null);

		if (tiers.length === 0) {
			return <></>;
		}

		return (
			<PossibleComps 
				keyString={recipe.id + '-possible-comps-' + element} 
				possibleComps={tiers} 
				displaySize={displaySize} />
		);
	}

	function getElementScores(): Array<JSX.Element> {
		let resultingComponents:Array<AlchComponent> = [];
		if(currentElementScores !== undefined) {
			resultingComponents = Helpers.GetResultingComponents(recipe, currentElementScores);
		}
		return recipe.elementScores.map((elementScore: RecipeElementScore, index: number) => {
			let matchinElementComp = resultingComponents.find((component: AlchComponent) => component.element === elementScore.element);
			return <div className={styles.elementScore} key={elementScore.element}>
				<div className={styles.elementScoreLine}>
					<label className={styles.elementScoreLabel}><ElementIcon element={elementScore.element} /></label>
					{getCurrentElementScore(elementScore.element)}
				</div>
				<div className="element-comp-display">
					{currentElementScores && matchinElementComp !== undefined && <>
						{getResultingCompDisplay(matchinElementComp, index)}
					</>}
					{!currentElementScores && Object.values(recipe.goalsAndRewards).some((rows) =>
						rows?.some((g) => g.reward.type === 'component'),
					) && <>
						{getPossibleCompsDisplay(elementScore.element)}
					</>}
				</div>
			</div>
		});
	}

	function getRecipeElements(): Array<JSX.Element> {
		return recipe.elementScores.map((elementScore: RecipeElementScore) => {
			return <div className="recipe-element" key={elementScore.element}>
				<ElementIcon element={elementScore.element} />
			</div>
		});
	}

	return (
		<div className={styles.displayOuter}>
			<div className={styles.card}>
				<div className={styles.displayInner}>
					<div className={styles.header}>
						<h1>{recipe.description}</h1>
					</div>
					<div className={styles.cardInner}>
						<div className={styles.cardUpper}>
							{!hideImage && (
								<div className={styles.image}>
									{recipe.image && (<img src={recipe.image} alt={recipe.description} />)}
								</div>
							)}
							{false && (
								<div className={styles.content}>
									{false && quality !== undefined && (
										<div className="recipe-completion-line">
											<label>Quality: </label>
											<label>{quality}</label>
										</div>
									)}
									<div className={styles.recipeElementScores}>
										{getElementScores()}
									</div>
								</div>
							)}
							<div className={styles.recipeElements}>
								{getRecipeElements()}
							</div>
						</div>
						<div className={styles.types}>
							{recipe.types.map((type: ITEM_TAG) => (
								<ItemTypeDisplay key={type} itemType={type} />
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RecipeDisplay;
