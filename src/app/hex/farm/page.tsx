'use client'
import farmSlice from '@/store/features/farmSlice';
import { RootState } from '@/store/store';
import Link from 'next/link';
import { useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";

export default function Page() {
	const dispatch = useDispatch();
	const farmGrid = useSelector((state: RootState) => state.Farm.farmGrid);
	useEffect(() => {
		if (farmGrid === undefined) {
			dispatch(farmSlice.actions.setFarmGrid({ pos: { x:0, y:0 }, size, layers: gridLayers }));
		}
	}, []);

	return <>
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<h1>Farm</h1>
			</main>
		</div>
	</>;
}