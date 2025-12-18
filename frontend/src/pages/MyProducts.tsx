import { useEffect, useState } from 'react'
import axios from '../config/axios'
import toast from 'react-hot-toast'

export default function MyProducts() {
	const [items, setItems] = useState<any[]>([])
	const [price, setPrice] = useState<Record<number, number>>({})
  const [startPrice, setStartPrice] = useState<Record<number, number>>({})
  const [endTime, setEndTime] = useState<Record<number, string>>({})

	const load = async () => {
		const profile = await axios.get('/auth/profile')
		const res = await axios.get(`/products/user/${profile.data.data.id}`)
		setItems(res.data.data)
	}

	useEffect(() => { load() }, [])

	const sell = async (id: number, p?: number) => {
		await axios.post('/marketplace/sell', { productId: id, price: p })
		toast.success('Listed for sale')
		await load()
	}
	const updatePrice = async (id: number, p: number) => {
		await axios.put(`/marketplace/price/${id}`, { price: p })
		toast.success('Price updated')
		await load()
	}
  const startAuction = async (id: number) => {
    try {
      const sp = startPrice[id]
      const et = endTime[id]
      if (!sp || !et) { toast.error('Enter starting price and end time'); return }
      const iso = new Date(et).toISOString()
      await axios.post('/auctions/create', { productId: id, startingPrice: sp, endTime: iso })
      toast.success('Auction created')
      await load()
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to create auction')
    }
  }

	return (
		<div className="p-6 max-w-5xl mx-auto">
			<h1 className="rinato-h2 mb-6">Mes pièces</h1>
			<ul className="space-y-4">
				{items.map(p => (
					<li key={p.id} className="rinato-card p-5">
						<div className="flex flex-wrap items-center gap-3 justify-between">
							<div>
								<div className="font-display text-lg">{p.title}</div>
								<div className="text-sm text-slateLight/80">{p.status} – € {p.currentPrice ?? p.originalPrice ?? '-'}</div>
							</div>
							<div className="flex items-center gap-2">
								<input className="w-32 px-3 py-2 border border-white/10 bg-white/5 text-slateLight placeholder-white/50" type="number" placeholder="prix" value={price[p.id] || '' as any} onChange={e => setPrice({ ...price, [p.id]: Number(e.target.value) })} />
								<button className="px-3 py-2 bg-white/5 border border-white/10" onClick={() => sell(p.id, price[p.id])}>Vendre</button>
								<button className="rinato-cta px-3 py-2" onClick={() => updatePrice(p.id, price[p.id])}>Mettre à jour</button>
							</div>
						</div>

						{/* Start Auction */}
						<div className="mt-4 grid md:grid-cols-3 gap-2">
							<input className="px-3 py-2 border border-white/10 bg-white/5 text-slateLight placeholder-white/50" type="number" placeholder="prix de départ" value={startPrice[p.id] || '' as any} onChange={e => setStartPrice({ ...startPrice, [p.id]: Number(e.target.value) })} />
							<input className="px-3 py-2 border border-white/10 bg-white/5 text-slateLight" type="datetime-local" value={endTime[p.id] || ''} onChange={e => setEndTime({ ...endTime, [p.id]: e.target.value })} />
							<button disabled={p.status !== 'available'} className={`px-3 py-2 ${p.status === 'available' ? 'rinato-cta' : 'bg-white/5 border border-white/10 text-slateLight/60 cursor-not-allowed'}`} onClick={() => startAuction(p.id)}>Lancer une enchère</button>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}
