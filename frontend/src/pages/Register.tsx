import { useContext, useState } from 'react'
import toast from 'react-hot-toast'
import axios from '../config/axios'
import { useNavigate } from 'react-router-dom'
import { connectSocket } from '../lib/socket'
import { AuthContext } from '../main'

export default function Register() {
	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const navigate = useNavigate()
	const { setAuth } = useContext(AuthContext)

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		try {
			const res = await axios.post('/auth/register', { username, email, password })
			localStorage.setItem('token', res.data.data.token)
			localStorage.setItem('role', res.data.data.user.role)
			localStorage.setItem('userId', String(res.data.data.user.id))
			localStorage.setItem('username', String(res.data.data.user.username || ''))
			setAuth({ token: res.data.data.token, role: res.data.data.user.role, userId: String(res.data.data.user.id), username: String(res.data.data.user.username || '') })
			connectSocket(res.data.data.user.id)
			toast.success('Compte créé avec succès')
			navigate('/')
		} catch (err: any) {
			const api = err?.response?.data
			const validation = Array.isArray(api?.errors) ? api.errors.map((e: any) => e?.msg).filter(Boolean).join(' • ') : ''
			setError(validation || api?.error || 'Registration failed')
			toast.error(validation || api?.error || 'Inscription refusée')
		}
	}

	return (
		<div className="max-w-sm mx-auto p-6 mt-16 rinato-card">
			<h1 className="rinato-h2 mb-4">Créer un compte</h1>
			<form onSubmit={submit} className="space-y-4">
				<div className="space-y-1">
					<label className="text-sm text-slateLight/80">Nom d'utilisateur</label>
					<input className="w-full border border-white/10 rounded px-3 py-2 bg-white/5 text-slateLight placeholder-white/50" value={username} onChange={e => setUsername(e.target.value)} required />
				</div>
				<div className="space-y-1">
					<label className="text-sm text-slateLight/80">Email</label>
					<input className="w-full border border-white/10 rounded px-3 py-2 bg-white/5 text-slateLight placeholder-white/50" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
				</div>
				<div className="space-y-1">
					<label className="text-sm text-slateLight/80">Mot de passe</label>
					<input className="w-full border border-white/10 rounded px-3 py-2 bg-white/5 text-slateLight placeholder-white/50" value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete="new-password" required />
					<p className="text-xs text-slateLight/70 mt-1">Au moins 8 caractères, 1 majuscule et 1 chiffre.</p>
				</div>
				{error && <div className="text-red-400 text-sm">{error}</div>}
				<button className="w-full rinato-cta" type="submit">Créer mon compte</button>
			</form>
		</div>
	)
}
