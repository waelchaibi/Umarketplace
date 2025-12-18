export default function Dashboard() {
	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="rinato-h2 mb-6">Admin — RINATO</h1>
			<div className="grid md:grid-cols-3 gap-6">
				<div className="rinato-card p-6">
					<h3 className="font-display text-lg mb-2">Produits</h3>
					<p className="text-sm text-slateLight/80 mb-4">Créer et modérer les pièces.</p>
					<div className="flex gap-2">
						<a className="rinato-cta" href="/admin/create">Créer</a>
						<a className="px-4 py-2 bg-white/5 border border-white/10" href="/admin/products/moderation">Modérer</a>
					</div>
				</div>
				<div className="rinato-card p-6">
					<h3 className="font-display text-lg mb-2">Utilisateurs</h3>
					<p className="text-sm text-slateLight/80 mb-4">Rôles et suspensions.</p>
					<a className="px-4 py-2 bg-white/5 border border-white/10" href="/admin/users">Gérer</a>
				</div>
				<div className="rinato-card p-6">
					<h3 className="font-display text-lg mb-2">Statistiques</h3>
					<p className="text-sm text-slateLight/80 mb-4">KPIs et activités récentes.</p>
					<a className="px-4 py-2 bg-white/5 border border-white/10" href="/admin/stats">Voir</a>
				</div>
				<div className="rinato-card p-6">
					<h3 className="font-display text-lg mb-2">Défis</h3>
					<p className="text-sm text-slateLight/80 mb-4">Créer et gérer les quiz.</p>
					<a className="px-4 py-2 bg-white/5 border border-white/10" href="/admin/defis">Gérer</a>
				</div>
			</div>
		</div>
	)
}
