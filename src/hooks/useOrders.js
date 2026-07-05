import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import { useCart } from '../context/CartContext'

const ORDER_STORAGE_KEY = 'ecomus-orders'

function readLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocalOrders(orders) {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders))
}

function normalizeOrder(order, fallback = {}) {
  return {
    id: order.id || order._id || fallback.id || `order-${Date.now()}`,
    total: order.total ?? order.amount ?? fallback.total ?? 0,
    items: Array.isArray(order.items) ? order.items : fallback.items || [],
    customerName: order.customerName || order.customer?.name || fallback.customerName || '',
    address: order.address || order.deliveryAddress || fallback.address || '',
    status: order.status || 'confirmed',
    createdAt: order.createdAt || order.created_at || new Date().toISOString()
  }
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const token = localStorage.getItem('ecomus-commerce-token')
      if (!token) return readLocalOrders()

      try {
        const res = await api.get('/auth/orders')
        const payload = res?.data?.data || res?.data || []
        if (Array.isArray(payload)) return payload.map((order) => normalizeOrder(order))
        if (Array.isArray(payload?.orders)) return payload.orders.map((order) => normalizeOrder(order))
        return readLocalOrders()
      } catch {
        return readLocalOrders()
      }
    },
    staleTime: 1000 * 60
  })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  const { clearCart } = useCart()

  return useMutation({
    mutationFn: async ({ items, total, customerName, address }) => {
      const token = localStorage.getItem('ecomus-commerce-token')
      if (!token) {
        const fallbackOrder = {
          id: `local-${Date.now()}`,
          total,
          items,
          customerName,
          address,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
        const existing = readLocalOrders()
        writeLocalOrders([fallbackOrder, ...existing])
        return { ...fallbackOrder, syncedWithApi: false }
      }

      try {
        const response = await api.post('/auth/orders')
        const order = response?.data?.data?.order || response?.data?.data || response?.data || {}
        const savedOrder = normalizeOrder(order, { id: `order-${Date.now()}`, total, items, customerName, address })
        const existing = readLocalOrders()
        writeLocalOrders([savedOrder, ...existing])
        return { ...savedOrder, syncedWithApi: true }
      } catch (error) {
        const fallbackOrder = {
          id: `local-${Date.now()}`,
          total,
          items,
          customerName,
          address,
          status: 'pending',
          createdAt: new Date().toISOString(),
          fallbackMessage: error?.message || 'The API is unavailable, so the order was saved locally.'
        }
        const existing = readLocalOrders()
        writeLocalOrders([fallbackOrder, ...existing])
        return { ...fallbackOrder, syncedWithApi: false }
      }
    },
    onSuccess: async () => {
      await clearCart()
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}
