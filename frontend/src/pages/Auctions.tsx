import { useQuery } from '@tanstack/react-query'
import axios from '../config/axios'
import { Link } from 'react-router-dom'

export default function Auctions() {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['auctions'],
		queryFn: async () => (await axios.get('/auctions')).data.data
	})
	if (isLoading) return <div>Loading...</div>
	if (isError) return <div>Error loading auctions.</div>
	const items = (data || []) as any[]
	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="text-3xl font-display font-semibold mb-6">Live Auctions</h1>
			<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{items.map((a, i) => (
					<li key={a.id} className="rounded-2xl p-5 bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card backdrop-blur-xs animate-fadeInUp" style={{ animationDelay: `${i * 40}ms` }}>
						<h3 className="font-semibold mb-1">{a.product?.title || `Auction #${a.id}`}</h3>
						<p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Current bid: {a.currentBid ?? a.startingPrice}</p>
						<Link className="text-blue-600 dark:text-accent-blue hover:underline" to={`/auctions/${a.id}`}>Open auction</Link>
					</li>
				))}
			</ul>
		</div>
	)
}
