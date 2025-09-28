import { useEffect, useState } from 'react'
import axios from '../../config/axios'

export default function Users() {
	const [rows, setRows] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

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
		await load()
	}
	const toggleSuspend = async (id: number, isSuspended: boolean) => {
		await axios.put(`/admin/users/${id}/suspend`, { isSuspended })
		await load()
	}

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="text-3xl font-display font-semibold mb-6">Users</h1>
			<div className="rounded-2xl overflow-hidden bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card backdrop-blur-xs">
				<table className="w-full text-sm">
					<thead className="bg-gray-50/80 dark:bg-white/5">
						<tr>
							<th className="text-left px-4 py-3">User</th>
							<th className="text-left px-4 py-3">Email</th>
							<th className="text-left px-4 py-3">Role</th>
							<th className="text-left px-4 py-3">Status</th>
							<th className="text-left px-4 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td className="px-4 py-6" colSpan={5}>Loading...</td></tr>
						) : error ? (
							<tr><td className="px-4 py-6 text-red-600" colSpan={5}>{error}</td></tr>
						) : rows.length === 0 ? (
							<tr><td className="px-4 py-6" colSpan={5}>No users</td></tr>
						) : rows.map(u => (
							<tr key={u.id} className="border-t border-black/5 dark:border-white/10">
								<td className="px-4 py-3">{u.username}</td>
								<td className="px-4 py-3">{u.email}</td>
								<td className="px-4 py-3">
									<select className="px-2 py-1 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" value={u.role} onChange={e => changeRole(u.id, e.target.value)}>
										<option value="user">user</option>
										<option value="admin">admin</option>
									</select>
								</td>
								<td className="px-4 py-3">{u.isSuspended ? 'Suspended' : 'Active'}</td>
								<td className="px-4 py-3">
									<button className="px-3 py-1 rounded bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20" onClick={() => toggleSuspend(u.id, !u.isSuspended)}>{u.isSuspended ? 'Unsuspend' : 'Suspend'}</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

