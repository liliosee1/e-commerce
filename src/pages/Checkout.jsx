import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { usePlaceOrder } from '../hooks/useOrders'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal } = useCart()
  const { mutate, isPending, isError, error } = usePlaceOrder()
  const [customerName, setCustomerName] = useState('')
  const [address, setAddress] = useState('')

  const handlePlaceOrder = () => {
    if (!customerName.trim() || !address.trim()) {
      return
    }

    mutate({ items, total: subtotal, customerName, address }, {
      onSuccess: () => {
        navigate('/orders')
      },
      onError: () => {
        navigate('/orders')
      }
    })
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Your cart is empty</h2>
        <p className="mt-2 text-slate-600">Add some products before you check out.</p>
        <Link to="/" className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Browse products</Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-2xl font-semibold text-slate-900">Checkout</h2>
        <p className="mt-2 text-sm text-slate-600">Review your order and provide delivery details.</p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500" placeholder="Ada Lovelace" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
            <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="min-h-[120px] w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-500" placeholder="123 Main Street, Nairobi" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold text-slate-900">Your order</h3>
        <div className="mt-4 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm text-slate-600">
              <span>{item.name} × {item.quantity}</span>
              <span className="font-semibold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        {isError ? <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">{error?.message || 'Checkout could not be completed, but your order is still saved locally for review.'}</div> : null}
        <div className="mt-6 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center justify-between text-base font-semibold text-slate-900"><span>Total</span><span>${subtotal.toFixed(2)}</span></div>
        </div>
        <button onClick={handlePlaceOrder} disabled={isPending} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? 'Placing order...' : 'Place order'}
        </button>
      </div>
    </div>
  )
}
