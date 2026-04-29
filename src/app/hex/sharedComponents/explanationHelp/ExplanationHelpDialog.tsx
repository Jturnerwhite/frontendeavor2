'use client';

import type { ReactNode } from 'react';
import { GenericDialog } from '@/app/hex/sharedComponents/genericDialog';

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
	return (
		<GenericDialog
			open={open}
			onClose={onClose}
			title={title}
			titleId="explanation-help-dialog-title"
			bodyClassName="help-dialog-body explanation-help-dialog-scrolled"
		>
			{children}
		</GenericDialog>
	);
}
