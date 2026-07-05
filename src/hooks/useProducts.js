import { useQuery } from '@tanstack/react-query'
import api from '../api/client'

const fetchProducts = async ({ queryKey }) => {
  const [_key, params] = queryKey
  const res = await api.get('/public/products', { params: { page: params?.page || 1, limit: 8, ...params } })
  return res.data
}

export function useProducts(params = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: fetchProducts,
    keepPreviousData: true,
    staleTime: 1000 * 60
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories')
      const payload = res?.data?.data || res?.data || []
      if (Array.isArray(payload)) return payload
      return payload?.categories || payload?.items || []
    },
    staleTime: 1000 * 60 * 10
  })
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/public/products/${id}`)
      return res?.data?.data?.product || res?.data?.data || res?.data || null
    },
    enabled: !!id,
    staleTime: 1000 * 60
  })
}
