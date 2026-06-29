import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

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

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)
  const [toast, setToast] = useState('')

  useEffect(() => {
    writeCart(items)
  }, [items])

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 1800)
  }

  const addToCart = (product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item)
      }
      return [...current, { ...product, quantity }]
    })
    showToast(`${product.name} added to cart`)
  }

  const updateQuantity = (productId, quantity) => {
    setItems((current) => {
      if (quantity <= 0) {
        const removed = current.find((item) => item.id === productId)
        if (removed) showToast(`${removed.name} removed from cart`)
        return current.filter((item) => item.id !== productId)
      }
      return current.map((item) => item.id === productId ? { ...item, quantity } : item)
    })
  }

  const removeFromCart = (productId) => {
    setItems((current) => {
      const removed = current.find((item) => item.id === productId)
      if (removed) showToast(`${removed.name} removed from cart`)
      return current.filter((item) => item.id !== productId)
    })
  }

  const clearCart = () => setItems([])

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
