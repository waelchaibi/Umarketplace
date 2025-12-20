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
			<div className="rinato-card p-6">
				<h1 className="rinato-h2 mb-2">{auction.product?.title || `Auction #${auction.id}`}</h1>
				<p className="text-sm text-slateLight/80 mb-4">Ends: {new Date(auction.endTime).toLocaleString()}</p>
				<p className="text-2xl font-sans font-bold mb-4">Current bid: € {auction.currentBid ?? auction.startingPrice}</p>
				<div className="flex gap-2">
					<input className="flex-1 px-3 py-2 border border-white/10 bg-white/5 text-slateLight placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-rinato-copper" type="number" value={amount as any} onChange={e => setAmount(Number(e.target.value))} />
					<button className="rinato-cta" onClick={place}>Place bid</button>
				</div>
        {/* Bid history */}
        <div className="mt-6">
          <div className="rinato-h3 mb-2">Historique des enchères</div>
          <div className="border border-white/10">
            <div className="grid grid-cols-3 text-sm bg-white/5">
              <div className="px-3 py-2">Utilisateur</div>
              <div className="px-3 py-2">Montant</div>
              <div className="px-3 py-2">Date</div>
            </div>
            <div className="max-h-64 overflow-auto">
              {(auction.bids || []).slice().sort((a:any,b:any)=> (new Date(b.createdAt)).getTime() - (new Date(a.createdAt)).getTime()).map((b:any)=>(
                <div key={b.id} className="grid grid-cols-3 text-sm border-t border-white/10">
                  <div className="px-3 py-2">{b.bidder?.username || b.bidderId}</div>
                  <div className="px-3 py-2">€ {b.amount}</div>
                  <div className="px-3 py-2">{new Date(b.createdAt).toLocaleString()}</div>
                </div>
              ))}
              {(!auction.bids || auction.bids.length===0) && (
                <div className="px-3 py-3 text-sm text-slateLight/70">Aucune enchère pour le moment.</div>
              )}
            </div>
          </div>
        </div>
			</div>
		</div>
	)
}
