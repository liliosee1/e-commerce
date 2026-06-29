import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'
import { useCart } from '../context/CartContext'

const ORDER_STORAGE_KEY = 'ecomus-orders'
const USER_ID_STORAGE_KEY = 'ecomus-user-id'

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

export function getOrCreateUserId() {
  const existing = localStorage.getItem(USER_ID_STORAGE_KEY)
  if (existing) return existing

  const id = '111111111111111111111111'
  localStorage.setItem(USER_ID_STORAGE_KEY, id)
  return id
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      try {
        const res = await api.get('/orders', { params: { userId: getOrCreateUserId() } })
        const payload = res?.data?.data
        if (Array.isArray(payload)) return payload
        if (Array.isArray(payload?.orders)) return payload.orders
        if (Array.isArray(payload?.items)) return payload.items
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
      const userId = getOrCreateUserId()
      const payload = {
        userId,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          name: item.name,
          price: item.price,
          image: item.image
        })),
        total,
        customerName,
        address
      }

      try {
        const response = await api.post('/orders', payload)
        const order = response?.data?.data?.order || response?.data?.data || {
          id: response?.data?.data?.id || `order-${Date.now()}`,
          total,
          items,
          customerName,
          address,
          status: 'confirmed'
        }

        const savedItems = order.items?.map((item) => {
          const localItem = items.find((cartItem) => cartItem.id === item.productId || cartItem.id === item.id)
          return {
            ...localItem,
            ...item,
            id: item.id || item.productId || localItem?.id,
            productId: item.productId || item.id || localItem?.id,
            name: item.name || localItem?.name,
            price: item.price ?? localItem?.price,
            image: item.image || localItem?.image,
            quantity: item.quantity ?? localItem?.quantity ?? 1
          }
        }) ?? items

        const savedOrder = {
          ...order,
          id: order.id || `order-${Date.now()}`,
          total: order.total ?? total,
          items: savedItems,
          customerName: order.customerName ?? customerName,
          address: order.address ?? address,
          createdAt: order.createdAt || new Date().toISOString()
        }

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
    onSuccess: () => {
      clearCart()
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}
