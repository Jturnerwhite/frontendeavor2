'use client';

import * as Helpers from '@/app/hex/architecture/helpers';
import AlchHexGrid from '@/app/hex/sharedComponents/hex/hexGrid';
import { Ingredient, Recipe, RecipeElementScore } from '@/app/hex/architecture/typings';
import { AlchComponentDisplay, PlaceableAlchComponent } from '@/app/hex/play/components/alchComponent';
import './recipe-display.css';
import { ALCH_ELEMENT } from '@/app/hex/architecture/enums';

interface RecipeDisplayProps {
	recipe: Recipe;
	quality?: number;
	currentElementScores?: Record<ALCH_ELEMENT, {nodes: number, links: number}>;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({recipe, quality, currentElementScores}): JSX.Element => {
	function getCurrentElementScore(element: ALCH_ELEMENT): JSX.Element {
		const eleToCheck = recipe.elementScores.find((elementScore: RecipeElementScore) => elementScore.element === element);
		if(eleToCheck === undefined || (currentElementScores !== undefined && currentElementScores?.[element] === undefined)) {
			return <></>;
		}
		const output:Array<JSX.Element> = [];
		const matchingScore = currentElementScores?.[element];
		for(let i = 0; i < eleToCheck.cap; i++) {
			let classString = 'node ' + element.toLowerCase().replace(/\s+/g, "-");
			if(i > eleToCheck.softCap) {
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
	function getElementScores(): Array<JSX.Element> {
		return recipe.elementScores.map((elementScore: RecipeElementScore) => {
			return <div className="recipe-completion-line" key={elementScore.element}>
				<label>{elementScore.element}: </label>
				{getCurrentElementScore(elementScore.element)}
			</div>
		});
	}

	return (
		<div className="recipe-display">
			<div className="recipe-display-header">
				<h1>{recipe.description}</h1>
			</div>
			<div className="recipe-display-content">
				{quality !== undefined && (
					<div className="recipe-completion-line">
						<label>Quality: </label>
						<label>{quality}</label>
					</div>
				)}
				{getElementScores()}
			</div>
		</div>
	);
};

export default RecipeDisplay;
