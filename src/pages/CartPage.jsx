import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, updateQuantity, removeFromCart, subtotal } = useCart()
  const handleProceedToCheckout = () => navigate('/checkout')

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Your cart</h2>
            <p className="text-sm text-slate-600">Keep track of the items you plan to buy.</p>
          </div>
          <Link to="/" className="text-sm font-semibold text-slate-600">Continue shopping</Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600">Your cart is empty. Pick a product to get started.</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{item.name}</h3>
                  <p className="text-sm text-slate-600">${Number(item.price).toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-full border border-slate-300 px-2 py-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-7 w-7 rounded-full text-lg">−</button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-7 w-7 rounded-full text-lg">+</button>
                  </div>
                  <div className="min-w-[70px] text-right font-semibold text-slate-900">${(item.price * item.quantity).toFixed(2)}</div>
                  <button onClick={() => removeFromCart(item.id)} className="text-sm font-semibold text-red-600">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold text-slate-900">Order summary</h3>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="flex items-center justify-between"><span>Subtotal</span><span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span></div>
          <div className="flex items-center justify-between"><span>Shipping</span><span className="font-semibold text-slate-900">Free</span></div>
        </div>
        <div className="mt-6 rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center justify-between text-base font-semibold text-slate-900"><span>Total</span><span>${subtotal.toFixed(2)}</span></div>
        </div>
        <button onClick={handleProceedToCheckout} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
          Proceed to checkout
        </button>
      </div>
    </div>
  )
}
