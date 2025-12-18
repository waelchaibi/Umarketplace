import { useEffect, useMemo, useState } from 'react'
import axios from '../../config/axios'
import toast from 'react-hot-toast'

export default function Users() {
	const [rows, setRows] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [search, setSearch] = useState('')
	const [sortKey, setSortKey] = useState<'username'|'email'|'role'>('username')
	const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
	const [perPage, setPerPage] = useState<number>(10)
	const [page, setPage] = useState<number>(1)

	const load = async () => {
		setError(null)
		try {
			const res = await axios.get('/admin/users')
			setRows(res.data.data || [])
		} catch (e: any) {
			setError(e.response?.data?.error || 'Failed to load users')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { load() }, [])

	const changeRole = async (id: number, role: string) => {
		await axios.put(`/admin/users/${id}/role`, { role })
		toast.success('Role updated')
		await load()
	}
	const toggleSuspend = async (id: number, isSuspended: boolean) => {
		if (!confirm(`${isSuspended ? 'Suspend' : 'Unsuspend'} this user?`)) return
		await axios.put(`/admin/users/${id}/suspend`, { isSuspended })
		toast.success(isSuspended ? 'User suspended' : 'User unsuspended')
		await load()
	}

	const filtered = useMemo(() => rows.filter(r => {
		const s = search.trim().toLowerCase()
		if (!s) return true
		return String(r.username).toLowerCase().includes(s) || String(r.email).toLowerCase().includes(s)
	}), [rows, search])

	const sorted = useMemo(() => filtered.slice().sort((a,b) => {
		const va = String(a[sortKey] || '').toLowerCase()
		const vb = String(b[sortKey] || '').toLowerCase()
		const cmp = va.localeCompare(vb)
		return sortDir === 'asc' ? cmp : -cmp
	}), [filtered, sortKey, sortDir])

	const pages = Math.max(1, Math.ceil(sorted.length / perPage))
	const pageRows = useMemo(() => sorted.slice((page-1)*perPage, (page-1)*perPage + perPage), [sorted, page, perPage])

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="rinato-h2 mb-6">Utilisateurs</h1>
			<div className="flex flex-wrap items-end gap-3 mb-3 rinato-card p-4">
				<div>
					<label className="block text-xs mb-1 text-slateLight/80">Recherche</label>
					<input className="px-3 py-2 border border-white/10 bg-white/5 text-slateLight placeholder-white/50" placeholder="nom ou email" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
				</div>
				<div>
					<label className="block text-xs mb-1 text-slateLight/80">Tri</label>
					<select className="px-3 py-2 border border-white/10 bg-white/5" value={sortKey} onChange={e=>{ setSortKey(e.target.value as any); setPage(1) }}>
						<option value="username">Username</option>
						<option value="email">Email</option>
						<option value="role">Role</option>
					</select>
				</div>
				<div>
					<label className="block text-xs mb-1 text-slateLight/80">Ordre</label>
					<select className="px-3 py-2 border border-white/10 bg-white/5" value={sortDir} onChange={e=>{ setSortDir(e.target.value as any); setPage(1) }}>
						<option value="asc">Asc</option>
						<option value="desc">Desc</option>
					</select>
				</div>
				<div>
					<label className="block text-xs mb-1 text-slateLight/80">Par page</label>
					<select className="px-3 py-2 border border-white/10 bg-white/5" value={perPage} onChange={e=>{ setPerPage(Number(e.target.value)); setPage(1) }}>
						<option value={10}>10</option>
						<option value={20}>20</option>
						<option value={50}>50</option>
					</select>
				</div>
			</div>
			<div className="rinato-card overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-white/5">
						<tr>
							<th className="text-left px-4 py-3">Utilisateur</th>
							<th className="text-left px-4 py-3">Email</th>
							<th className="text-left px-4 py-3">Role</th>
							<th className="text-left px-4 py-3">Statut</th>
							<th className="text-left px-4 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td className="px-4 py-6" colSpan={5}>Loading...</td></tr>
						) : error ? (
							<tr><td className="px-4 py-6 text-red-600" colSpan={5}>{error}</td></tr>
						) : filtered.length === 0 ? (
							<tr><td className="px-4 py-6" colSpan={5}>No users</td></tr>
						) : pageRows.map(u => (
							<tr key={u.id} className="border-t border-white/10">
								<td className="px-4 py-3">{u.username}</td>
								<td className="px-4 py-3">{u.email}</td>
								<td className="px-4 py-3">
									<select className="px-2 py-1 border border-white/10 bg-white/5" value={u.role} onChange={e => changeRole(u.id, e.target.value)}>
										<option value="user">user</option>
										<option value="admin">admin</option>
									</select>
								</td>
								<td className="px-4 py-3">{u.isSuspended ? 'Suspendu' : 'Actif'}</td>
								<td className="px-4 py-3">
									<button className="px-3 py-1 bg-white/5 border border-white/10" onClick={() => toggleSuspend(u.id, !u.isSuspended)}>{u.isSuspended ? 'Réactiver' : 'Suspendre'}</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className="flex items-center justify-center gap-2 mt-3">
				<button className="px-3 py-1 bg-white/5 border border-white/10 disabled:opacity-50" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Préc.</button>
				<div className="text-sm text-slateLight/80">Page {page} / {pages}</div>
				<button className="px-3 py-1 bg-white/5 border border-white/10 disabled:opacity-50" disabled={page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))}>Suiv.</button>
			</div>
		</div>
	)
}

