'use client';

import { useLayoutEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { store } from '@/store/store';

/** If first visit, send users to the Explanation page; otherwise the map. */
export default function Home() {
	const router = useRouter();
	const didRedirect = useRef(false);

	useLayoutEffect(() => {
		if (didRedirect.current) return;
		didRedirect.current = true;
		const isFirstVisit = store.getState().Settings.isFirstVisit;
		router.replace(isFirstVisit ? '/hex/explanation' : '/hex/map');
	}, [router]);

	return null;
}
