import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { wishlistService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

export const useWishlistStore = defineStore('wishlist', () => {
  const items = ref([])
  const loading = ref(false)

  const ids = computed(() => items.value.map(i => i.product_id || i.id))
  const count = computed(() => items.value.length)

  function isInWishlist(productId) {
    return ids.value.includes(productId)
  }

  async function fetchWishlist() {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) { items.value = []; return }
    try {
      const res = await wishlistService.getAll()
      items.value = res.data?.data || res.data || []
    } catch (_) {
      items.value = []
    }
  }

  async function toggle(productId) {
    const auth = useAuthStore()
    if (!auth.isAuthenticated) return { needsAuth: true }
    loading.value = true
    try {
      if (isInWishlist(productId)) {
        await wishlistService.remove(productId)
        items.value = items.value.filter(i => (i.product_id || i.id) !== productId)
        return { added: false }
      } else {
        await wishlistService.add({ product_id: productId })
        await fetchWishlist()
        return { added: true }
      }
    } catch (err) {
      return { error: err.response?.data?.message }
    } finally {
      loading.value = false
    }
  }

  async function remove(productId) {
    try {
      await wishlistService.remove(productId)
      items.value = items.value.filter(i => (i.product_id || i.id) !== productId)
    } catch (_) {}
  }

  return { items, loading, ids, count, isInWishlist, fetchWishlist, toggle, remove }
})
