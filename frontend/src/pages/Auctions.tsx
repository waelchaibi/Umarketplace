import { useQuery } from '@tanstack/react-query'
import axios from '../config/axios'
import { Link } from 'react-router-dom'
import { IMG_URL } from '../config'

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
			<ul className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
				{items.map((a, i) => (
					<li key={a.id} className="rinato-card p-4 animate-fadeInUp" style={{ animationDelay: `${i * 40}ms` }}>
						{(() => {
							const img = (Array.isArray(a.product?.images) && a.product.images[0])
								? (a.product.images[0].startsWith('/uploads') ? `${IMG_URL}${a.product.images[0]}` : a.product.images[0])
								: null;
							return (
								<div className="aspect-[4/3] overflow-hidden mb-3">
									{img ? (
										<img src={img} alt={a.product?.title || `Auction #${a.id}`} className="w-full h-full object-cover" />
									) : (
										<div className="w-full h-full bg-white/10" />
									)}
								</div>
							)
						})()}
						<h3 className="title text-lg mb-1">{a.product?.title || `Auction #${a.id}`}</h3>
						<p className="mb-2 font-sans font-bold text-slateLight">Enchère actuelle: € {a.currentBid ?? a.startingPrice}</p>
						<Link className="rinato-cta rinato-cta--sm" to={`/auctions/${a.id}`}>Voir l’enchère</Link>
					</li>
				))}
			</ul>
		</div>
	)
}
