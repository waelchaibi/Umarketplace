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
			<h1 className="text-3xl font-display font-semibold mb-6">My Products</h1>
			<ul className="space-y-4">
				{items.map(p => (
					<li key={p.id} className="rounded-2xl p-5 bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card backdrop-blur-xs">
						<div className="flex flex-wrap items-center gap-3 justify-between">
							<div>
								<div className="font-semibold">{p.title}</div>
								<div className="text-sm text-gray-600 dark:text-gray-300">{p.status} – {p.currentPrice ?? p.originalPrice ?? '-'}</div>
							</div>
							<div className="flex items-center gap-2">
								<input className="w-32 px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-accent-blue/50" type="number" placeholder="price" value={price[p.id] || '' as any} onChange={e => setPrice({ ...price, [p.id]: Number(e.target.value) })} />
								<button className="px-3 py-2 rounded bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20" onClick={() => sell(p.id, price[p.id])}>Sell</button>
								<button className="px-3 py-2 rounded bg-gradient-to-r from-accent-purple to-accent-blue text-white" onClick={() => updatePrice(p.id, price[p.id])}>Update</button>
							</div>
						</div>

						{/* Start Auction */}
						<div className="mt-4 grid md:grid-cols-3 gap-2">
							<input className="px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" type="number" placeholder="starting price" value={startPrice[p.id] || '' as any} onChange={e => setStartPrice({ ...startPrice, [p.id]: Number(e.target.value) })} />
							<input className="px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" type="datetime-local" value={endTime[p.id] || ''} onChange={e => setEndTime({ ...endTime, [p.id]: e.target.value })} />
							<button disabled={p.status !== 'available'} className={`px-3 py-2 rounded ${p.status === 'available' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500 cursor-not-allowed'}`} onClick={() => startAuction(p.id)}>Start auction</button>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}
