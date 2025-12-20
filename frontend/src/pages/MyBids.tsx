import { useEffect, useState } from 'react'
import axios from '../config/axios'
import { Link } from 'react-router-dom'

export default function MyBids() {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'ended' | 'won' | 'lost'>('all')

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/bids/me')
        setRows(res.data?.data || [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const computeStatus = (b: any) => {
    const a = b.auction || {}
    if (a.status === 'ended') {
      return a.currentBidderId === b.bidderId && Number(a.currentBid) === Number(b.amount) ? 'won' : 'lost'
    }
    return 'active'
  }

  const filtered = rows.filter((b:any) => {
    if (filter === 'all') return true
    const st = computeStatus(b)
    if (filter === 'ended') return st === 'won' || st === 'lost'
    return st === filter
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="rinato-h2 mb-4">Mes enchères</h1>
      {/* Filters */}
      <div className="mb-3 flex flex-wrap gap-2">
        {[
          { k: 'all', label: 'Toutes' },
          { k: 'active', label: 'Actives' },
          { k: 'ended', label: 'Terminées' },
          { k: 'won', label: 'Gagnées' },
          { k: 'lost', label: 'Perdues' },
        ].map((f:any) => (
          <button
            key={f.k}
            className={`px-3 py-1 text-sm ${filter===f.k ? 'rinato-cta rinato-cta--sm' : 'bg-white/5 border border-white/10'}`}
            onClick={()=>setFilter(f.k)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="rinato-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left px-4 py-3">Produit</th>
              <th className="text-left px-4 py-3">Montant</th>
              <th className="text-left px-4 py-3">Statut</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-left px-4 py-3">Lien</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6">Chargement...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6">Aucune enchère</td></tr>
            ) : filtered.map((b:any) => {
              const a = b.auction || {}
              const p = a.product || {}
              const statusKey = computeStatus(b)
              const status = statusKey === 'active' ? 'active' : statusKey === 'won' ? 'gagnée' : 'perdue'
              return (
                <tr key={b.id} className="border-t border-white/10">
                  <td className="px-4 py-3">{p.title || `Auction #${a.id}`}</td>
                  <td className="px-4 py-3">€ {b.amount}</td>
                  <td className="px-4 py-3 capitalize">{status}</td>
                  <td className="px-4 py-3">{new Date(b.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3"><Link className="rinato-link" to={`/auctions/${a.id}`}>Voir</Link></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}


