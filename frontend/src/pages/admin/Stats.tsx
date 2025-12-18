import { useEffect, useState } from 'react'
import axios from '../../config/axios'

export default function Stats() {
	const [stats, setStats] = useState<any>(null)
	const [logs, setLogs] = useState<any[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const load = async () => {
			const s = await axios.get('/admin/stats')
			setStats(s.data.data)
			const l = await axios.get('/admin/logs?limit=50')
			setLogs(l.data.data || [])
			setLoading(false)
		}
		load()
	}, [])

	if (loading) return <div className="p-6">Chargement...</div>

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="rinato-h2 mb-6">Statistiques</h1>
			<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				{[
					{ label: 'Utilisateurs', value: stats?.users },
					{ label: 'Produits', value: stats?.products },
					{ label: 'Enchères actives', value: stats?.activeAuctions },
					{ label: 'Ventes (30j)', value: stats?.sales30d }
				].map((k) => (
					<div key={k.label} className="rinato-card p-5">
						<div className="text-sm text-slateLight/80">{k.label}</div>
						<div className="text-3xl font-bold">{k.value ?? '-'}</div>
					</div>
				))}
			</div>
			<div className="rinato-card p-5">
				<h2 className="rinato-h3 mb-3">Activité récente</h2>
				<ul className="space-y-2 max-h-96 overflow-auto pr-2 text-sm">
					{logs.map((log) => (
						<li key={log.id} className="flex items-center justify-between border-b border-white/10 pb-2">
							<span className="text-slateLight/80">{log.action} {log.targetType}#{log.targetId}</span>
							<span>{new Date(log.createdAt).toLocaleString()}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}

