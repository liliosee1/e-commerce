import React from 'react'
import { Link } from 'react-router-dom'
import { useOrders } from '../hooks/useOrders'

export default function Orders() {
  const { data: orders = [], isLoading, isError } = useOrders()

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Your orders</h2>
          <p className="text-sm text-slate-600">Your recent purchases and delivery status.</p>
        </div>
        <Link to="/" className="text-sm font-semibold text-slate-600">Back to shop</Link>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">Loading orders...</div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">We could not load your orders right now.</div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600">No orders yet. When you place one, it will appear here.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Order #{order.id}</p>
                  <p className="text-sm text-slate-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Placed recently'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">${Number(order.total || 0).toFixed(2)}</p>
                  <p className="text-sm capitalize text-slate-600">{order.status || 'confirmed'}</p>
                </div>
              </div>

              {Array.isArray(order.items) && order.items.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {order.items.map((item) => (
                    <div key={item.productId || item.id || item.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-slate-900">{item.name || item.productId}</p>
                        <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                      </div>
                      {item.price != null ? (
                        <p className="mt-2 text-right text-slate-900 sm:mt-0">${Number(item.price).toFixed(2)}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 text-sm text-slate-600">Items confirmed</div>
              )}

              {(order.customerName || order.address) ? (
                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                  {order.customerName ? <p><span className="font-medium text-slate-900">Name:</span> {order.customerName}</p> : null}
                  {order.address ? <p className="mt-1"><span className="font-medium text-slate-900">Address:</span> {order.address}</p> : null}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
