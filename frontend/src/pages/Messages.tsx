import { useEffect, useMemo, useState } from 'react'
import axios from '../config/axios'
import { connectSocket, onMessage, offMessage } from '../lib/socket'

export default function Messages() {
	const [convos, setConvos] = useState<any[]>([])
	const [selected, setSelected] = useState<any | null>(null)
	const [thread, setThread] = useState<any[]>([])
	const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<any[]>([])

	const loadConvos = async () => {
		const res = await axios.get('/messages/conversations')
		setConvos(res.data.data || [])
	}
	const loadThread = async (userId: number) => {
		const res = await axios.get(`/messages/conversation/${userId}`)
		setThread(res.data.data || [])
	}

	useEffect(() => { loadConvos() }, [])

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query.trim()) { setMatches([]); return }
      try {
        const res = await axios.get('/users/search', { params: { q: query, limit: 8 } })
        setMatches(res.data.data || [])
      } catch { setMatches([]) }
    }, 250)
    return () => clearTimeout(t)
  }, [query])
	useEffect(() => {
		const userId = localStorage.getItem('userId')
		connectSocket(userId || undefined)
		const handler = (payload: any) => {
			if (selected && Number(payload.from) === Number(selected.id)) {
				loadThread(selected.id)
			}
			loadConvos()
		}
		onMessage(handler)
		return () => { offMessage(handler) }
	}, [selected])

	const send = async () => {
		if (!selected) return
		await axios.post('/messages/send', { receiverId: selected.id, content: text })
		setText('')
		await loadThread(selected.id)
	}

	return (
		<div className="p-6 grid gap-6 md:grid-cols-[260px_1fr]">
			<div className="rounded-2xl p-4 bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card backdrop-blur-xs">
				<h3 className="font-semibold mb-3">Conversations</h3>
        <div className="mb-2">
          <input className="w-full px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5" placeholder="Find people by username or email" value={query} onChange={e=>setQuery(e.target.value)} />
          {matches.length > 0 && (
            <div className="mt-1 border border-black/5 dark:border-white/10 rounded divide-y max-h-60 overflow-auto">
              {matches.map(u => (
                <button key={u.id} className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/10" onClick={() => { setSelected(u); loadThread(u.id); setQuery(''); setMatches([]) }}>{u.username} <span className="text-xs text-gray-500">{u.email}</span></button>
              ))}
            </div>
          )}
        </div>
				<ul className="space-y-1">
					{convos.map(u => (
						<li key={u.id}><button className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-white/10 ${selected?.id === u.id ? 'bg-gray-100 dark:bg-white/10' : ''}`} onClick={() => { setSelected(u); loadThread(u.id) }}>{u.username}</button></li>
					))}
				</ul>
			</div>
			<div className="rounded-2xl p-4 bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card backdrop-blur-xs min-h-[320px]">
				{selected ? (
					<div className="flex flex-col h-full">
						<h3 className="font-semibold mb-3">Chat with {selected.username}</h3>
						<div className="flex-1 border border-black/5 dark:border-white/10 rounded p-3 space-y-2 overflow-auto">
							{thread.map(m => (
								<div key={m.id} className={`max-w-[70%] px-3 py-2 rounded ${m.senderId === selected.id ? 'bg-gray-100 dark:bg-white/10' : 'bg-blue-600 text-white ml-auto'}`}>{m.senderId === selected.id ? selected.username : 'You'}: {m.content}</div>
							))}
						</div>
						<div className="mt-3 flex gap-2">
							<input className="flex-1 px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-accent-blue/50" value={text} onChange={e => setText(e.target.value)} />
							<button className="px-4 py-2 rounded bg-gradient-to-r from-accent-purple to-accent-blue text-white" onClick={send}>Send</button>
						</div>
					</div>
				) : <div className="text-gray-600 dark:text-gray-300">Select a conversation</div>}
			</div>
		</div>
	)
}
