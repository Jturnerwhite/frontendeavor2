'use client';

type FishLostOverlayProps = {
	canContinueFishing: boolean;
	onContinueFishing: () => void;
	onEndToMap: () => void;
};

export function FishLostOverlay({
	canContinueFishing,
	onContinueFishing,
	onEndToMap,
}: FishLostOverlayProps) {
	return (
		<div className="fishing-caught-overlay">
			<div className="fishing-caught-card fishing-caught-card--got-away">
				<h3>Fish got away</h3>
				<p className="fishing-caught-meta fishing-caught-meta--muted">
					The line broke or the fish reached open water.
				</p>
				<div className="fishing-caught-actions">
					{canContinueFishing ? (
						<>
							<button type="button" onClick={onEndToMap}>
								End
							</button>
							<button type="button" className="fishing-btn-primary" onClick={onContinueFishing}>
								Continue fishing
							</button>
						</>
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
