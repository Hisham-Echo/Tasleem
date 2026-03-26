import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)
  const open = ref(false)

  const totalItems = computed(() => items.value.reduce((sum, i) => sum + (i.quantity || 1), 0))
  const totalPrice = computed(() => items.value.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 1)), 0))
  const isEmpty = computed(() => items.value.length === 0)

  async function fetchCart() {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) { items.value = []; return }
    try {
      const res = await cartService.get()
      items.value = res.data?.items || res.data?.data || []
    } catch (_) {
      items.value = []
    }
  }

  async function addItem(productId, quantity = 1) {
    loading.value = true
    try {
      await cartService.addItem({ product_id: productId, quantity })
      await fetchCart()
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add item' }
    } finally {
      loading.value = false
    }
  }

  async function addRental(productId, startDate, endDate) {
    loading.value = true
    try {
      await cartService.addRental({ product_id: productId, start_date: startDate, end_date: endDate })
      await fetchCart()
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to add rental' }
    } finally {
      loading.value = false
    }
  }

  async function updateItem(id, quantity) {
    try {
      await cartService.updateItem(id, { quantity })
      await fetchCart()
    } catch (_) {}
  }

  async function removeItem(id) {
    try {
      await cartService.removeItem(id)
      items.value = items.value.filter(i => i.id !== id)
    } catch (_) {}
  }

  async function clearCart() {
    try {
      await cartService.clear()
      items.value = []
    } catch (_) {}
  }

  function openCart() { open.value = true }
  function closeCart() { open.value = false }

  return {
    items, loading, open,
    totalItems, totalPrice, isEmpty,
    fetchCart, addItem, addRental, updateItem, removeItem, clearCart,
    openCart, closeCart
  }
})
