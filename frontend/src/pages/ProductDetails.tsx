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

	if (isLoading) return <div className="p-6">Loading...</div>
	if (isError) return <div className="p-6">Error loading product.</div>
	if (!data) return <div className="p-6">Not found</div>

return (
    <div className="p-6 max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl p-4 bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card">
                <div className="aspect-[4/3] overflow-hidden rounded-lg mb-3 cursor-zoom-in" onClick={() => setLightbox(true)}>
                    {images[activeIdx] ? (
                        <img src={images[activeIdx]} alt={data.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gray-100 dark:bg-white/10" />
                    )}
                </div>
                {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                        {images.map((src, i) => (
                            <button key={i} onClick={() => setActiveIdx(i)} className={`h-16 w-20 rounded overflow-hidden border ${i === activeIdx ? 'border-blue-600' : 'border-black/10 dark:border-white/10'}`}>
                                <img src={src} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="rounded-2xl p-6 bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card">
                <h1 className="text-3xl font-display font-semibold mb-2">{data.title}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{data.category} • {data.condition}</p>
                <p className="mb-6 whitespace-pre-wrap">{data.description}</p>
                <p className="text-2xl font-bold mb-4">{data.currentPrice ?? data.originalPrice ?? '-'}</p>
                <div className="flex gap-2">
                    <button disabled={!canBuy} onClick={buyNow} className={`px-5 py-2 rounded ${canBuy ? 'bg-gradient-to-r from-accent-purple to-accent-blue text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500 cursor-not-allowed'}`}>Buy Now</button>
                    {data.owner && (
                        <a href={`/messages?to=${data.ownerId}`} className="px-5 py-2 rounded bg-gray-100 dark:bg-white/10">Message seller</a>
                    )}
                    {data.status !== 'available' && <span className="text-sm text-gray-600 dark:text-gray-300 self-center">Not available</span>}
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
