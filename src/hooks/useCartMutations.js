import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCart } from '../context/CartContext'

export function useCartMutations() {
  const queryClient = useQueryClient()
  const { addToCart, updateQuantity, removeFromCart } = useCart()

  const addItem = useMutation({
    mutationFn: async ({ product, quantity = 1 }) => {
      addToCart(product, quantity)
      return { productId: product.id, quantity }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })

  const updateItem = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      updateQuantity(productId, quantity)
      return { productId, quantity }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })

  const removeItem = useMutation({
    mutationFn: async (productId) => {
      removeFromCart(productId)
      return productId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })

  return { addItem, updateItem, removeItem }
}
