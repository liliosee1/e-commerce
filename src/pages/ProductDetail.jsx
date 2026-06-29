import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { useProduct } from '../hooks/useProducts'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { data, isLoading, isError } = useProduct(id)
  const [feedback, setFeedback] = React.useState('')

  if (isLoading) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">Loading product...</div>
  if (isError || !data) return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">We could not load this product right now.</div>

  const imageUrl = data.image || data.images?.[0] || data.variants?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <Link to="/" className="mb-4 inline-flex text-sm font-semibold text-slate-600">← Back to catalog</Link>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-2xl bg-slate-100">
          <img src={imageUrl} alt={data.name} className="h-full w-full object-cover" />
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">{data.category?.name || 'Featured product'}</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">{data.name}</h1>
          </div>
          <p className="text-xl font-semibold text-slate-900">${Number(data.price).toFixed(2)}</p>
          <p className="text-slate-600">{data.description}</p>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="flex items-center justify-between"><span>Brand</span><span className="font-medium text-slate-900">{data.brand || 'Unknown'}</span></div>
            <div className="mt-2 flex items-center justify-between"><span>Stock</span><span className="font-medium text-slate-900">{data.stock}</span></div>
          </div>
          <button onClick={() => { addToCart(data, 1); setFeedback(`${data.name} added to cart`); window.setTimeout(() => setFeedback(''), 1800) }} className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700">
            Add to cart
          </button>
          {feedback ? <p className="text-sm font-medium text-emerald-700">{feedback}</p> : null}
        </div>
      </div>
    </div>
  )
}
