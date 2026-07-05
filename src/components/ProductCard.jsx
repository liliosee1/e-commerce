import React from 'react'
import { Link } from 'react-router-dom'

export default function ProductCard({ product, onAdd }) {
  const getFallbackImage = () => {
    const cat = (product?.category?.name || product?.category || '').toString().toLowerCase()
    const map = {
      electronics: 'electronics,gadgets,technology',
      phones: 'smartphone,phone,technology',
      computers: 'computer,laptop,technology',
      clothing: 'clothing,fashion,apparel',
      shoes: 'shoes,footwear,fashion',
      furniture: 'furniture,home,interior',
      general: 'product,store'
    }
    const keywords = map[cat] || cat || product?.name || 'product'
    return `https://source.unsplash.com/600x400/?${encodeURIComponent(keywords)}`
  }

  const imageUrl = product.image || product.images?.[0] || product.variants?.[0]?.images?.[0] || getFallbackImage()

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <Link to={`/products/${product.id}`} className="block">
        <div className="flex h-48 items-center justify-center bg-slate-100">
          <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{product.category?.name || 'General'}</span>
          </div>
          <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-semibold text-slate-900">${Number(product.price).toFixed(2)}</p>
            <span className="text-sm text-slate-500">Stock {product.stock}</span>
          </div>
        </div>
      </Link>
      <div className="border-t border-slate-100 p-4">
        <button onClick={() => onAdd(product)} className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
          Add to cart
        </button>
      </div>
    </article>
  )
}
