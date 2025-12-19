import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
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

	if (loading) return <div className="p-6">Chargement...</div>
	if (!profile) return <div className="p-6">Introuvable</div>

	const save = async () => {
		try {
			await axios.put('/auth/profile', { firstName, lastName })
			toast.success('Profil enregistré')
		} catch (e: any) {
			toast.error(e?.response?.data?.error || 'Échec de sauvegarde')
		}
	}

	return (
		<div className="p-6 max-w-3xl mx-auto">
			<h1 className="rinato-h2 mb-6">Profil</h1>
			<div className="rinato-card p-6">
				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm text-slateLight/80 mb-1">Nom d'utilisateur</label>
						<div className="px-3 py-2 border border-white/10 bg-white/5">{profile.username}</div>
					</div>
					<div>
						<label className="block text-sm text-slateLight/80 mb-1">Email</label>
						<div className="px-3 py-2 border border-white/10 bg-white/5">{profile.email}</div>
					</div>
					<div>
						<label className="block text-sm text-slateLight/80 mb-1">Prénom</label>
						<input className="w-full px-3 py-2 border border-white/10 bg-white/5 text-slateLight placeholder-white/50" value={firstName} onChange={e => setFirstName(e.target.value)} />
					</div>
					<div>
						<label className="block text-sm text-slateLight/80 mb-1">Nom</label>
						<input className="w-full px-3 py-2 border border-white/10 bg-white/5 text-slateLight placeholder-white/50" value={lastName} onChange={e => setLastName(e.target.value)} />
					</div>
				</div>
				<div className="mt-6">
					<button onClick={save} className="rinato-cta">Enregistrer</button>
				</div>
			</div>
		</div>
	)
}
