'use client';

type LineStrainIndicatorProps = {
	/** 0–100 */
	strain: number;
};

export function LineStrainIndicator({ strain }: LineStrainIndicatorProps) {
	const s = Math.min(100, Math.max(0, strain));
	const strainHue = 120 - s * 1.5;
	const strainBg = `hsl(${strainHue}, 82%, 46%)`;

	return (
		<div className="fishing-strain-wrap">
			<div className="fishing-strain-label">Line strain ({`${Math.floor(s)}%`})</div>
			<div className="fishing-strain-track">
				<div
					className="fishing-strain-fill"
					style={{ width: `100%`, background: strainBg }}
				/>
			</div>
		</div>
	);
}
