import { useState } from 'react'
import axios from '../../config/axios'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function AdminLogin() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const navigate = useNavigate()

	const submit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError(null)
		try {
			const res = await axios.post('/auth/login', { email, password })
			if (res.data?.data?.user?.role !== 'admin') {
				setError('Admin access required')
				toast.error('Admin access required')
				return
			}
			localStorage.setItem('token', res.data.data.token)
			localStorage.setItem('role', res.data.data.user.role)
			localStorage.setItem('userId', String(res.data.data.user.id))
			localStorage.setItem('username', String(res.data.data.user.username || ''))
			toast.success('Welcome, admin')
			navigate('/admin')
		} catch (err: any) {
			const msg = err.response?.data?.error || 'Login failed'
			setError(msg)
			toast.error(msg)
		}
	}

	return (
		<div className="max-w-sm mx-auto p-6 mt-16 rinato-card">
			<h1 className="rinato-h2 mb-4">Espace Admin</h1>
			<form onSubmit={submit} className="space-y-4">
				<div className="space-y-1">
					<label className="text-sm text-slateLight/80">Email</label>
					<input className="w-full border border-white/10 px-3 py-2 bg-white/5 text-slateLight placeholder-white/50" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
				</div>
				<div className="space-y-1">
					<label className="text-sm text-slateLight/80">Mot de passe</label>
					<input className="w-full border border-white/10 px-3 py-2 bg-white/5 text-slateLight placeholder-white/50" value={password} onChange={e => setPassword(e.target.value)} type="password" required />
				</div>
				{error && <div className="text-red-400 text-sm">{error}</div>}
				<button className="w-full rinato-cta" type="submit">Se connecter</button>
			</form>
		</div>
	)
}




