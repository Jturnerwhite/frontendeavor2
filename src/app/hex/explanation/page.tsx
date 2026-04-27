'use client';

import { useLayoutEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import Settings from '@/store/features/settingsSlice';
import {
	ExplanationCraftingSection,
	ExplanationHelpPageHeader,
	ExplanationHelpPageShell,
	ExplanationItemsSection,
	ExplanationMapSection,
	ExplanationOverviewSection,
	ExplanationRecipeSection,
} from '@/app/hex/sharedComponents/explanationHelp';

export default function Page() {
	const dispatch = useAppDispatch();

	useLayoutEffect(() => {
		dispatch(Settings.actions.markNotFirstVisit());
	}, [dispatch]);

	return (
		<ExplanationHelpPageShell>
			<ExplanationHelpPageHeader />
			<div className="flex flex-col gap-10 md:gap-12">
				<ExplanationOverviewSection />
				<ExplanationMapSection />
				<ExplanationItemsSection />
				<ExplanationRecipeSection />
				<ExplanationCraftingSection />
			</div>
		</ExplanationHelpPageShell>
	);
}
