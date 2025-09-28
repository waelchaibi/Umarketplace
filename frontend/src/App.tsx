import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { useContext } from 'react'
import { ThemeContext, AuthContext } from './main'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductDetails from './pages/ProductDetails'
import AdminDashboard from './pages/admin/Dashboard'
import CreateProduct from './pages/admin/CreateProduct'
import AdminUsers from './pages/admin/Users'
import AdminStats from './pages/admin/Stats'
import AdminProductsModeration from './pages/admin/ProductsModeration'
import Profile from './pages/Profile'
import Wallet from './pages/Wallet'
import Auctions from './pages/Auctions'
import AuctionDetail from './pages/AuctionDetail'
import MyProducts from './pages/MyProducts'
import Messages from './pages/Messages'

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-night-900 text-gray-900 dark:text-white">
      <nav className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/70 dark:bg-night-800/60 sticky top-0 z-10 backdrop-blur-md shadow-glass">
        <Link className="font-semibold" to="/">Unique Market</Link>
        <div className="flex-1" />
        <Link className="hover:text-blue-600" to="/">Home</Link>
        <Link className="hover:text-blue-600" to="/auctions">Auctions</Link>
        {token && <Link className="hover:text-blue-600" to="/profile">Profile</Link>}
        {token && <Link className="hover:text-blue-600" to="/wallet">Wallet</Link>}
        {token && <Link className="hover:text-blue-600" to="/my-products">My Products</Link>}
        {token && <Link className="hover:text-blue-600" to="/messages">Messages</Link>}
        {!token && <Link className="hover:text-blue-600" to="/login">Login</Link>}
        {!token && <Link className="hover:text-blue-600" to="/register">Register</Link>}
        {isAdmin && <Link className="hover:text-blue-600" to="/admin">Admin</Link>}
        <button className="px-3 py-1 rounded bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
        {token && <button className="px-3 py-1 rounded bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('role'); localStorage.removeItem('userId'); localStorage.removeItem('username'); window.location.href = '/' }}>Logout</button>}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/auctions" element={<Auctions />} />
        <Route path="/auctions/:id" element={<AuctionDetail />} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/wallet" element={<RequireAuth><Wallet /></RequireAuth>} />
        <Route path="/my-products" element={<RequireAuth><MyProducts /></RequireAuth>} />
        <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin/create" element={<RequireAdmin><CreateProduct /></RequireAdmin>} />
        <Route path="/admin/users" element={<RequireAdmin><AdminUsers /></RequireAdmin>} />
        <Route path="/admin/stats" element={<RequireAdmin><AdminStats /></RequireAdmin>} />
        <Route path="/admin/products/moderation" element={<RequireAdmin><AdminProductsModeration /></RequireAdmin>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
