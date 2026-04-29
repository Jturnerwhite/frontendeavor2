'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './genericDialog.css';

export interface GenericDialogProps {
	open: boolean;
	onClose: () => void;
	/** Shown in sr-only label for aria-labelledby */
	title?: string;
	/** Element id for aria-labelledby */
	titleId?: string;
	/** Classes on the scrollable body wrapper */
	bodyClassName?: string;
	children: ReactNode;
}

export function GenericDialog({
	open,
	onClose,
	title = 'Dialog',
	titleId = 'generic-dialog-title',
	bodyClassName = 'help-dialog-body',
	children,
}: GenericDialogProps) {
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
		<div className="help-dialog-backdrop" role="presentation" onClick={onClose}>
			<div
				className="help-dialog-panel"
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				onClick={(e) => e.stopPropagation()}
			>
				<p id={titleId} className="help-dialog-sr-only">
					{title}
				</p>
				<div className={bodyClassName}>{children}</div>
			</div>
		</div>,
		document.body,
	);
}
