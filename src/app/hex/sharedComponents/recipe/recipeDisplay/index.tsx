'use client';
import { Recipe, RecipeElementScore } from '@/app/hex/architecture/typings';
import { ALCH_ELEMENT, ITEM_TAG } from '@/app/hex/architecture/enums';
import ItemTypeDisplay from '@/app/hex/sharedComponents/itemType/itemTypeDisplay';
import ElementIcon from '@/app/hex/sharedComponents/elementIcon/elementIcon';
import RewardLine from '@/app/hex/sharedComponents/recipe/rewardLine/rewardLine';
import styles from './recipeDisplay.module.css';

interface RecipeDisplayProps {
	recipe: Recipe;
	quality?: number;
	currentElementScores?: Record<ALCH_ELEMENT, {nodes: number, links: number}>;
	hideImage?: boolean;
}

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({recipe, quality, currentElementScores, hideImage = false}): JSX.Element => {
	const displaySize = 20;

	function getRecipeElements(): Array<JSX.Element> {
		return recipe.elementScores.map((elementScore: RecipeElementScore) => {
			return <div className="recipe-element" key={elementScore.element}>
				<ElementIcon element={elementScore.element} />
			</div>
		});
	}

	function getRewardLines(): Array<JSX.Element> {
		if(currentElementScores === undefined) {
			return [];
		}

		return recipe.elementScores.map((elementScore: RecipeElementScore) => {
			return <RewardLine key={elementScore.element}
				displaySize={displaySize}
				baseRecipe={recipe} 
				element={elementScore.element} 
				currentElementScore={currentElementScores[elementScore.element]} 
			/>
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
							{currentElementScores !== undefined && (
								<div className={styles.recipeElementScores}>
									{getRewardLines()}
								</div>
							)}
							{currentElementScores === undefined && (
								<div className={styles.recipeElements}>
									{getRecipeElements()}
								</div>
							)}
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
