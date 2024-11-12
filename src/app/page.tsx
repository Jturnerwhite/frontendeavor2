'use client'

import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store/store'
import CounterSlice from '@/store/features/counterSlice'

export default function Home() {
	const count = useSelector((state: RootState) => state.counter.value)
	const dispatch = useDispatch()
	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<h1>Direct to map proj</h1>
				<h1>Direct to hex proj</h1>
				<div>
					<button onClick={() => dispatch(CounterSlice.decrement())}>-</button>
						<span>{count}</span>
					<button onClick={() => dispatch(CounterSlice.increment())}>+</button>
				</div>
			</main>
			<footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
			</footer>
		</div>
	);
}
