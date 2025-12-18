import { useQuery } from '@tanstack/react-query'
import axios from '../config/axios'
import { Link } from 'react-router-dom'

export default function Auctions() {
	const { data, isLoading, isError } = useQuery({
		queryKey: ['auctions'],
		queryFn: async () => (await axios.get('/auctions')).data.data
	})
	if (isLoading) return <div className="p-6">Chargement...</div>
	if (isError) return <div className="p-6">Erreur de chargement.</div>
	const items = (data || []) as any[]
	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="rinato-h2 mb-6">Enchères en cours</h1>
			<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{items.map((a, i) => (
					<li key={a.id} className="rinato-card p-5 animate-fadeInUp" style={{ animationDelay: `${i * 40}ms` }}>
						<h3 className="font-display text-lg mb-1">{a.product?.title || `Auction #${a.id}`}</h3>
						<p className="text-sm text-slateLight/80 mb-3">Enchère actuelle: € {a.currentBid ?? a.startingPrice}</p>
						<Link className="rinato-cta" to={`/auctions/${a.id}`}>Voir l’enchère</Link>
					</li>
				))}
			</ul>
		</div>
	)
}
