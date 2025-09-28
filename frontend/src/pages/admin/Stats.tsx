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

	if (loading) return <div className="p-6">Loading...</div>

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="text-3xl font-display font-semibold mb-6">Stats</h1>
			<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				{[
					{ label: 'Users', value: stats?.users },
					{ label: 'Products', value: stats?.products },
					{ label: 'Active Auctions', value: stats?.activeAuctions },
					{ label: 'Sales (30d)', value: stats?.sales30d }
				].map((k) => (
					<div key={k.label} className="rounded-2xl p-5 bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card">
						<div className="text-sm text-gray-600 dark:text-gray-300">{k.label}</div>
						<div className="text-3xl font-bold">{k.value ?? '-'}</div>
					</div>
				))}
			</div>
			<div className="rounded-2xl p-5 bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card">
				<h2 className="text-xl font-semibold mb-3">Recent activity</h2>
				<ul className="space-y-2 max-h-96 overflow-auto pr-2 text-sm">
					{logs.map((log) => (
						<li key={log.id} className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-2">
							<span className="text-gray-600 dark:text-gray-300">{log.action} {log.targetType}#{log.targetId}</span>
							<span>{new Date(log.createdAt).toLocaleString()}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}

