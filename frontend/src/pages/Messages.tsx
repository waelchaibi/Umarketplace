import { useEffect, useMemo, useState } from 'react'
import axios from '../config/axios'
import { connectSocket, onMessage, offMessage, onTradeOffer, offTradeOffer } from '../lib/socket'
import toast from 'react-hot-toast'

export default function Messages() {
	const [convos, setConvos] = useState<any[]>([])
	const [selected, setSelected] = useState<any | null>(null)
	const [thread, setThread] = useState<any[]>([])
	const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [matches, setMatches] = useState<any[]>([])
  // Trade modal state
  const [tradeOpen, setTradeOpen] = useState(false)
  const [myItems, setMyItems] = useState<any[]>([])
  const [theirItems, setTheirItems] = useState<any[]>([])
  const [offeredId, setOfferedId] = useState<number | null>(null)
  const [requestedId, setRequestedId] = useState<number | null>(null)
  const [additionalAmount, setAdditionalAmount] = useState<number | ''>('')
  const [note, setNote] = useState('')
  const [offers, setOffers] = useState<any[]>([])

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
    const tradeHandler = (_: any) => {
      if (selected) loadPeerOffers(selected.id)
    }
    onTradeOffer(tradeHandler)
		return () => { offMessage(handler); offTradeOffer(tradeHandler) }
	}, [selected])

	const send = async () => {
		if (!selected) return
		await axios.post('/messages/send', { receiverId: selected.id, content: text })
		setText('')
		await loadThread(selected.id)
	}

  // Load inventories when opening trade modal
  useEffect(() => {
    if (!tradeOpen) return
    (async () => {
      try {
        const uid = localStorage.getItem('userId')
        if (uid) {
          const mine = await axios.get(`/products/user/${uid}`)
          setMyItems(mine.data?.data || [])
        } else {
          setMyItems([])
        }
        if (selected?.id) {
          const theirs = await axios.get(`/products/user/${selected.id}`)
          setTheirItems(theirs.data?.data || [])
        } else {
          setTheirItems([])
        }
      } catch {
        setMyItems([]); setTheirItems([])
      }
    })()
  }, [tradeOpen, selected])

  const offerTrade = async () => {
    try {
      if (!selected) return
      if (!offeredId || !requestedId) { toast.error('Choisissez vos deux pièces'); return }
      const body: any = {
        toUserId: selected.id,
        offeredProductId: offeredId,
        requestedProductId: requestedId,
        message: note
      }
      if (additionalAmount !== '') body.additionalAmount = Number(additionalAmount)
      await axios.post('/trades/offer', body)
      toast.success('Offre d’échange envoyée')
      setTradeOpen(false)
      setOfferedId(null); setRequestedId(null); setAdditionalAmount(''); setNote('')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Échec de l’offre')
    }
  }

  const loadPeerOffers = async (peerId: number) => {
    try {
      const sent = await axios.get('/trades/sent')
      const rec = await axios.get('/trades/received')
      const uid = Number(localStorage.getItem('userId') || '0')
      const all = ([] as any[]).concat(sent.data?.data || [], rec.data?.data || [])
      const filtered = all.filter(o => (o.fromUserId === uid && o.toUserId === peerId) || (o.toUserId === uid && o.fromUserId === peerId))
      setOffers(filtered)
    } catch {
      setOffers([])
    }
  }

  useEffect(() => {
    if (selected) loadPeerOffers(selected.id)
  }, [selected])

	return (
		<div className="p-6 grid gap-6 md:grid-cols-[260px_1fr]">
			<div className="rinato-card p-4">
				<h3 className="font-display text-lg mb-3">Conversations</h3>
        <div className="mb-2">
          <input className="w-full px-3 py-2 border border-white/10 bg-white/5 text-slateLight placeholder-white/50" placeholder="Rechercher par nom ou email" value={query} onChange={e=>setQuery(e.target.value)} />
          {matches.length > 0 && (
            <div className="mt-1 border border-white/10 rounded divide-y divide-white/10 max-h-60 overflow-auto bg-midnight">
              {matches.map(u => (
                <button key={u.id} className="w-full text-left px-3 py-2 hover:bg-white/5" onClick={() => { setSelected(u); loadThread(u.id); setQuery(''); setMatches([]) }}>{u.username} <span className="text-xs text-slateLight/60">{u.email}</span></button>
              ))}
            </div>
          )}
        </div>
				<ul className="space-y-1">
					{convos.map(u => (
						<li key={u.id}><button className={`w-full text-left px-3 py-2 hover:bg-white/5 border border-transparent ${selected?.id === u.id ? 'border-rinato-copper bg-white/5' : ''}`} onClick={() => { setSelected(u); loadThread(u.id) }}>{u.username}</button></li>
					))}
				</ul>
			</div>
			<div className="rinato-card p-4 min-h-[320px]">
				{selected ? (
					<div className="flex flex-col h-full">
						<div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg">Discussion avec {selected.username}</h3>
              <button className="px-3 py-1 bg-white/5 border border-white/10" onClick={()=>setTradeOpen(true)}>Proposer un échange</button>
            </div>
            {/* Trade offers with this user */}
            <div className="mb-3 border border-white/10 p-3">
              <div className="text-sm text-slateLight/80 mb-2">Échanges avec {selected.username}</div>
              <div className="space-y-2">
                {(offers || []).length === 0 && <div className="text-sm text-slateLight/60">Aucune offre.</div>}
                {(offers || []).map((o: any) => {
                  const youAreReceiver = Number(localStorage.getItem('userId')||'0') === Number(o.toUserId)
                  const youAreSender = Number(localStorage.getItem('userId')||'0') === Number(o.fromUserId)
                  return (
                    <div key={o.id} className="flex flex-wrap items-center gap-2 border border-white/10 p-2">
                      <div className="flex-1">
                        <div className="text-sm">
                          {youAreReceiver ? 'Reçu:' : 'Envoyé:'} {o.offeredProduct?.title || `#${o.offeredProductId}`} → {o.requestedProduct?.title || `#${o.requestedProductId}`}
                          {Number(o.additionalAmount) > 0 && <> + € {Number(o.additionalAmount)}</>}
                        </div>
                        <div className="text-xs text-slateLight/70">Statut: {o.status}</div>
                      </div>
                      {youAreReceiver && o.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button className="px-2 py-1 bg-white/5 border border-white/10" onClick={async()=>{ try{ await axios.put(`/trades/${o.id}/accept`); toast.success('Offre acceptée'); await loadPeerOffers(selected.id) } catch(e:any){ toast.error(e?.response?.data?.error || 'Échec') }}}>Accepter</button>
                          <button className="px-2 py-1 bg-white/5 border border-white/10" onClick={async()=>{ try{ await axios.put(`/trades/${o.id}/decline`); toast.success('Offre refusée'); await loadPeerOffers(selected.id) } catch(e:any){ toast.error(e?.response?.data?.error || 'Échec') }}}>Refuser</button>
                        </div>
                      )}
                      {youAreSender && o.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button className="px-2 py-1 bg-white/5 border border-white/10" onClick={async()=>{ try{ await axios.delete(`/trades/${o.id}`); toast.success('Offre annulée'); await loadPeerOffers(selected.id) } catch(e:any){ toast.error(e?.response?.data?.error || 'Échec') }}}>Annuler</button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
						<div className="flex-1 border border-white/10 rounded p-3 space-y-2 overflow-auto">
							{thread.map(m => (
                <div key={m.id} className={`max-w-[70%] px-3 py-2 block ${m.senderId === selected.id ? 'bg-white/5 border border-white/10' : 'bg-rinato-copper text-white ml-auto'}`}>{m.senderId === selected.id ? selected.username : 'Vous'}: {m.content}</div>
							))}
						</div>
						<div className="mt-3 flex gap-2">
							<input className="flex-1 px-3 py-2 border border-white/10 bg-white/5 text-slateLight placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-rinato-copper" value={text} onChange={e => setText(e.target.value)} />
							<button className="rinato-cta px-4 py-2" onClick={send}>Envoyer</button>
						</div>
					</div>
				) : <div className="text-slateLight/80">Sélectionnez une conversation</div>}
			</div>

      {/* Trade modal */}
      {tradeOpen && selected && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="rinato-card w-full max-w-2xl max-h-[85vh] overflow-y-auto mb-20 md:mb-0">
            <div className="p-4 border-b border-white/10 sticky top-0 bg-midnight z-10 flex items-center justify-between">
              <div className="rinato-h3">Échange avec {selected.username}</div>
              <button onClick={()=>setTradeOpen(false)} className="px-2 py-1 bg-white/5 border border-white/10">Fermer</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-sm text-slateLight/80 mb-1">Votre pièce</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {(myItems || []).map((it) => (
                    <button key={it.id} onClick={()=>setOfferedId(it.id)} className={`flex items-center gap-2 p-2 border ${offeredId===it.id?'border-rinato-copper':'border-white/10'} bg-white/5 text-left`}>
                      <span className="font-display">{it.title}</span>
                      <span className="ml-auto text-sm">€ {it.currentPrice ?? it.originalPrice ?? '-'}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-slateLight/80 mb-1">Pièce de {selected.username}</div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {(theirItems || []).map((it) => (
                    <button key={it.id} onClick={()=>setRequestedId(it.id)} className={`flex items-center gap-2 p-2 border ${requestedId===it.id?'border-rinato-copper':'border-white/10'} bg-white/5 text-left`}>
                      <span className="font-display">{it.title}</span>
                      <span className="ml-auto text-sm">€ {it.currentPrice ?? it.originalPrice ?? '-'}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-slateLight/80 mb-1">Montant additionnel (optionnel)</label>
                  <input className="w-full px-3 py-2 border border-white/10 bg-white/5 text-slateLight" type="number" value={additionalAmount as any} onChange={e=>setAdditionalAmount(e.target.value===''?'':Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm text-slateLight/80 mb-1">Message</label>
                  <input className="w-full px-3 py-2 border border-white/10 bg-white/5 text-slateLight" value={note} onChange={e=>setNote(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="rinato-cta" onClick={offerTrade}>Envoyer l’offre</button>
              </div>
            </div>
          </div>
        </div>
      )}
		</div>
	)
}
