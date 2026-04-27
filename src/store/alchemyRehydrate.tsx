'use client';

import { useLayoutEffect } from 'react';
import {
	enableAlchemyPersistence,
	hydratePersistedSlicesFromStorage,
} from '@/store/store';

/**
 * Reads persisted slices from localStorage and dispatches their hydrate actions, then enables
 * debounced persistence. Runs in a layout effect so the rehydrate dispatches commit before paint —
 * the first React render still matches SSR output (empty initial state), avoiding hydration
 * mismatches on any UI gated on persisted data.
 */
export function AlchemyRehydrate() {
	useLayoutEffect(() => {
		hydratePersistedSlicesFromStorage();
		enableAlchemyPersistence();
	}, []);

	return null;
}
