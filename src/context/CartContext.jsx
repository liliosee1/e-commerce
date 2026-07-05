import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/client'

const CartContext = createContext(null)
const CART_STORAGE_KEY = 'ecomus-cart'

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeCart(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

function normalizeCartItem(item, fallbackProduct = null) {
  const productId = item.productId || item.product?._id || item.product?.id || item.id || item._id || null
  const serverItemId = item._id || item.id || item.itemId || item.cartItemId || null
  const quantity = Number(item.quantity || item.qty || 1)
  const price = Number(item.price ?? item.product?.price ?? fallbackProduct?.price ?? 0)
  const name = item.name || item.product?.name || fallbackProduct?.name || 'Product'
  const image = item.image || item.product?.image || fallbackProduct?.image || null

  return {
    id: productId || fallbackProduct?.id || serverItemId || `local-${Date.now()}`,
    serverItemId,
    name,
    price,
    quantity,
    image
  }
}

function normalizeServerCart(payload) {
  const basket = payload?.items || payload?.data?.items || payload?.cart?.items || payload?.products || []
  if (!Array.isArray(basket)) return []
  return basket.map((item) => normalizeCartItem(item))
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)
  const [toast, setToast] = useState('')

  useEffect(() => {
    writeCart(items)
  }, [items])

  useEffect(() => {
    const token = localStorage.getItem('ecomus-commerce-token')
    if (!token) return

    api.get('/auth/cart')
      .then((response) => {
        const serverItems = normalizeServerCart(response?.data)
        if (serverItems.length > 0) {
          setItems(serverItems)
        }
      })
      .catch(() => undefined)
  }, [])

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 1800)
  }

  const syncCartFromServer = async () => {
    const token = localStorage.getItem('ecomus-commerce-token')
    if (!token) return null

    try {
      const response = await api.get('/auth/cart')
      const serverItems = normalizeServerCart(response?.data)
      if (serverItems.length > 0) {
        setItems(serverItems)
      }
      return serverItems
    } catch {
      return null
    }
  }

  const addToCart = async (product, quantity = 1) => {
    const token = localStorage.getItem('ecomus-commerce-token')
    if (token) {
      try {
        await api.post('/auth/cart/items', {
          productId: product.id || product._id,
          variantId: product.variantId || product.variants?.[0]?._id || product.variants?.[0]?.id,
          quantity
        })
        await syncCartFromServer()
        showToast(`${product.name} added to cart`)
        return
      } catch {
        // Fall back to local cart if the remote API rejects the request.
      }
    }

    setItems((current) => {
      const existing = current.find((item) => item.id === (product.id || product._id))
      if (existing) {
        return current.map((item) => item.id === (product.id || product._id) ? { ...item, quantity: item.quantity + quantity } : item)
      }
      return [...current, { ...product, id: product.id || product._id, quantity }]
    })
    showToast(`${product.name} added to cart`)
  }

  const updateQuantity = async (productId, quantity) => {
    const item = items.find((entry) => entry.id === productId)
    const token = localStorage.getItem('ecomus-commerce-token')

    if (token && item?.serverItemId) {
      try {
        if (quantity <= 0) {
          await api.delete(`/auth/cart/items/${item.serverItemId}`)
        } else {
          await api.patch(`/auth/cart/items/${item.serverItemId}`, { quantity })
        }
        await syncCartFromServer()
      } catch {
        // Fall back to local cart state.
      }
    }

    setItems((current) => {
      if (quantity <= 0) {
        const removed = current.find((entry) => entry.id === productId)
        if (removed) showToast(`${removed.name} removed from cart`)
        return current.filter((entry) => entry.id !== productId)
      }
      return current.map((entry) => entry.id === productId ? { ...entry, quantity } : entry)
    })
  }

  const removeFromCart = async (productId) => {
    const item = items.find((entry) => entry.id === productId)
    const token = localStorage.getItem('ecomus-commerce-token')

    if (token && item?.serverItemId) {
      try {
        await api.delete(`/auth/cart/items/${item.serverItemId}`)
        await syncCartFromServer()
      } catch {
        // Fall back to local cart state.
      }
    }

    setItems((current) => {
      const removed = current.find((entry) => entry.id === productId)
      if (removed) showToast(`${removed.name} removed from cart`)
      return current.filter((entry) => entry.id !== productId)
    })
  }

  const clearCart = async () => {
    const token = localStorage.getItem('ecomus-commerce-token')
    if (token) {
      try {
        await api.delete('/auth/cart')
      } catch {
        // Fall back to local cart state.
      }
    }
    setItems([])
  }

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items])
  const cartCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, subtotal, cartCount, toast }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }
  return context
}
