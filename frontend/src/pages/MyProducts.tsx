import { useEffect, useState } from 'react'
import axios from '../config/axios'

export default function MyProducts() {
	const [items, setItems] = useState<any[]>([])
	const [price, setPrice] = useState<Record<number, number>>({})

	const load = async () => {
		const profile = await axios.get('/auth/profile')
		const res = await axios.get(`/products/user/${profile.data.data.id}`)
		setItems(res.data.data)
	}

	useEffect(() => { load() }, [])

	const sell = async (id: number, p?: number) => {
		await axios.post('/marketplace/sell', { productId: id, price: p })
		await load()
	}
	const updatePrice = async (id: number, p: number) => {
		await axios.put(`/marketplace/price/${id}`, { price: p })
		await load()
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
					</li>
				))}
			</ul>
		</div>
	)
}
