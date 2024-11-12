'use client'
import { useSearchParams } from 'next/navigation'

export default function Page() {
	const params = useSearchParams();
	console.log(params.get('recipe'));

	return <>
		<h1>~/hex/play/alchemy/</h1>
	</>;
}