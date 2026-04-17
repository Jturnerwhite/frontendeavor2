'use client';

import { useLayoutEffect } from 'react';
import { enableAlchemyPersistence } from '@/store/store';

/**
 * Enables debounced localStorage persistence after the store is created with synchronous preloaded state from
 * [store.ts](store.ts). No dispatch here — avoids racing sibling effects on refresh.
 */
export function AlchemyRehydrate() {
	useLayoutEffect(() => {
		enableAlchemyPersistence();
	}, []);

	return null;
}
