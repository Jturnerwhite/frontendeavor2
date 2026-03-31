'use client'
import Link from 'next/link';
import { useDispatch, useSelector } from "react-redux";
import { Recipes } from '@/app/hex/architecture/data/recipes';
import { RootState } from "@/store/store";
import AlchemyStoreSlice from '@/store/features/alchemySlice';

export default function Page() {
	const dispatch = useDispatch();
	function addIngredient(ingId: string) {
	}

	return <>
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<h1>Select Ingredients</h1>
			</main>
		</div>
	</>;
}