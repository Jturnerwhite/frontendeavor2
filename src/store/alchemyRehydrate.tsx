'use client';

import { useLayoutEffect } from 'react';
import { enableAlchemyPersistence } from '@/store/store';

/**
 * Enables localStorage writes after the store has been created with synchronous preloaded state from
 * [store.ts](store.ts) (Alchemy + Player). No dispatch here — avoids racing sibling effects on refresh.
 */
export function AlchemyRehydrate() {
	useLayoutEffect(() => {
		enableAlchemyPersistence();
	}, []);

	return null;
}
