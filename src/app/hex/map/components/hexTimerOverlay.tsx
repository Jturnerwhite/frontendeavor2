'use client';

import { useEffect, useId, useRef, useState } from 'react';
import * as SVGHelpers from '@/app/hex/architecture/helpers/svgHelpers';
import type { Position } from '@/app/hex/architecture/interfaces';
import { ALCH_RADIAL_WHITE_ROSE_GRADIENT_ID } from '@/app/hex/sharedComponents/alchComponent/AlchSvgDefs';

interface HexTimerOverlayProps {
	hexIndex: string;
	position: Position;
	size: number;
	/** Countdown length in milliseconds; overlay goes from full to wiped over this duration. */
	duration: number;
	/** Wall-clock (`Date.now()`) when the cooldown began; defaults to mount time. Enables resume across remounts. */
	startedAt?: number;
	/** Fires exactly once when the wipe completes so the parent can drop tracking state. */
	onComplete?: (hexIndex: string) => void;
}

function fmt(n: number) {
	return parseFloat(n.toFixed(4));
}

/**
 * Pie sector from hex center, measured clockwise from 12 o'clock (screen coords),
 * covering `p` of a full turn (0..1). Used as clipPath so the overlay remains only in this wedge.
 */
function buildClockwiseSectorPath(cx: number, cy: number, radius: number, p: number): string {
	const sweep = 2 * Math.PI * Math.max(0, Math.min(p, 1));
	if (sweep <= 1e-7) {
		return '';
	}
	// Angle u = 0 at top; increases clockwise: P(u) = (cx + R sin u, cy - R cos u)
	const x0 = cx + radius * Math.sin(0);
	const y0 = cy - radius * Math.cos(0);
	const x1 = cx + radius * Math.sin(sweep);
	const y1 = cy - radius * Math.cos(sweep);
	const largeArc = sweep > Math.PI ? 1 : 0;
	return `M ${fmt(cx)} ${fmt(cy)} L ${fmt(x0)} ${fmt(y0)} A ${fmt(radius)} ${fmt(radius)} 0 ${largeArc} 1 ${fmt(x1)} ${fmt(y1)} Z`;
}

/**
 * Pie sector from hex center, measured counter-clockwise from 12 o'clock (screen coords),
 * covering `p` of a full turn (0..1). Mirrors `buildClockwiseSectorPath` along the vertical axis.
 */
function buildCounterClockwiseSectorPath(cx: number, cy: number, radius: number, p: number): string {
	const sweep = 2 * Math.PI * Math.max(0, Math.min(p, 1));
	if (sweep <= 1e-7) {
		return '';
	}
	// Angle u = 0 at top; decreases counter-clockwise: P(u) = (cx - R sin u, cy - R cos u)
	const x0 = cx - radius * Math.sin(0);
	const y0 = cy - radius * Math.cos(0);
	const x1 = cx - radius * Math.sin(sweep);
	const y1 = cy - radius * Math.cos(sweep);
	const largeArc = sweep > Math.PI ? 1 : 0;
	// Sweep flag 0 so the arc travels counter-clockwise from top to the swept angle.
	return `M ${fmt(cx)} ${fmt(cy)} L ${fmt(x0)} ${fmt(y0)} A ${fmt(radius)} ${fmt(radius)} 0 ${largeArc} 0 ${fmt(x1)} ${fmt(y1)} Z`;
}

/** Radius large enough to cover the hex from its center (circumradius = size). */
function clipRadius(size: number) {
	return size * 2.75;
}

function computeRemaining(startedAt: number, duration: number, now: number) {
	const elapsed = now - startedAt;
	return Math.max(0, 1 - elapsed / Math.max(duration, 1));
}

function HexTimerOverlay({ hexIndex, position, size, duration, startedAt, onComplete }: HexTimerOverlayProps) {
	const reactId = useId().replace(/:/g, '');
	const clipId = `hex-timer-${hexIndex}-${reactId}`;
	// Pin start on mount when no explicit timestamp given so repaints don't re-seed the clock.
	const startRef = useRef(startedAt ?? Date.now());
	if (startedAt !== undefined && startRef.current !== startedAt) {
		startRef.current = startedAt;
	}
	const [remaining, setRemaining] = useState(() => computeRemaining(startRef.current, duration, Date.now()));
	const completedRef = useRef(false);
	const onCompleteRef = useRef(onComplete);

	useEffect(() => {
		onCompleteRef.current = onComplete;
	}, [onComplete]);

	useEffect(() => {
		let raf = 0;

		const tick = () => {
			const next = computeRemaining(startRef.current, duration, Date.now());
			setRemaining(next);
			if (next > 0) {
				raf = requestAnimationFrame(tick);
			} else if (!completedRef.current) {
				completedRef.current = true;
				onCompleteRef.current?.(hexIndex);
			}
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [duration, hexIndex, startedAt]);

	if (remaining <= 0) {
		return null;
	}

	const overlayPoints = SVGHelpers.GetHexPoints(position, size);
	const R = clipRadius(size);
	const nearlyFull = remaining >= 0.999;
	const sectorPath = nearlyFull ? '' : buildCounterClockwiseSectorPath(position.x, position.y, R, remaining);
	if (!nearlyFull && !sectorPath) {
		return null;
	}

	return (
		<>
			{!nearlyFull && sectorPath ? (
				<defs>
					<clipPath id={clipId} clipPathUnits="userSpaceOnUse">
						<path d={sectorPath} />
					</clipPath>
				</defs>
			) : null}
			<polygon
				points={overlayPoints}
				fill={`url(#${ALCH_RADIAL_WHITE_ROSE_GRADIENT_ID})`}
				opacity={0.5}
				clipPath={!nearlyFull && sectorPath ? `url(#${clipId})` : undefined}
				style={{
					userSelect: 'none',
					pointerEvents: 'none',
				}}
			/>
		</>
	);
}

export default HexTimerOverlay;
