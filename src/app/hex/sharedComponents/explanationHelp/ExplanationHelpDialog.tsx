'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './explanationHelp.css';

export interface ExplanationHelpDialogProps {
	open: boolean;
	onClose: () => void;
	/** Shown in the dialog chrome (section still has its own heading) */
	title?: string;
	children: ReactNode;
}

export function ExplanationHelpDialog({
	open,
	onClose,
	title = 'Help',
	children,
}: ExplanationHelpDialogProps) {
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, onClose]);

	if (!open || typeof document === 'undefined') {
		return null;
	}

	return createPortal(
		<div
			className="help-dialog-backdrop"
			role="presentation"
			onClick={onClose}
		>
			<div
				className="help-dialog-panel"
				role="dialog"
				aria-modal="true"
				aria-labelledby="explanation-help-dialog-title"
				onClick={(e) => e.stopPropagation()}
			>
				<p id="explanation-help-dialog-title" className="help-dialog-sr-only">
					{title}
				</p>
				<div className="help-dialog-body explanation-help-dialog-scrolled">{children}</div>
			</div>
		</div>,
		document.body,
	);
}
