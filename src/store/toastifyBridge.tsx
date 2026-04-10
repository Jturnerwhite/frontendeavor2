'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import { RootState } from '@/store/store';
import ToastifyStore from '@/store/features/toastifySlice';

export function ToastifyBridge() {
	const dispatch = useDispatch();
	const next = useSelector((state: RootState) => state.Toastify.queue[0]);

	useEffect(() => {
		if (!next) return;
		const imagePath = next.imagePath;
		toast.success(next.message, {
			autoClose: 3000,
			toastId: next.id,
			...(imagePath
				? {
						icon: () => (
							<img
								src={imagePath}
								alt=""
								width={28}
								height={28}
								style={{ objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
							/>
						),
					}
				: {}),
		});
		dispatch(ToastifyStore.actions.acknowledgeToast({ id: next.id }));
	}, [next, dispatch]);

	return (
		<ToastContainer
			autoClose={3000}
			position="top-right"
			hideProgressBar={false}
			newestOnTop
			closeOnClick
			rtl={false}
			pauseOnFocusLoss
			draggable
			pauseOnHover
			theme="dark"
		/>
	);
}
