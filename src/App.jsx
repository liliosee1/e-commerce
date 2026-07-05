import React from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import CartPage from './pages/CartPage'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import AuthPage from './pages/AuthPage'
import { useCart } from './context/CartContext'
import { useAuth } from './context/AuthContext'

export default function App() {
  const { cartCount, toast } = useCart()
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="text-xl font-semibold tracking-tight">E-Comus</Link>
          <nav className="flex items-center gap-2 text-sm font-medium">
            <button onClick={() => navigate(-1)} className="rounded-full px-3 py-2 transition hover:bg-white/10">Back</button>
            <Link to="/orders" className="rounded-full px-3 py-2 transition hover:bg-white/10">Orders</Link>
            <Link to="/cart" className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-slate-800 transition hover:bg-slate-100">
              Cart
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">{cartCount}</span>
            </Link>
            {isAuthenticated ? (
              <button onClick={() => { logout(); navigate('/login') }} className="rounded-full px-3 py-2 transition hover:bg-white/10">Logout</button>
            ) : (
              <Link to="/login" className="rounded-full px-3 py-2 transition hover:bg-white/10">Login</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {toast ? (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl">
            {toast}
          </div>
        ) : null}
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} />
          <Route path="/cart" element={isAuthenticated ? <CartPage /> : <Navigate to="/login" replace />} />
          <Route path="/checkout" element={isAuthenticated ? <Checkout /> : <Navigate to="/login" replace />} />
          <Route path="/orders" element={isAuthenticated ? <Orders /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  )
}
