import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/client'

export function getLocalCart() {
  try { return JSON.parse(localStorage.getItem('cart') || '[]') } catch (e) { return [] }
}

export function setLocalCart(items) {
  localStorage.setItem('cart', JSON.stringify(items))
}

export function usePlaceOrder() {
  const qc = useQueryClient()
  return useMutation(
    (orderPayload) => api.post('/orders', orderPayload).then(r => r.data),
    {
      onSuccess: () => {
        // clear local cart on success
        localStorage.removeItem('cart')
        qc.invalidateQueries(['orders'])
      }
    }
  )
}
