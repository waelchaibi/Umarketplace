import { useQuery } from '@tanstack/react-query'
import axios from '../config/axios'
import { useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { IMG_URL } from '../config'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

export default function ProductDetails() {
	const { id } = useParams()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ['product', id],
		queryFn: async () => (await axios.get(`/products/${id}`)).data.data,
		enabled: !!id
	})

	// Hooks must not be placed after conditional returns; compute with safe fallbacks
	const images: string[] = useMemo(() => Array.isArray(data?.images) ? data!.images.map((u: string) => u.startsWith('/uploads') ? `${IMG_URL}${u}` : u) : [], [data])
	const [activeIdx, setActiveIdx] = useState<number>(0)
	const [lightbox, setLightbox] = useState<boolean>(false)
  const [tradeOpen, setTradeOpen] = useState(false)
  const [myItems, setMyItems] = useState<any[]>([])
  const [offeredId, setOfferedId] = useState<number | null>(null)
  const [additionalAmount, setAdditionalAmount] = useState<number | ''>('')
  const [note, setNote] = useState('')

    const canBuy = useMemo(() => {
        const userId = Number(localStorage.getItem('userId') || '0')
        if (!data) return false
        if (data.status !== 'available') return false
        if (Number(data.ownerId) === userId) return false
        return true
    }, [data])

    const buyNow = async () => {
        if (!id) return
        const token = localStorage.getItem('token')
        if (!token) { navigate('/login'); return }
        try {
            await axios.post(`/marketplace/buy/${id}`)
            toast.success('Purchase completed')
            await refetch()
            await queryClient.invalidateQueries({ queryKey: ['products'] })
            navigate('/my-products')
        } catch (e: any) {
            toast.error(e.response?.data?.error || 'Purchase failed')
        }
    }

    // Load current user's inventory for trade offer
    useEffect(() => {
      if (!tradeOpen) return
      (async () => {
        try {
          const uid = localStorage.getItem('userId')
          if (!uid) return
          const res = await axios.get(`/products/user/${uid}`)
          setMyItems(res.data?.data || [])
        } catch {
          setMyItems([])
        }
      })()
    }, [tradeOpen])

    const offerTrade = async () => {
      try {
        if (!data) return
        if (!offeredId) { toast.error('Choisissez une pièce'); return }
        const body: any = {
          toUserId: data.ownerId,
          offeredProductId: offeredId,
          requestedProductId: data.id,
          message: note
        }
        if (additionalAmount !== '') body.additionalAmount = Number(additionalAmount)
        await axios.post('/trades/offer', body)
        toast.success('Offre d’échange envoyée')
        setTradeOpen(false)
        setOfferedId(null); setAdditionalAmount(''); setNote('')
      } catch (e: any) {
        toast.error(e?.response?.data?.error || 'Échec de l’offre')
      }
    }

	if (isLoading) return <div className="p-6">Chargement...</div>
	if (isError) return <div className="p-6">Erreur de chargement.</div>
	if (!data) return <div className="p-6">Introuvable</div>

return (
    <div className="p-6 max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
            <div className="rinato-card p-4">
                <div className="aspect-[4/3] overflow-hidden rounded-lg mb-3 cursor-zoom-in" onClick={() => setLightbox(true)}>
                    {images[activeIdx] ? (
                        <img src={images[activeIdx]} alt={data.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-white/10" />
                    )}
                </div>
                {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                        {images.map((src, i) => (
                            <button key={i} onClick={() => setActiveIdx(i)} className={`h-16 w-20 rounded overflow-hidden border ${i === activeIdx ? 'border-rinato-copper' : 'border-white/10'}`}>
                                <img src={src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="rinato-card p-6">
                <div className="rinato-eyebrow mb-1">Pièce unique</div>
                <h1 className="rinato-h2 mb-2">{data.title}</h1>
                <p className="text-sm text-slateLight/80 mb-4">{data.category} • {data.condition}</p>
                <p className="mb-6 whitespace-pre-wrap text-slateLight/90">{data.description}</p>
                <p className="text-2xl font-sans font-bold mb-4">€ {data.currentPrice ?? data.originalPrice ?? '-'}</p>
                <div className="flex flex-wrap gap-2">
                    <button disabled={!canBuy} onClick={buyNow} className={`rinato-cta ${!canBuy ? 'opacity-50 cursor-not-allowed' : ''}`}>Acheter</button>
                    {data.owner && (
                        <a href={`/messages?to=${data.ownerId}`} className="px-5 py-2 bg-white/5 border border-white/10 text-slateLight">Contacter le vendeur</a>
                    )}
                    {!canBuy && data.ownerId && Number(localStorage.getItem('userId')||'0') !== Number(data.ownerId) && (
                      <button className="px-5 py-2 bg-white/5 border border-white/10 text-slateLight" onClick={()=>setTradeOpen(true)}>Proposer un échange</button>
                    )}
                    {data.status !== 'available' && <span className="text-sm text-slateLight/80 self-center">Indisponible</span>}
                </div>
            </div>
        </div>

        {lightbox && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setLightbox(false)}>
                <img src={images[activeIdx]} alt="zoom" className="max-h-[90vh] max-w-[90vw] object-contain" />
            </div>
        )}

        {/* Trade offer modal */}
        {tradeOpen && (
          <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
            <div className="rinato-card w-full max-w-xl max-h-[85vh] overflow-y-auto mb-20 md:mb-0">
              <div className="p-4 border-b border-white/10 sticky top-0 bg-midnight z-10 flex items-center justify-between">
                <div className="rinato-h3">Proposer un échange</div>
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
