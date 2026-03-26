<template>
  <div class="card product-card card-hover h-100" @click="goToProduct">
    <!-- Badges -->
    <span v-if="product.is_rentable" class="product-badge">Rentable</span>

    <!-- Wishlist -->
    <button
      class="wishlist-btn"
      :class="{ active: wishlist.isInWishlist(product.id) }"
      @click.stop="toggleWishlist"
    >
      <i :class="wishlist.isInWishlist(product.id) ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
    </button>

    <!-- Image -->
    <div class="product-img-wrap">
      <img
        v-if="productImage"
        :src="productImage"
        :alt="product.name"
        loading="lazy"
        @error="e => e.target.style.display='none'"
      />
      <i v-else class="bi bi-image no-img"></i>
    </div>

    <div class="card-body d-flex flex-column gap-2 p-3">
      <!-- Category -->
      <span class="badge badge-gold" style="width:fit-content; font-size:.7rem;" v-if="product.category">
        {{ product.category?.name || product.category }}
      </span>

      <!-- Name -->
      <h6 class="card-title text-cream mb-0 text-truncate" style="font-size:.95rem;">{{ product.name }}</h6>

      <!-- Rating -->
      <div class="d-flex align-items-center gap-1 star-rating" v-if="product.rating">
        <template v-for="n in 5" :key="n">
          <i :class="n <= Math.round(product.rating) ? 'bi bi-star-fill filled' : 'bi bi-star empty'"></i>
        </template>
        <span class="text-muted ms-1" style="font-size:.78rem;">({{ product.reviews_count || 0 }})</span>
      </div>

      <!-- Price -->
      <div class="mt-auto d-flex align-items-center justify-content-between">
        <div>
          <span class="product-price">{{ formatPrice(product.price) }}</span>
          <span class="product-old-price ms-2" v-if="product.old_price">{{ formatPrice(product.old_price) }}</span>
        </div>
        <button class="btn btn-gold btn-sm px-3" @click.stop="addToCart" :disabled="cartLoading">
          <i class="bi bi-bag-plus" v-if="!cartLoading"></i>
          <span class="spinner-border spinner-border-sm" v-else></span>
        </button>
      </div>

      <!-- Rental price -->
      <div v-if="product.is_rentable && product.daily_rental_price" class="text-muted" style="font-size:.78rem;">
        <i class="bi bi-clock me-1"></i>{{ formatPrice(product.daily_rental_price) }}/day
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'

const props = defineProps({ product: { type: Object, required: true } })
const router = useRouter()
const cart = useCartStore()
const wishlist = useWishlistStore()
const auth = useAuthStore()
const toast = useToast()
const cartLoading = ref(false)

const productImage = computed(() => {
  return props.product.image || props.product.images?.[0]?.url || props.product.images?.[0]
})

function formatPrice(val) {
  return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(val || 0)
}

function goToProduct() {
  router.push({ name: 'ProductDetail', params: { id: props.product.id } })
}

async function addToCart() {
  if (!auth.isAuthenticated) {
    toast.info('Please sign in to add items to cart')
    router.push({ name: 'Login' })
    return
  }
  cartLoading.value = true
  const res = await cart.addItem(props.product.id)
  if (res.success) {
    toast.success('Added to cart!')
    cart.openCart()
  } else {
    toast.error(res.message)
  }
  cartLoading.value = false
}

async function toggleWishlist() {
  const res = await wishlist.toggle(props.product.id)
  if (res?.needsAuth) {
    toast.info('Please sign in to save items')
    router.push({ name: 'Login' })
    return
  }
  if (res?.added) toast.success('Added to wishlist')
  else if (res?.added === false) toast.info('Removed from wishlist')
  else if (res?.error) toast.error(res.error)
}
</script>
