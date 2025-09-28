import { useEffect, useState } from 'react'
import axios from '../config/axios'

export default function Profile() {
	const [profile, setProfile] = useState<any>(null)
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const load = async () => {
			const res = await axios.get('/auth/profile')
			setProfile(res.data.data)
			setFirstName(res.data.data?.firstName || '')
			setLastName(res.data.data?.lastName || '')
			setLoading(false)
		}
		load()
	}, [])

	if (loading) return <div className="p-6">Loading...</div>
	if (!profile) return <div className="p-6">Not found</div>

	const save = async () => {
		await axios.put('/auth/profile', { firstName, lastName })
		alert('Saved')
	}

	return (
		<div className="p-6 max-w-3xl mx-auto">
			<h1 className="text-3xl font-display font-semibold mb-6">Profile</h1>
			<div className="rounded-2xl bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 p-6 shadow-card backdrop-blur-xs">
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Username</label>
						<div className="px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5">{profile.username}</div>
					</div>
					<div>
						<label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Email</label>
						<div className="px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/5">{profile.email}</div>
					</div>
					<div>
						<label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">First name</label>
						<input className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-accent-blue/50" value={firstName} onChange={e => setFirstName(e.target.value)} />
					</div>
					<div>
						<label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Last name</label>
						<input className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-accent-blue/50" value={lastName} onChange={e => setLastName(e.target.value)} />
					</div>
				</div>
				<div className="mt-6">
					<button onClick={save} className="px-4 py-2 rounded bg-gradient-to-r from-accent-purple to-accent-blue text-white shadow hover:opacity-90 transition">Save changes</button>
				</div>
			</div>
		</div>
	)
}
