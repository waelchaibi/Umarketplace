import { useEffect, useState } from 'react'
import axios from '../config/axios'
import { useParams } from 'react-router-dom'
import { connectSocket, joinAuction, onNewBid, offNewBid, onAuctionEnded, offAuctionEnded } from '../lib/socket'
import toast from 'react-hot-toast'

export default function AuctionDetail() {
	const { id } = useParams()
	const [auction, setAuction] = useState<any>(null)
	const [amount, setAmount] = useState<number>(0)

	const load = async () => {
		if (!id) return
		const res = await axios.get(`/auctions/${id}`)
		setAuction(res.data.data)
	}

	useEffect(() => { load() }, [id])

	useEffect(() => {
		const userId = localStorage.getItem('userId')
		connectSocket(userId || undefined)
		if (id) joinAuction(id)
		const bidHandler = (payload: any) => {
			if (String(payload.auctionId) === String(id)) load()
		}
		onNewBid(bidHandler)
		const endHandler = (payload: any) => {
			if (String(payload.auctionId) === String(id)) load()
		}
		onAuctionEnded(endHandler)
		return () => {
			offNewBid(bidHandler)
			offAuctionEnded(endHandler)
		}
	}, [id])

  const place = async () => {
    if (!id || !auction) return
    const prev = { ...auction }
    // optimistic update
    setAuction({ ...auction, currentBid: amount })
    try {
      await axios.post(`/auctions/${id}/bid`, { amount })
      toast.success('Bid placed')
      await load()
    } catch (e: any) {
      // rollback
      setAuction(prev)
      toast.error(e.response?.data?.error || 'Failed to place bid')
    }
  }

	if (!auction) return <div className="p-6">Loading...</div>

	return (
		<div className="p-6 max-w-3xl mx-auto">
			<div className="rounded-2xl p-6 bg-white dark:bg-night-800/60 border border-black/5 dark:border-white/10 shadow-card backdrop-blur-xs">
				<h1 className="text-3xl font-display font-semibold mb-2">{auction.product?.title || `Auction #${auction.id}`}</h1>
				<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Ends: {new Date(auction.endTime).toLocaleString()}</p>
				<p className="text-xl font-bold mb-4">Current bid: {auction.currentBid ?? auction.startingPrice}</p>
				<div className="flex gap-2">
					<input className="flex-1 px-3 py-2 rounded border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-accent-blue/50" type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
					<button className="px-4 py-2 rounded bg-gradient-to-r from-accent-purple to-accent-blue text-white shadow hover:opacity-90 transition" onClick={place}>Place bid</button>
				</div>
			</div>
		</div>
	)
}
