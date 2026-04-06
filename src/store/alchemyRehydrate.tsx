'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import type { PersistedAlchemyState } from '@/store/features/alchemySlice';
import Alchemy from '@/store/features/alchemySlice';
import { ALCHEMY_STORAGE_KEY, enableAlchemyPersistence } from '@/store/store';

/** Loads persisted alchemy state (excluding cursor) from localStorage once on mount, then allows saves. */
export function AlchemyRehydrate() {
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		try {
			const raw = localStorage.getItem(ALCHEMY_STORAGE_KEY);
			if (raw) {
				const parsed = JSON.parse(raw) as PersistedAlchemyState;
				dispatch(Alchemy.slice.actions.hydrateFromStorage(parsed));
			}
		} catch {
			// ignore malformed storage
		} finally {
			enableAlchemyPersistence();
		}
	}, [dispatch]);

	return null;
}
