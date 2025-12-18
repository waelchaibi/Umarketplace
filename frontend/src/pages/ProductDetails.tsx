import { useQuery } from '@tanstack/react-query'
import axios from '../config/axios'
import { useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
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
                    {data.status !== 'available' && <span className="text-sm text-slateLight/80 self-center">Indisponible</span>}
                </div>
            </div>
        </div>

        {lightbox && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setLightbox(false)}>
                <img src={images[activeIdx]} alt="zoom" className="max-h-[90vh] max-w-[90vw] object-contain" />
            </div>
        )}
    </div>
)
}
