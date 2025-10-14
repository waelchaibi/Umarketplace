import { useEffect, useState } from 'react'
import axios from '../../config/axios'
import { IMG_URL } from '../../config'

export default function ProductsModeration() {
	const [rows, setRows] = useState<any[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const load = async () => {
		setError(null)
		try {
			const res = await axios.get('/admin/products')
			setRows(res.data.data || [])
		} catch (e: any) {
			setError(e.response?.data?.error || 'Failed to load products')
		} finally {
			setLoading(false)
		}
	}
	useEffect(() => { load() }, [])

	const hide = async (id: number) => { await axios.put(`/admin/products/${id}/hide`); await load() }
	const unhide = async (id: number) => { await axios.put(`/admin/products/${id}/unhide`); await load() }

	return (
		<div className="p-6 max-w-6xl mx-auto">
			<h1 className="text-3xl font-display font-semibold mb-6">Products Moderation</h1>
            <div className="rounded-2xl overflow-hidden bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card backdrop-blur-xs">
                <table className="w-full text-sm">
					<thead className="bg-gray-50/80 dark:bg-white/5">
						<tr>
                            <th className="text-left px-4 py-3">Image</th>
							<th className="text-left px-4 py-3">Title</th>
							<th className="text-left px-4 py-3">Owner</th>
							<th className="text-left px-4 py-3">Status</th>
							<th className="text-left px-4 py-3">Hidden</th>
							<th className="text-left px-4 py-3">Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr><td className="px-4 py-6" colSpan={5}>Loading...</td></tr>
						) : error ? (
							<tr><td className="px-4 py-6 text-red-600" colSpan={5}>{error}</td></tr>
						) : rows.length === 0 ? (
							<tr><td className="px-4 py-6" colSpan={5}>No products</td></tr>
                        ) : rows.map(p => (
                            <tr key={p.id} className="border-t border-black/5 dark:border-white/10">
                                <td className="px-4 py-3">
                                    {(() => { const img = (Array.isArray(p.images) && p.images[0]) ? (p.images[0].startsWith('/uploads') ? `${IMG_URL}${p.images[0]}` : p.images[0]) : null; return img ? (
                                        <img src={img} alt={p.title} className="h-12 w-16 object-cover rounded" />
                                    ) : <div className="h-12 w-16 bg-gray-100 dark:bg-white/10 rounded" /> })()}
                                </td>
								<td className="px-4 py-3">{p.title}</td>
								<td className="px-4 py-3">{p.owner?.username || p.ownerId}</td>
								<td className="px-4 py-3">{p.status}</td>
								<td className="px-4 py-3">{p.isHidden ? 'Yes' : 'No'}</td>
								<td className="px-4 py-3">
									{p.isHidden ? (
										<button className="px-3 py-1 rounded bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20" onClick={() => unhide(p.id)}>Unhide</button>
									) : (
										<button className="px-3 py-1 rounded bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20" onClick={() => hide(p.id)}>Hide</button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}

