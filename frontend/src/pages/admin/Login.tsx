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
		<div className="max-w-sm mx-auto p-6 mt-10 bg-white dark:bg-night-800/60 rounded-lg shadow border border-black/5 dark:border-white/10">
			<h1 className="text-xl font-semibold mb-4">Admin Login</h1>
			<form onSubmit={submit} className="space-y-3">
				<div className="space-y-1">
					<label className="text-sm">Email</label>
					<input className="w-full border rounded px-3 py-2 bg-white dark:bg-white/5" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
				</div>
				<div className="space-y-1">
					<label className="text-sm">Password</label>
					<input className="w-full border rounded px-3 py-2 bg-white dark:bg-white/5" value={password} onChange={e => setPassword(e.target.value)} type="password" required />
				</div>
				{error && <div className="text-red-600 text-sm">{error}</div>}
				<button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2" type="submit">Login</button>
			</form>
		</div>
	)
}




