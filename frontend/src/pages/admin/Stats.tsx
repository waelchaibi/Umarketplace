import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../config/axios'
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Legend,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis
} from 'recharts'

type AdminStatsResponse = {
	success: boolean
	data: {
		users: number
		products: number
		activeAuctions: number
		sales30d: number
		kpis?: {
			gmv30d: number
			commission30d: number
			transactions30d: number
			avgOrderValue30d: number
			commissionChangePct: number
			commissionRate: number
		}
		charts?: {
			revenueDaily?: Array<{ day: string; gmv: number; commission: number }>
			newUsersDaily?: Array<{ day: string; total: number }>
			auctionsDaily?: Array<{ day: string; started: number; ended: number }>
			productsByCategory?: Array<{ category: string; total: number }>
			topBuyers?: Array<{ userId: number; username: string; totalSpent: number }>
		}
	}
}

const formatMoney = (v: number) =>
	new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(v || 0))

const formatCompact = (v: number) =>
	new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(v || 0))

const formatPct = (v: number) =>
	`${v >= 0 ? '+' : ''}${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(Number(v || 0))}%`

const shortDay = (day: string) => {
	try {
		return day.slice(5)
	} catch {
		return day
	}
}

const TOOLTIP_STYLE = {
	background: 'rgba(15, 23, 42, 0.96)',
	border: '1px solid rgba(255,255,255,0.12)',
	borderRadius: 10,
	boxShadow: '0 18px 40px rgba(0,0,0,0.45)'
} as const

const COLORS = ['#EA580C', '#FDBA74', '#9A3412', '#F97316', '#FB923C', '#C2410C', '#FFEDD5', '#7C2D12']

export default function Stats() {
	const navigate = useNavigate()
	const [stats, setStats] = useState<AdminStatsResponse['data'] | null>(null)
	const [logs, setLogs] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string>('')

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true)
				setError('')

				const s = await axios.get<AdminStatsResponse>('/admin/stats')
				setStats(s.data.data)

				const l = await axios.get('/admin/logs?limit=50')
				setLogs(l.data.data || [])
			} catch (e: any) {
				setError(e?.response?.data?.error || 'Échec du chargement des statistiques')
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [])

	const revenueDaily = useMemo(() => (stats?.charts?.revenueDaily || []), [stats])
	const newUsersDaily = useMemo(() => (stats?.charts?.newUsersDaily || []), [stats])
	const auctionsDaily = useMemo(() => (stats?.charts?.auctionsDaily || []), [stats])
	const productsByCategory = useMemo(() => (stats?.charts?.productsByCategory || []), [stats])
	const topBuyers = useMemo(() => (stats?.charts?.topBuyers || []), [stats])
	const kpis = stats?.kpis

	if (loading) return <div className="p-6 max-w-6xl mx-auto">Chargement...</div>

	return (
		<div className="p-4 md:p-6 max-w-6xl mx-auto">
			<div className="flex items-center justify-between gap-3 mb-6">
				<div>
					<h1 className="rinato-h2">Statistiques</h1>
					<p className="text-sm text-slateLight/75 mt-1">
						Vue 30 jours — GMV, commission ({Math.round((kpis?.commissionRate || 0.1) * 100)}%), croissance et profils clients.
					</p>
				</div>
				<button
					type="button"
					onClick={() => navigate('/admin/dashboard', { replace: false })}
					className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 transition"
				>
					Retour
				</button>
			</div>

			{error && (
				<div className="rinato-card p-4 mb-6 border border-red-500/30 bg-red-500/10">
					<div className="text-sm text-red-200">{error}</div>
				</div>
			)}

			<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				{[
					{ label: 'Utilisateurs', value: stats?.users },
					{ label: 'Produits', value: stats?.products },
					{ label: 'Enchères actives', value: stats?.activeAuctions },
					{ label: 'Transactions (30j)', value: kpis?.transactions30d ?? stats?.sales30d }
				].map((k) => (
					<div key={k.label} className="rinato-card p-5">
						<div className="text-sm text-slateLight/80">{k.label}</div>
						<div className="text-3xl font-bold">{k.value ?? '-'}</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
				<div className="rinato-card p-5">
					<div className="text-sm text-slateLight/80">GMV (30j)</div>
					<div className="text-3xl font-bold">{formatMoney(kpis?.gmv30d || 0)}</div>
					<div className="text-sm text-slateLight/70 mt-1">
						Panier moyen: <span className="text-slateLight">{formatMoney(kpis?.avgOrderValue30d || 0)}</span>
					</div>
				</div>
				<div className="rinato-card p-5">
					<div className="text-sm text-slateLight/80">Commission (30j)</div>
					<div className="text-3xl font-bold">{formatMoney(kpis?.commission30d || 0)}</div>
					<div className="text-sm text-slateLight/70 mt-1">
						Évolution vs 30j précédents: <span className="text-slateLight">{formatPct(kpis?.commissionChangePct || 0)}</span>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
				<div className="rinato-card p-5">
					<div className="flex items-baseline justify-between gap-3 mb-4">
						<h2 className="rinato-h3">GMV & Commission (30 jours)</h2>
						<div className="text-sm text-slateLight/70">Ligne</div>
					</div>
					<div className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={revenueDaily}>
								<CartesianGrid stroke="rgba(255,255,255,0.08)" />
								<XAxis dataKey="day" tickFormatter={shortDay} stroke="rgba(255,255,255,0.55)" />
								<YAxis tickFormatter={(v) => formatCompact(Number(v))} stroke="rgba(255,255,255,0.55)" />
								<Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: 'rgba(241,245,249,0.9)' }} />
								<Legend />
								<Line type="monotone" dataKey="gmv" name="GMV" stroke="#FDBA74" strokeWidth={2} dot={false} />
								<Line type="monotone" dataKey="commission" name="Commission" stroke="#EA580C" strokeWidth={2} dot={false} />
							</LineChart>
						</ResponsiveContainer>
					</div>
					<p className="sr-only">Graphique ligne: GMV et commission journalière sur 30 jours.</p>
				</div>

				<div className="rinato-card p-5">
					<div className="flex items-baseline justify-between gap-3 mb-4">
						<h2 className="rinato-h3">Nouveaux clients (30 jours)</h2>
						<div className="text-sm text-slateLight/70">Barres</div>
					</div>
					<div className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={newUsersDaily}>
								<CartesianGrid stroke="rgba(255,255,255,0.08)" />
								<XAxis dataKey="day" tickFormatter={shortDay} stroke="rgba(255,255,255,0.55)" />
								<YAxis allowDecimals={false} stroke="rgba(255,255,255,0.55)" />
								<Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: 'rgba(241,245,249,0.9)' }} />
								<Bar dataKey="total" name="Nouveaux" fill="#EA580C" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
					<p className="sr-only">Graphique barres: nouveaux utilisateurs créés par jour sur 30 jours.</p>
				</div>

				<div className="rinato-card p-5">
					<div className="flex items-baseline justify-between gap-3 mb-4">
						<h2 className="rinato-h3">Enchères — démarrées vs terminées</h2>
						<div className="text-sm text-slateLight/70">Empilé</div>
					</div>
					<div className="h-72">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={auctionsDaily}>
								<CartesianGrid stroke="rgba(255,255,255,0.08)" />
								<XAxis dataKey="day" tickFormatter={shortDay} stroke="rgba(255,255,255,0.55)" />
								<YAxis allowDecimals={false} stroke="rgba(255,255,255,0.55)" />
								<Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: 'rgba(241,245,249,0.9)' }} />
								<Legend />
								<Bar dataKey="started" name="Démarrées" stackId="a" fill="#FDBA74" radius={[6, 6, 0, 0]} />
								<Bar dataKey="ended" name="Terminées" stackId="a" fill="#EA580C" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
					<p className="sr-only">Graphique empilé: enchères démarrées et terminées par jour sur 30 jours.</p>
				</div>

				<div className="rinato-card p-5">
					<div className="flex items-baseline justify-between gap-3 mb-4">
						<h2 className="rinato-h3">Mix produits (Top catégories)</h2>
						<div className="text-sm text-slateLight/70">Donut</div>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Tooltip contentStyle={TOOLTIP_STYLE} />
									<Pie
										data={productsByCategory}
										dataKey="total"
										nameKey="category"
										innerRadius="55%"
										outerRadius="85%"
										paddingAngle={2}
									>
										{(productsByCategory || []).map((_, idx) => (
											<Cell key={idx} fill={COLORS[idx % COLORS.length]} />
										))}
									</Pie>
								</PieChart>
							</ResponsiveContainer>
						</div>
						<ul className="text-sm space-y-2">
							{(productsByCategory || []).map((c, idx) => (
								<li key={`${c.category}-${idx}`} className="flex items-center justify-between gap-3">
									<span className="flex items-center gap-2">
										<span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
										<span className="text-slateLight/80">{c.category}</span>
									</span>
									<span className="font-semibold">{c.total}</span>
								</li>
							))}
							{(productsByCategory || []).length === 0 && <li className="text-slateLight/70">Aucune donnée</li>}
						</ul>
					</div>
					<p className="sr-only">Graphique donut: répartition des produits par catégorie (top 8).</p>
				</div>
			</div>

			<div className="rinato-card p-5 mb-6">
				<div className="flex items-baseline justify-between gap-3 mb-4">
					<h2 className="rinato-h3">Top clients (dépenses 30 jours)</h2>
					<div className="text-sm text-slateLight/70">Barres horizontales</div>
				</div>
				<div className="h-72">
					<ResponsiveContainer width="100%" height="100%">
						<BarChart data={topBuyers} layout="vertical" margin={{ left: 40 }}>
							<CartesianGrid stroke="rgba(255,255,255,0.08)" />
							<XAxis type="number" tickFormatter={(v) => formatCompact(Number(v))} stroke="rgba(255,255,255,0.55)" />
							<YAxis type="category" dataKey="username" width={120} stroke="rgba(255,255,255,0.55)" />
							<Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => formatMoney(Number(v))} />
							<Bar dataKey="totalSpent" name="Dépenses" fill="#EA580C" radius={[0, 8, 8, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</div>
				<p className="sr-only">Graphique barres horizontales: top 5 clients par dépenses sur 30 jours.</p>
			</div>

			<div className="rinato-card p-5">
				<h2 className="rinato-h3 mb-3">Activité récente</h2>
				<ul className="space-y-2 max-h-96 overflow-auto pr-2 text-sm">
					{(logs || []).map((log) => (
						<li key={log.id} className="flex items-center justify-between border-b border-white/10 pb-2">
							<span className="text-slateLight/80">{log.action} {log.targetType}#{log.targetId}</span>
							<span>{new Date(log.createdAt).toLocaleString()}</span>
						</li>
					))}
					{(logs || []).length === 0 && <li className="text-slateLight/70">Aucune activité récente</li>}
				</ul>
			</div>
		</div>
	)
}

