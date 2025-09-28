import { useEffect, useState } from 'react'
import axios from '../config/axios'

export default function Wallet() {
	const [balance, setBalance] = useState<number>(0)
	const [amount, setAmount] = useState<number>(100)
	const [txs, setTxs] = useState<any[]>([])

	const load = async () => {
		const b = await axios.get('/wallet/balance')
		setBalance(b.data.data.balance)
		const t = await axios.get('/wallet/transactions')
		setTxs(t.data.data || [])
	}

	useEffect(() => { load() }, [])

	const add = async () => {
		await axios.post('/wallet/add-funds', { amount })
		await load()
	}

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-3xl font-display font-semibold mb-6">Wallet</h1>
			<div className="grid md:grid-cols-2 gap-6">
				<div className="rounded-2xl bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 p-6 shadow-card backdrop-blur-xs">
					<p className="text-sm text-gray-600 dark:text-gray-300">Current balance</p>
					<p className="text-4xl font-bold mt-2">${balance.toFixed(2)}</p>
					<div className="mt-4 flex gap-2">
						<input className="flex-1 px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-accent-blue/50" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
						<button onClick={add} className="px-4 py-2 rounded bg-gradient-to-r from-accent-purple to-accent-blue text-white shadow hover:opacity-90 transition">Add funds</button>
					</div>
				</div>
				<div className="rounded-2xl bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 p-6 shadow-card backdrop-blur-xs">
					<h2 className="text-xl font-semibold mb-4">Transactions</h2>
					<ul className="space-y-2 max-h-72 overflow-auto pr-2">
						{txs.map(tx => (
							<li key={tx.id} className="flex items-center justify-between text-sm">
								<span className="text-gray-600 dark:text-gray-300">[{tx.type}] {tx.product?.title || tx.productId}</span>
								<span className="font-medium">${Number(tx.amount).toFixed(2)}</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	)
}
