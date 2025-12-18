import { Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useContext, useEffect, useState } from 'react'
import { ThemeContext, AuthContext } from './main'
import axios from './config/axios'
import { connectSocket, onAuctionEnded, offAuctionEnded, onMessage, offMessage, onTradeOffer, offTradeOffer } from './lib/socket'
import toast from 'react-hot-toast'
import Home from './pages/Home'
import Search from './pages/Search'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductDetails from './pages/ProductDetails'
import AdminDashboard from './pages/admin/Dashboard'
import CreateProduct from './pages/admin/CreateProduct'
import AdminUsers from './pages/admin/Users'
import AdminStats from './pages/admin/Stats'
import AdminProductsModeration from './pages/admin/ProductsModeration'
import AdminLogin from './pages/admin/Login'
import Profile from './pages/Profile'
import Wallet from './pages/Wallet'
import Auctions from './pages/Auctions'
import AuctionDetail from './pages/AuctionDetail'
import MyProducts from './pages/MyProducts'
import Messages from './pages/Messages'
import Defis from './pages/Defis'
import AdminDefis from './pages/admin/Defis'

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token')
  const location = useLocation()
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />
  return children
}

function RequireAdmin({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')
  if (!token || role !== 'admin') return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  const { auth } = useContext(AuthContext)
  const token = auth.token
  const role = auth.role
  const isAdmin = !!token && role === 'admin'
  const { theme, setTheme } = useContext(ThemeContext)
  const navigate = useNavigate()
  useEffect(() => {
    const userId = localStorage.getItem('userId')
    connectSocket(userId || undefined)
    const ended = (p: any) => toast.success(`Auction #${p.auctionId} ended${p.winnerId ? `, winner ${p.winnerId}` : ''}`)
    const msg = (p: any) => toast(`New message received`, { icon: '💬' })
    const trade = (p: any) => toast(`New trade offer`, { icon: '🔔' })
    onAuctionEnded(ended); onMessage(msg); onTradeOffer(trade)
    return () => { offAuctionEnded(ended); offMessage(msg); offTradeOffer(trade) }
  }, [])
  const [q, setQ] = useState('')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [openSuggest, setOpenSuggest] = useState(false)

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) { setSuggestions([]); return }
      try {
        const res = await axios.get('/products/search', { params: { q, page: 1, limit: 5 } })
        setSuggestions(res.data?.data?.items || [])
      } catch { setSuggestions([]) }
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  return (
    <div className="min-h-screen rinato-blueprint rinato-noise">
      <Toaster position="top-right" toastOptions={{ className: 'text-sm' }} />
      <nav className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-white/10 bg-midnight/80 sticky top-0 z-10 backdrop-blur-md shadow-glass">
        <Link className="font-display tracking-[0.15em] text-slateLight" to="/">RINATO</Link>
        <div className="flex-1" />
        <div className="relative hidden md:block">
          <input value={q} onChange={e => { setQ(e.target.value); setOpenSuggest(true) }} onKeyDown={(e)=>{ if(e.key==='Enter'){ navigate(`/search?q=${encodeURIComponent(q)}`); setOpenSuggest(false) } }} onBlur={() => setTimeout(()=>setOpenSuggest(false),150)} onFocus={() => setOpenSuggest(true)} placeholder="Rechercher" className="w-72 px-3 py-2 rounded border border-white/10 bg-white/5 text-slateLight placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-rinato-copper" />
          {openSuggest && suggestions.length > 0 && (
            <div className="absolute mt-1 w-full rounded-lg bg-midnight/95 border border-white/10 shadow-lg overflow-hidden">
              {suggestions.map((s) => (
                <Link key={s.id} to={`/products/${s.id}`} className="block px-3 py-2 text-slateLight hover:bg-white/5" onMouseDown={(e)=>e.preventDefault()}>
                  {s.title}
                </Link>
              ))}
            </div>
          )}
        </div>
        <Link className="text-slateLight hover:text-rinato-copper" to="/">Accueil</Link>
        <Link className="text-slateLight hover:text-rinato-copper" to="/auctions">Enchères</Link>
        <Link className="text-slateLight hover:text-rinato-copper" to="/defis">Défis</Link>
        {token && <Link className="text-slateLight hover:text-rinato-copper" to="/profile">Profil</Link>}
        {token && <Link className="text-slateLight hover:text-rinato-copper" to="/wallet">Portefeuille</Link>}
        {token && <Link className="text-slateLight hover:text-rinato-copper" to="/my-products">Mes pièces</Link>}
        {token && <Link className="text-slateLight hover:text-rinato-copper" to="/messages">Messages</Link>}
        {!token && <Link className="text-slateLight hover:text-rinato-copper" to="/login">Login</Link>}
        {!token && <Link className="text-slateLight hover:text-rinato-copper" to="/register">Register</Link>}
        {isAdmin && <Link className="text-slateLight hover:text-rinato-copper" to="/admin">Admin</Link>}
        <button className="rinato-cta px-3 py-2" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
        {token && <button className="rinato-cta px-3 py-2" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('userId'); localStorage.removeItem('username'); window.location.href = '/' }}>Logout</button>}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/search" element={<Search />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/auctions/:id" element={<AuctionDetail />} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/wallet" element={<RequireAuth><Wallet /></RequireAuth>} />
        <Route path="/my-products" element={<RequireAuth><MyProducts /></RequireAuth>} />
        <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
        <Route path="/defis" element={<Defis />} />
        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/create" element={<RequireAdmin><CreateProduct /></RequireAdmin>} />
        <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
        <Route path="/admin/stats" element={<RequireAdmin><AdminStats /></RequireAdmin>} />
        <Route path="/admin/products/moderation" element={<RequireAdmin><AdminProductsModeration /></RequireAdmin>} />
        <Route path="/admin/defis" element={<RequireAdmin><AdminDefis /></RequireAdmin>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
