import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import axios from '../../config/axios'

type Challenge = {
	id: number
	title: string
	question: string
	prizeDescription?: string | null
	status: 'active' | 'closed'
	winnerUserId?: number | null
	createdAt: string
	updatedAt: string
}

export default function AdminDefis() {
	const [loading, setLoading] = useState(false)
	const [items, setItems] = useState<Challenge[]>([])
	const [form, setForm] = useState<{ type: 'text' | 'qcm'; title: string; question: string; correctAnswer: string; prizeDescription: string; options: string[]; correctOptionIndex: number | null; image: File | null }>({
		type: 'text',
		title: '',
		question: '',
		correctAnswer: '',
		prizeDescription: '',
		options: ['', '', '', ''],
		correctOptionIndex: null,
		image: null
	})
	const [submitting, setSubmitting] = useState(false)
	const [page, setPage] = useState(1)
	const [limit] = useState(20)
	const [answersOpenFor, setAnswersOpenFor] = useState<number | null>(null)
	const [answersLoading, setAnswersLoading] = useState(false)
	const [answers, setAnswers] = useState<any[]>([])

	const load = async () => {
		setLoading(true)
		try {
			const res = await axios.get('/admin/defis', { params: { page, limit } })
			setItems(res.data?.data?.items || [])
		} catch {
			// noop
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { load() }, [page])

	const createChallenge = async () => {
		if (!form.title.trim() || !form.question.trim()) return
		if (form.type === 'text' && !form.correctAnswer.trim()) return
		if (form.type === 'qcm') {
			const filled = form.options.map(o => o.trim()).filter(Boolean)
			if (filled.length < 2) { alert('QCM: au moins 2 options'); return }
			if (form.correctOptionIndex === null || form.correctOptionIndex < 0 || form.correctOptionIndex >= form.options.length) { alert('QCM: choisir la bonne réponse'); return }
		}
		setSubmitting(true)
		try {
			const fd = new FormData()
			fd.append('type', form.type)
			fd.append('title', form.title)
			fd.append('question', form.question)
			fd.append('prizeDescription', form.prizeDescription)
			if (form.type === 'text') {
				fd.append('correctAnswer', form.correctAnswer)
			} else {
				const options = form.options.map(o => o.trim()).filter(Boolean)
				fd.append('options', JSON.stringify(options))
				if (form.correctOptionIndex !== null) fd.append('correctOptionIndex', String(form.correctOptionIndex))
			}
			if (form.image) fd.append('image', form.image)
			await axios.post('/admin/defis', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
			setForm({ type: 'text', title: '', question: '', correctAnswer: '', prizeDescription: '', options: ['', '', '', ''], correctOptionIndex: null, image: null })
			await load()
			toast.success('Défi créé')
		} catch (e: any) {
			const msg = e?.response?.data?.error || 'Échec de création du défi'
			toast.error(msg)
		} finally {
			setSubmitting(false)
		}
	}

	const closeChallenge = async (id: number) => {
		try {
			await axios.post(`/admin/defis/${id}/close`)
			toast.success('Défi clôturé')
			await load()
		} catch (e: any) {
			toast.error(e?.response?.data?.error || 'Échec de clôture')
		}
	}

	const toggleAnswers = async (id: number) => {
		if (answersOpenFor === id) {
			setAnswersOpenFor(null)
			setAnswers([])
			return
		}
		setAnswersOpenFor(id)
		setAnswersLoading(true)
		try {
			const res = await axios.get(`/admin/defis/${id}/answers`)
			setAnswers(res.data?.data || [])
		} catch {
			setAnswers([])
		} finally {
			setAnswersLoading(false)
		}
	}

	return (
		<div className="p-6 max-w-5xl mx-auto">
			<h1 className="text-2xl font-semibold mb-4">Admin - Défis</h1>
			<div className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4 mb-6">
				<h2 className="text-lg font-medium mb-3">Créer un nouveau défi</h2>
				<div className="grid gap-3">
					<div className="grid grid-cols-2 gap-3">
						<div>
							<label className="block text-sm mb-1">Type</label>
							<select className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}>
								<option value="text">Texte</option>
								<option value="qcm">QCM</option>
							</select>
						</div>
						<div>
							<label className="block text-sm mb-1">Image (optionnel)</label>
							<input type="file" accept="image/*" onChange={(e) => setForm(f => ({ ...f, image: e.target.files?.[0] || null }))} />
						</div>
					</div>
					<div>
						<label htmlFor="title" className="block text-sm mb-1">Titre</label>
						<input id="title" className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
					</div>
					<div>
						<label htmlFor="question" className="block text-sm mb-1">Question</label>
						<textarea id="question" className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" rows={3} value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} />
					</div>
					{form.type === 'text' ? (
						<div>
							<label htmlFor="correctAnswer" className="block text-sm mb-1">Bonne réponse (texte exact)</label>
							<input id="correctAnswer" className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: e.target.value })} />
						</div>
					) : (
						<div className="grid gap-2">
							<label className="block text-sm">Options (QCM)</label>
							{form.options.map((opt, idx) => (
								<div key={idx} className="flex items-center gap-2">
									<input
										type="radio"
										name="correct"
										checked={form.correctOptionIndex === idx}
										onChange={() => setForm(f => ({ ...f, correctOptionIndex: idx }))}
										title="Bonne réponse"
									/>
									<input
										className="flex-1 px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5"
										placeholder={`Option ${idx + 1}`}
										value={opt}
										onChange={(e) => {
											const next = [...form.options]
											next[idx] = e.target.value
											setForm(f => ({ ...f, options: next }))
										}}
									/>
								</div>
							))}
							<div className="flex gap-2">
								<button type="button" className="px-3 py-1 rounded bg-gray-100 dark:bg-white/10" onClick={() => setForm(f => ({ ...f, options: [...f.options, ''] }))}>Ajouter</button>
								<button type="button" className="px-3 py-1 rounded bg-gray-100 dark:bg-white/10" onClick={() => setForm(f => ({ ...f, options: f.options.length > 2 ? f.options.slice(0, -1) : f.options }))}>Retirer</button>
							</div>
						</div>
					)}
					<div>
						<label htmlFor="prize" className="block text-sm mb-1">Description du prix (optionnel)</label>
						<input id="prize" className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" value={form.prizeDescription} onChange={e => setForm({ ...form, prizeDescription: e.target.value })} />
					</div>
					<div className="flex justify-end">
						<button onClick={createChallenge} disabled={submitting} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
							{submitting ? 'Création...' : 'Créer'}
						</button>
					</div>
				</div>
			</div>

			<div>
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-lg font-medium">Défis</h2>
					<div className="flex items-center gap-2">
						<button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-gray-100 dark:bg-white/10">Prev</button>
						<span className="text-sm">Page {page}</span>
						<button onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded bg-gray-100 dark:bg-white/10">Next</button>
					</div>
				</div>
				{loading && <div className="text-sm text-gray-500">Chargement...</div>}
				<div className="grid gap-3">
					{(items || []).map(c => (
						<div key={c.id} className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4">
							<div className="flex items-start justify-between gap-4">
								<div>
									<h3 className="text-base font-semibold">{c.title}</h3>
									<p className="text-sm mt-1">{c.question}</p>
									{c.prizeDescription && <p className="text-xs text-gray-600 dark:text-white/70 mt-1">🏆 {c.prizeDescription}</p>}
								</div>
								<div className="flex items-center gap-2">
									<span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{c.status}</span>
									{c.status === 'active' && (
										<button onClick={() => closeChallenge(c.id)} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Clore</button>
									)}
									<button onClick={() => toggleAnswers(c.id)} className="px-3 py-1 rounded bg-gray-800 text-white hover:bg-black/90">
										{answersOpenFor === c.id ? 'Masquer réponses' : 'Voir réponses'}
									</button>
								</div>
							</div>
							{answersOpenFor === c.id && (
								<div className="mt-4 overflow-x-auto">
									{answersLoading ? (
										<div className="text-sm text-gray-500">Chargement des réponses...</div>
									) : (
										<table className="min-w-full text-sm">
											<thead>
												<tr className="text-left border-b border-black/10 dark:border-white/10">
													<th className="py-2 pr-3">Utilisateur</th>
													<th className="py-2 pr-3">IP</th>
													<th className="py-2 pr-3">Réponse</th>
													<th className="py-2 pr-3">Correct</th>
													<th className="py-2">Date</th>
												</tr>
											</thead>
											<tbody>
												{(answers || []).length === 0 && (
													<tr><td colSpan={5} className="py-3 text-gray-500">Aucune réponse.</td></tr>
												)}
												{(answers || []).map((a: any) => (
													<tr key={a.id} className="border-b border-black/5 dark:border-white/5">
														<td className="py-2 pr-3">{a.user?.username || '-'}</td>
														<td className="py-2 pr-3">{a.ipAddress || '-'}</td>
														<td className="py-2 pr-3 max-w-[360px] truncate" title={a.answerText}>{a.answerText}</td>
														<td className="py-2 pr-3">{a.isCorrect ? 'Oui' : 'Non'}</td>
														<td className="py-2">{new Date(a.createdAt).toLocaleString()}</td>
													</tr>
												))}
											</tbody>
										</table>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	)
}


