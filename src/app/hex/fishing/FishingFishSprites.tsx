import { SILHOUETTE_SRC, type WaterFish } from '@/app/hex/fishing/fishingUtils';

type NormPos = { x: number; y: number };

export function FishingFishSprites({
	fishes,
	bundlePos,
}: {
	fishes: WaterFish[];
	bundlePos: NormPos | null;
}) {
	return (
		<>
			{fishes.map((fish) => {
				const pos =
					fish.hooked && bundlePos ? bundlePos : { x: fish.x, y: fish.y };
				const deg = (fish.headingRad * 180) / Math.PI;
				const tf = fish.hooked
					? `translate(calc(-50% - 22px), -50%) rotate(${deg}deg)`
					: `translate(-50%, -50%) rotate(${deg}deg)`;
				return (
					<img
						key={fish.id}
						className={'fishing-fish' + (fish.hooked ? ' fishing-fish--hooked' : '')}
						src={SILHOUETTE_SRC[fish.silhouette]}
						alt=""
						draggable={false}
						style={{
							left: `${pos.x * 100}%`,
							top: `${pos.y * 100}%`,
							transform: tf,
						}}
					/>
				);
			})}
		</>
	);
}
