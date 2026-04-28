import { ALCH_ELEMENT } from "@/app/hex/architecture/enums";
import { AlchComponent, ItemAspectComp, Recipe } from "@/app/hex/architecture/typings";
import * as Helpers from '@/app/hex/architecture/helpers/alchHelpers';
import ElementIcon from '@/app/hex/sharedComponents/elementIcon/elementIcon';
import AlchCompWithBacking from "@/app/hex/sharedComponents/alchComponent/alchCompWithBacking";
import PossibleComps from "@/app/hex/sharedComponents/alchComponent/possibleComps";
import styles from './rewardLine.module.css';

interface RewardLineProps {
	displaySize: number;
	baseRecipe: Recipe;
	element: ALCH_ELEMENT;
	currentElementScore: { nodes: number, links: number }|undefined;
}

const RewardLine: React.FC<RewardLineProps> = ({ displaySize, baseRecipe, element, currentElementScore }): JSX.Element => {
	const baseGoalsAndRewards = baseRecipe.goalsAndRewards[element];
	const elementScore = baseRecipe.elementScores.find((es) => es.element === element)!;
	const currentNodes = currentElementScore?.nodes ?? 0;
	const currentLinks = currentElementScore?.links ?? 0;
	const activeScore = Math.min(currentNodes, elementScore.softCap + currentLinks);
	const hasActiveScore = currentElementScore !== undefined;
	const isCompReward = baseGoalsAndRewards?.some((g) => g.reward.type === 'component');
	const sortedGoalsAndRewards = baseGoalsAndRewards ? [...baseGoalsAndRewards].sort((a, b) => b.goal - a.goal) : [];
	let highestCompletedGoal = sortedGoalsAndRewards.find((g) => g.goal <= activeScore)?.reward;

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

	function getCurrentElementScoreLine(): JSX.Element {
		const output:Array<JSX.Element> = [];
		const goalIndexes = baseGoalsAndRewards!.map((g) => g.goal) ?? [];
		for(let i = 0; i < elementScore.cap; i++) {
			let classString = 'node ' + element.toLowerCase().replace(/\s+/g, "-");
			if(i >= elementScore.softCap + (currentLinks)) {
				if(!hasActiveScore || (i > currentLinks)) {
					classString += ' locked';
				} else if(hasActiveScore && i < currentNodes) {
					classString += ' filled';
				}
			} else if(hasActiveScore && i < currentNodes) {
				classString += ' filled';
			}

			if(goalIndexes.includes(i+1)) {
				classString += ' goal';
			}

			output.push(<span key={i} className={classString}></span>);
		}
		return <div className={styles.elementScoreNodes}>
			{output}
		</div>;
	}

	function getResultingCompDisplay(resultingComp: AlchComponent, index: number): JSX.Element {
		if(resultingComp === undefined) {
			return <></>;
		}
		return <AlchCompWithBacking keyString={element + '-resulting-comp-' + index} alchData={resultingComp} displaySize={displaySize} />;
	}

	function getPossibleCompsDisplay(element: ALCH_ELEMENT): JSX.Element {
		const rows = baseGoalsAndRewards;
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
				keyString={baseRecipe.id + '-possible-comps-' + element} 
				possibleComps={tiers} 
				displaySize={displaySize} />
		);
	}

	function getCompDisplay(): JSX.Element {
		if(!hasActiveScore) {
			return <></>;
		}
		const resultingComp = Helpers.GetResultingComponent(baseRecipe, elementScore!, currentNodes, currentLinks);

		return (<>
				{currentElementScore && resultingComp && <>
					{getResultingCompDisplay(resultingComp, 0)}
				</>}
				{!currentElementScore && isCompReward && <>
					{getPossibleCompsDisplay(element)}
				</>}
		</>);
	}

	return (<>
		<div className={styles.elementScoreLine} key={element}>
			<label className={styles.elementScoreLabel}><ElementIcon element={element} /></label>
			<div className={styles.elementScoreAndReward}>
				<label className={styles.elementRewardLabel} title={highestCompletedGoal?.description ?? ''}>{highestCompletedGoal?.name ?? 'None'}</label>
				{getCurrentElementScoreLine()}
			</div>
			{isCompReward && (
				<div className={styles.elementCompDisplay}>
					{getCompDisplay()}
				</div>
			)}
		</div>
	</>);
};

export default RewardLine;
