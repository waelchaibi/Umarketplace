import { useEffect, useState } from 'react'
import axios from '../config/axios'
import { IMG_URL } from '../config'

type Challenge = {
	id: number
	title: string
	question: string
	type?: 'text' | 'qcm'
	options?: string[] | null
	imageUrl?: string | null
	prizeDescription?: string | null
	status: 'active' | 'closed'
	winnerUserId?: number | null
	winnerAt?: string | null
	createdAt: string
	updatedAt: string
}

export default function Defis() {
	const [loading, setLoading] = useState(false)
	const [items, setItems] = useState<Challenge[]>([])
	const [answers, setAnswers] = useState<Record<number, string>>({})
	const [selected, setSelected] = useState<Record<number, number | null>>({})
	const [submittingId, setSubmittingId] = useState<number | null>(null)
	const [result, setResult] = useState<Record<number, { isCorrect: boolean; isWinner: boolean }>>({})
	const [error, setError] = useState<string>('')

	const getImageUrl = (url?: string | null) => {
		if (!url) return ''
		if (url.startsWith('http')) return url
		return `${IMG_URL}${url}`
	}

	const load = async () => {
		setLoading(true)
		setError('')
		try {
			const res = await axios.get('/defis/active')
			setItems(res.data?.data || [])
		} catch (e: any) {
			setError('Erreur de chargement')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { load() }, [])

	const onSubmit = async (challengeId: number) => {
		const challenge = items.find(i => i.id === challengeId)
		if (!challenge) return
		let payload: any = {}
		if (challenge.type === 'qcm') {
			const idx = selected[challengeId]
			if (idx === null || idx === undefined) return
			payload.selectedOptionIndex = idx
		} else {
			const answerText = answers[challengeId] || ''
			if (!answerText.trim()) return
			payload.answerText = answerText
		}
		setSubmittingId(challengeId)
		try {
			const res = await axios.post(`/defis/${challengeId}/answer`, payload)
			const data = res.data?.data
			setResult(prev => ({ ...prev, [challengeId]: { isCorrect: !!data?.isCorrect, isWinner: !!data?.isWinner } }))
		} catch (e: any) {
			const msg = e?.response?.data?.error || 'Erreur'
			setResult(prev => ({ ...prev, [challengeId]: { isCorrect: false, isWinner: false } }))
			alert(msg)
		} finally {
			setSubmittingId(null)
		}
	}

	return (
		<div className="p-6 max-w-4xl mx-auto">
			<h1 className="text-2xl font-semibold mb-4">Défis actifs</h1>
			{loading && <div className="text-sm text-gray-500">Chargement...</div>}
			{!loading && error && <div className="text-sm text-red-600">{error}</div>}
			<div className="grid gap-4">
				{(items || []).map((c) => {
					const r = result[c.id]
					return (
						<div key={c.id} className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 p-4">
							<div className="flex items-start justify-between gap-4">
								<div>
									<h2 className="text-lg font-medium">{c.title}</h2>
									{c.prizeDescription && <p className="text-sm text-gray-600 dark:text-white/70 mt-1">🏆 {c.prizeDescription}</p>}
								</div>
								<span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{c.status}</span>
							</div>
							<p className="mt-3">{c.question}</p>
							{c.imageUrl && (
								<div className="mt-3">
									<img src={getImageUrl(c.imageUrl)} alt={c.title} className="max-h-64 rounded border border-black/10 dark:border-white/10 object-contain" />
								</div>
							)}
							{c.type === 'qcm' ? (
								<div className="mt-4 space-y-2">
									{(c.options || []).map((opt, idx) => (
										<label key={idx} className="flex items-center gap-2">
											<input
												type="radio"
												name={`qcm-${c.id}`}
												checked={selected[c.id] === idx}
												onChange={() => setSelected(prev => ({ ...prev, [c.id]: idx }))}
											/>
											<span>{opt}</span>
										</label>
									))}
									<div className="mt-2">
										<button
											onClick={() => onSubmit(c.id)}
											disabled={submittingId === c.id || selected[c.id] === null || selected[c.id] === undefined}
											className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
										>
											{submittingId === c.id ? 'Envoi...' : 'Valider'}
										</button>
									</div>
								</div>
							) : (
								<div className="mt-4 flex flex-col sm:flex-row gap-2">
									<label htmlFor={`answer-${c.id}`} className="sr-only">Votre réponse</label>
									<input
										id={`answer-${c.id}`}
										type="text"
										value={answers[c.id] || ''}
										onChange={(e) => setAnswers(prev => ({ ...prev, [c.id]: e.target.value }))}
										placeholder="Votre réponse"
										className="flex-1 px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
									/>
									<button
										onClick={() => onSubmit(c.id)}
										disabled={submittingId === c.id}
										className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
									>
										{submittingId === c.id ? 'Envoi...' : 'Envoyer'}
									</button>
								</div>
							)}
							{r && (
								<div className="mt-3 text-sm">
									{r.isCorrect ? (
										<span className="text-green-600">Bonne réponse{r.isWinner ? " 🎉 Vous êtes le/la premier·ère gagnant·e !" : " (mais un gagnant existe déjà)"}.</span>
									) : (
										<span className="text-red-600">Mauvaise réponse.</span>
									)}
								</div>
							)}
						</div>
					)
				})}
			</div>
			{!loading && (items || []).length === 0 && (
				<p className="text-sm text-gray-600 dark:text-white/70">Aucun défi actif pour le moment.</p>
			)}
		</div>
	)
}


