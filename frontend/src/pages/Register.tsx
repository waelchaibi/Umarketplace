import { useContext, useState } from 'react'
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
			navigate('/')
		} catch (err: any) {
			setError(err.response?.data?.error || 'Registration failed')
		}
	}

	return (
		<div className="max-w-sm mx-auto p-6 mt-10 bg-white dark:bg-white text-gray-900 rounded-lg shadow">
			<h1 className="text-xl font-semibold mb-4">Register</h1>
			<form onSubmit={submit} className="space-y-3">
				<div className="space-y-1">
					<label className="text-sm">Username</label>
					<input className="w-full border border-black/10 dark:border-black/10 rounded px-3 py-2 bg-white dark:bg-white" value={username} onChange={e => setUsername(e.target.value)} required />
				</div>
				<div className="space-y-1">
					<label className="text-sm">Email</label>
					<input className="w-full border border-black/10 dark:border-black/10 rounded px-3 py-2 bg-white dark:bg-white" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
				</div>
				<div className="space-y-1">
					<label className="text-sm">Password</label>
					<input className="w-full border border-black/10 dark:border-black/10 rounded px-3 py-2 bg-white dark:bg-white" value={password} onChange={e => setPassword(e.target.value)} type="password" required />
				</div>
				{error && <div className="text-red-600 text-sm">{error}</div>}
				<button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2" type="submit">Create account</button>
			</form>
		</div>
	)
}
