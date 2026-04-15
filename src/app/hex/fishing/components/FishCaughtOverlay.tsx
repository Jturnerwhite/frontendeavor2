'use client';

type FishCaughtOverlayProps = {
	name: string;
	quality: number;
	image?: string;
	/** When false, only “End” (e.g. no fish left in the pond). */
	canContinueFishing: boolean;
	onContinueFishing: () => void;
	onEndToMap: () => void;
};

export function FishCaughtOverlay({
	name,
	quality,
	image,
	canContinueFishing,
	onContinueFishing,
	onEndToMap,
}: FishCaughtOverlayProps) {
	return (
		<div className="fishing-caught-overlay">
			<div className="fishing-caught-card">
				{image ? <img src={image} alt="" /> : <div style={{ height: 96 }} />}
				<h3>{name}</h3>
				<p className="fishing-caught-meta">Quality: {quality}%</p>
				<div className="fishing-caught-actions">
					{canContinueFishing ? (
						<button type="button" className="fishing-btn-primary" onClick={onContinueFishing}>
							Continue fishing
						</button>
					) : (
						<button type="button" className="fishing-btn-primary" onClick={onEndToMap}>
							End
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
