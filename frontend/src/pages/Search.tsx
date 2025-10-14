import { useQuery } from '@tanstack/react-query'
import axios from '../config/axios'
import { Link, useSearchParams } from 'react-router-dom'
import { IMG_URL } from '../config'

export default function Search() {
	const [params, setParams] = useSearchParams()
	const q = params.get('q') || ''
	const page = Number(params.get('page') || '1')
	const limit = Number(params.get('limit') || '12')

	const { data, isLoading, isError } = useQuery({
		queryKey: ['search', { q, page, limit }],
		queryFn: async () => (await axios.get('/products/search', { params: { q, page, limit } })).data.data,
		enabled: !!q
	})

	if (!q) return <div className="p-6">Type in the search bar to find products.</div>
	if (isError) return <div className="p-6">Failed to search.</div>

	const items = data?.items || []

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="text-2xl font-display font-semibold mb-4">Search results for "{q}"</h1>
			<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{(isLoading ? Array.from({ length: limit }) : items).map((p: any, i: number) => (
					<li key={p?.id || i} className="group rounded-2xl overflow-hidden bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card">
						{isLoading ? (
							<>
								<div className="aspect-[4/3] bg-gray-100 dark:bg-white/10 animate-pulse" />
								<div className="p-4 space-y-2">
									<div className="h-4 bg-gray-100 dark:bg-white/10 rounded w-2/3" />
									<div className="h-3 bg-gray-100 dark:bg-white/10 rounded w-1/2" />
								</div>
							</>
						) : (
							<>
								{(() => { const img = (Array.isArray(p.images) && p.images[0]) ? (p.images[0].startsWith('/uploads') ? `${IMG_URL}${p.images[0]}` : p.images[0]) : null; return img ? (
									<div className="aspect-[4/3] overflow-hidden">
										<img src={img} alt={p.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
									</div>
								) : <div className="aspect-[4/3] bg-gray-100 dark:bg-white/10" /> })()}
								<div className="p-4">
									<h3 className="font-semibold mb-1">{p.title}</h3>
									<p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Price: {p.currentPrice ?? p.originalPrice ?? '-'}</p>
									<Link className="inline-block text-blue-600 dark:text-accent-blue hover:underline" to={`/products/${p.id}`}>View</Link>
								</div>
							</>
						)}
					</li>
				))}
			</ul>
			{data?.pages > 1 && (
				<div className="flex items-center justify-center gap-2 mt-6">
					<button disabled={page <= 1} onClick={() => setParams({ q, page: String(Math.max(1, page - 1)), limit: String(limit) })} className="px-3 py-1 rounded bg-gray-100 dark:bg-white/10 disabled:opacity-50">Prev</button>
					<div className="text-sm">Page {page} / {data.pages}</div>
					<button disabled={page >= data.pages} onClick={() => setParams({ q, page: String(Math.min(data.pages, page + 1)), limit: String(limit) })} className="px-3 py-1 rounded bg-gray-100 dark:bg-white/10 disabled:opacity-50">Next</button>
				</div>
			)}
		</div>
	)
}


