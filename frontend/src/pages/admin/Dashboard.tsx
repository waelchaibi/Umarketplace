export default function Dashboard() {
	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="text-3xl font-display font-semibold mb-6">Admin Dashboard</h1>
			<div className="grid md:grid-cols-3 gap-6">
				<div className="rounded-2xl p-6 bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card backdrop-blur-xs">
					<h3 className="font-semibold mb-2">Products</h3>
					<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Create and manage marketplace items.</p>
					<div className="flex gap-2">
						<a className="inline-block px-4 py-2 rounded bg-gradient-to-r from-accent-purple to-accent-blue text-white" href="/admin/create">Create Product</a>
						<a className="inline-block px-4 py-2 rounded bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20" href="/admin/products/moderation">Moderate</a>
					</div>
				</div>
				<div className="rounded-2xl p-6 bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card backdrop-blur-xs">
					<h3 className="font-semibold mb-2">Users</h3>
					<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Manage roles and suspensions.</p>
					<a className="inline-block px-4 py-2 rounded bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20" href="/admin/users">Manage Users</a>
				</div>
				<div className="rounded-2xl p-6 bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card backdrop-blur-xs">
					<h3 className="font-semibold mb-2">Stats</h3>
					<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">KPIs and recent activity.</p>
					<a className="inline-block px-4 py-2 rounded bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20" href="/admin/stats">View Stats</a>
				</div>
				<div className="rounded-2xl p-6 bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card backdrop-blur-xs">
					<h3 className="font-semibold mb-2">Défis</h3>
					<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Create and manage quiz challenges.</p>
					<a className="inline-block px-4 py-2 rounded bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20" href="/admin/defis">Manage Défis</a>
				</div>
			</div>
		</div>
	)
}
