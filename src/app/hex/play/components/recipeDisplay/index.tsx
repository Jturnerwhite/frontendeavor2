'use client';
import { AlchComponent, Ingredient, Recipe, RecipeElementScore, RecipeResultingComponent } from '@/app/hex/architecture/typings';
import { ALCH_ELEMENT, ITEM_TAG } from '@/app/hex/architecture/enums';
import AlchCompWithBacking from '@/app/hex/sharedComponents/alchComponent/alchCompWithBacking';
import * as Helpers from '@/app/hex/architecture/helpers/alchHelpers';
import './recipe-display.css';
import PossibleComps from '@/app/hex/sharedComponents/alchComponent/possibleComps';
import ItemTypeDisplay from '@/app/hex/sharedComponents/itemType/itemTypeDisplay';
import { playerMeetsRequirement } from '@/app/hex/architecture/helpers/recipeRequirements';

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
			if(i >= eleToCheck.softCap) {
				if(matchingScore === undefined || i > matchingScore.links) {
					classString += ' locked';
				} else if(matchingScore !== undefined && i < matchingScore.nodes) {
					classString += ' filled';
				}
			} else if(matchingScore !== undefined && i < matchingScore.nodes) {
				classString += ' filled';
			}
			output.push(<span key={i} className={classString}></span>);
		}
		return <div className="element-score-line">
			{output}
		</div>;
	}

	function getResultingCompDisplay(resultingComp: AlchComponent, index: number): JSX.Element {
		if(resultingComp === undefined) {
			return <></>;
		}
		return <AlchCompWithBacking keyString={recipe.id + '-resulting-comp-' + index} alchData={resultingComp} displaySize={displaySize} />;
	}

	function getPossibleCompsDisplay(element: ALCH_ELEMENT): JSX.Element {
		let setToUse: Array<RecipeResultingComponent> = [];

		recipe.resultingComponents.forEach((eleSet: Array<RecipeResultingComponent>) => {
			if(eleSet[0].element === element) {
				setToUse = eleSet;
			}
		});

		return (
			<PossibleComps 
				keyString={recipe.id + '-possible-comps-' + element} 
				possibleComps={setToUse} 
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
			return <div className="element-score" key={elementScore.element}>
				<div className="element-score-line">
					<label className="element-score-label">{elementScore.element}: </label>
					{getCurrentElementScore(elementScore.element)}
				</div>
				<div className="element-comp-display">
					{currentElementScores && matchinElementComp !== undefined && <>
						{getResultingCompDisplay(matchinElementComp, index)}
					</>}
					{!currentElementScores && recipe.resultingComponents.length > 0 && <>
						{getPossibleCompsDisplay(elementScore.element)}
					</>}
				</div>
			</div>
		});
	}

	return (
		<div className="recipe-display">
			<div className="recipe-card">
				<div className="recipe-display">
					<div className="recipe-display-header">
						<h1>{recipe.description}</h1>
					</div>
					<div className="recipe-card-inner">
						<div className="recipe-card-upper">
							{!hideImage && (
								<div className="recipe-display-image">
									{recipe.image && (<img src={recipe.image} alt={recipe.description} />)}
								</div>
							)}
							<div className="recipe-display-content">
								{false && quality !== undefined && (
									<div className="recipe-completion-line">
										<label>Quality: </label>
										<label>{quality}</label>
									</div>
								)}
								<div className="recipe-element-scores">
									{getElementScores()}
								</div>
							</div>
						</div>
						<div className="recipe-display-types">
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
