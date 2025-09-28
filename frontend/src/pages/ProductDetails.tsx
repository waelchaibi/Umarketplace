import { useQuery } from '@tanstack/react-query'
import axios from '../config/axios'
import { useParams } from 'react-router-dom'

export default function ProductDetails() {
	const { id } = useParams()
	const { data, isLoading, isError } = useQuery({
		queryKey: ['product', id],
		queryFn: async () => (await axios.get(`/products/${id}`)).data.data,
		enabled: !!id
	})

	if (isLoading) return <div className="p-6">Loading...</div>
	if (isError) return <div className="p-6">Error loading product.</div>
	if (!data) return <div className="p-6">Not found</div>

	return (
		<div className="p-6 max-w-3xl mx-auto">
			<div className="rounded-2xl p-6 bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card backdrop-blur-xs">
				<h1 className="text-3xl font-display font-semibold mb-2">{data.title}</h1>
				<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{data.category}</p>
				<p className="mb-4">{data.description}</p>
				<p className="text-xl font-bold">Price: {data.currentPrice ?? data.originalPrice ?? '-'}</p>
			</div>
		</div>
	)
}
