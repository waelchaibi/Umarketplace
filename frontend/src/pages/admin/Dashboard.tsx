import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../../config/axios'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

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
			commissionChangePct: number
			commissionRate: number
		}
		charts?: {
			revenueDaily?: Array<{ day: string; gmv: number; commission: number }>
		}
	}
}

const formatMoney = (v: number) =>
	new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(v || 0))

const shortDay = (day: string) => {
	try {
		return day.slice(5)
	} catch {
		return day
	}
}

export default function Dashboard() {
	const navigate = useNavigate()
	const [stats, setStats] = useState<AdminStatsResponse['data'] | null>(null)

	useEffect(() => {
		const load = async () => {
			try {
				const s = await axios.get<AdminStatsResponse>('/admin/stats')
				setStats(s.data.data)
			} catch {
				// Silent: dashboard remains usable even if stats fails
			}
		}
		load()
	}, [])

	const revenueDaily = useMemo(() => (stats?.charts?.revenueDaily || []).slice(-7), [stats])
	const kpis = stats?.kpis

	return (
		<div className="p-4 md:p-6 max-w-6xl mx-auto">
			<div className="flex items-start justify-between gap-4 mb-6">
				<div>
					<h1 className="rinato-h2">Admin — RINATO</h1>
					<p className="text-sm text-slateLight/75 mt-1">
						Aperçu rapide — commission {Math.round((kpis?.commissionRate || 0.1) * 100)}% sur transactions complétées.
					</p>
				</div>
				<button
					type="button"
					onClick={() => navigate('/admin/stats', { replace: false })}
					className="rinato-cta rinato-cta--sm"
				>
					Voir détails
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<div className="rinato-card p-5">
					<div className="text-sm text-slateLight/80">Utilisateurs</div>
					<div className="text-3xl font-bold">{stats?.users ?? '-'}</div>
				</div>
				<div className="rinato-card p-5">
					<div className="text-sm text-slateLight/80">GMV (30j)</div>
					<div className="text-3xl font-bold">{formatMoney(kpis?.gmv30d || 0)}</div>
				</div>
				<div className="rinato-card p-5">
					<div className="text-sm text-slateLight/80">Commission (30j)</div>
					<div className="text-3xl font-bold">{formatMoney(kpis?.commission30d || 0)}</div>
					<div className="text-sm text-slateLight/70 mt-1">
						Évolution: <span className="text-slateLight">{(kpis?.commissionChangePct ?? 0) >= 0 ? '+' : ''}{kpis?.commissionChangePct ?? 0}%</span>
					</div>
				</div>
			</div>

			<div className="rinato-card p-5 mb-6">
				<div className="flex items-baseline justify-between gap-3 mb-3">
					<h2 className="rinato-h3">GMV (7 derniers jours)</h2>
					<div className="text-sm text-slateLight/70">Mini graphe</div>
				</div>
				<div className="h-40">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={revenueDaily}>
							<XAxis dataKey="day" tickFormatter={shortDay} stroke="rgba(255,255,255,0.55)" />
							<YAxis hide />
							<Tooltip
								contentStyle={{
									background: 'rgba(15, 23, 42, 0.96)',
									border: '1px solid rgba(255,255,255,0.12)',
									borderRadius: 10
								}}
								formatter={(v: any) => formatMoney(Number(v))}
							/>
							<Line type="monotone" dataKey="gmv" stroke="#EA580C" strokeWidth={2} dot={false} />
						</LineChart>
					</ResponsiveContainer>
				</div>
				<p className="sr-only">Mini graphique ligne: GMV journalière sur les 7 derniers jours.</p>
			</div>

			<div className="grid md:grid-cols-3 gap-6">
				<div className="rinato-card p-6">
					<h3 className="font-display text-lg mb-2">Produits</h3>
					<p className="text-sm text-slateLight/80 mb-4">Créer et modérer les pièces.</p>
					<div className="flex flex-wrap gap-2">
						<button type="button" className="rinato-cta" onClick={() => navigate('/admin/create', { replace: false })}>
							Créer
						</button>
						<button
							type="button"
							className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 transition"
							onClick={() => navigate('/admin/products/moderation', { replace: false })}
						>
							Modérer
						</button>
					</div>
				</div>
				<div className="rinato-card p-6">
					<h3 className="font-display text-lg mb-2">Utilisateurs</h3>
					<p className="text-sm text-slateLight/80 mb-4">Rôles et suspensions.</p>
					<button
						type="button"
						className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 transition"
						onClick={() => navigate('/admin/users', { replace: false })}
					>
						Gérer
					</button>
				</div>
				<div className="rinato-card p-6">
					<h3 className="font-display text-lg mb-2">Statistiques</h3>
					<p className="text-sm text-slateLight/80 mb-4">KPIs et activités récentes.</p>
					<button
						type="button"
						className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 transition"
						onClick={() => navigate('/admin/stats', { replace: false })}
					>
						Voir
					</button>
				</div>
				<div className="rinato-card p-6">
					<h3 className="font-display text-lg mb-2">Défis</h3>
					<p className="text-sm text-slateLight/80 mb-4">Créer et gérer les quiz.</p>
					<button
						type="button"
						className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 transition"
						onClick={() => navigate('/admin/defis', { replace: false })}
					>
						Gérer
					</button>
				</div>
			</div>
		</div>
	)
}
