import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
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
		try {
		await axios.post('/wallet/add-funds', { amount })
			toast.success('Fonds ajoutés')
		await load()
		} catch (e: any) {
			toast.error(e?.response?.data?.error || 'Échec de l’ajout de fonds')
		}
	}

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="rinato-h2 mb-6">Portefeuille</h1>
			<div className="grid md:grid-cols-2 gap-6">
				<div className="rinato-card p-6">
					<p className="text-sm text-slateLight/80">Solde actuel</p>
					<p className="text-4xl font-bold mt-2">€ {balance.toFixed(2)}</p>
					<div className="mt-4 flex gap-2">
						<input className="flex-1 px-3 py-2 border border-white/10 bg-white/5 text-slateLight placeholder-white/50" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
						<button onClick={add} className="rinato-cta px-4 py-2">Ajouter des fonds</button>
					</div>
				</div>
				<div className="rinato-card p-6">
					<h2 className="rinato-h3 mb-4">Transactions</h2>
					<ul className="space-y-2 max-h-72 overflow-auto pr-2">
						{txs.map(tx => (
							<li key={tx.id} className="flex items-center justify-between text-sm">
								<span className="text-slateLight/80">[{tx.type}] {tx.product?.title || tx.productId}</span>
								<span className="font-medium">€ {Number(tx.amount).toFixed(2)}</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	)
}
