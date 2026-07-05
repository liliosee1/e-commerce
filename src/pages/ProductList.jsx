import React, { useMemo, useState } from 'react'
import { useProducts, useCategories } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'

export default function ProductList() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('')
  const [feedback, setFeedback] = useState('')
  const { addToCart } = useCart()

  const params = useMemo(() => ({ page, limit: 8, search, categoryId: category || undefined }), [page, search, category])
  const { data, isLoading, isError, isFetching } = useProducts(params)
  const { data: categories = [] } = useCategories()

  const products = useMemo(() => data?.data?.all || data?.data || [], [data])
  const pagination = data?.pagination || {}

  const handleAdd = (product) => {
    addToCart(product, 1)
    setFeedback(`${product.name} added to cart`)
    window.setTimeout(() => setFeedback(''), 1800)
  }

  return (
    <div className="space-y-6">
      {feedback ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">{feedback}</div> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Browse products</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">Pick something fresh for your next order</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search products" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500 sm:min-w-[240px]" />
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500">
              <option value="">All categories</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">Loading products...</div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">We could not load the products. Please try again.</div>
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">No products matched your search.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} onAdd={handleAdd} />)}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">Page {pagination.page || page} of {pagination.pages || 1}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((old) => Math.max(1, old - 1))} disabled={page === 1} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
              <button onClick={() => setPage((old) => old + 1)} disabled={page >= (pagination.pages || 1)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50">Next</button>
            </div>
            {isFetching && <span className="text-sm text-slate-500">Refreshing...</span>}
          </div>
        </>
      )}
    </div>
  )
}
