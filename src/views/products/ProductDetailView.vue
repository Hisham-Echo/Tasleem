<template>
  <div>
    <LoadingSpinner v-if="loading" text="Loading product..." height="60vh" />

    <div v-else-if="product">
      <!-- Header -->
      <div class="page-header">
        <div class="container">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item"><RouterLink to="/">Home</RouterLink></li>
              <li class="breadcrumb-item"><RouterLink to="/products">Products</RouterLink></li>
              <li class="breadcrumb-item active text-truncate" style="max-width:200px;">{{ product.name }}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div class="container py-4">
        <div class="row g-5">
          <!-- Images -->
          <div class="col-lg-6">
            <div class="rounded-2xl overflow-hidden mb-3" style="background:var(--navy-light); height:420px;">
              <img :src="selectedImage" :alt="product.name" style="width:100%; height:100%; object-fit:cover;" v-if="selectedImage" />
              <div class="d-flex align-items-center justify-content-center h-100" v-else>
                <i class="bi bi-image text-muted" style="font-size:4rem;"></i>
              </div>
            </div>
            <!-- Thumbnails -->
            <div class="d-flex gap-2 flex-wrap" v-if="images.length > 1">
              <div v-for="img in images" :key="img.id || img"
                class="rounded-xl overflow-hidden cursor-pointer"
                style="width:72px; height:72px; flex-shrink:0; border:2px solid transparent; transition:.15s;"
                :style="{ borderColor: selectedImage === (img.url || img) ? 'var(--gold)' : 'transparent' }"
                @click="selectedImage = img.url || img">
                <img :src="img.url || img" style="width:100%; height:100%; object-fit:cover;" />
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="col-lg-6">
            <!-- Category & badges -->
            <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
              <span class="badge badge-gold" v-if="product.category">{{ product.category?.name }}</span>
              <span class="badge" style="background:rgba(46,204,113,.15); color:#2ecc71; border:1px solid rgba(46,204,113,.25);" v-if="product.stock > 0">In Stock ({{ product.stock }})</span>
              <span class="badge" style="background:rgba(231,76,60,.15); color:#e74c3c; border:1px solid rgba(231,76,60,.25);" v-else>Out of Stock</span>
              <span class="badge badge-gold" v-if="product.is_rentable"><i class="bi bi-clock me-1"></i>Rentable</span>
            </div>

            <h1 class="text-cream mb-3" style="font-size:1.8rem;">{{ product.name }}</h1>

            <!-- Rating -->
            <div class="d-flex align-items-center gap-3 mb-3" v-if="product.rating !== undefined">
              <StarRating :rating="product.rating" :count="product.reviews_count || reviews.length" />
            </div>

            <!-- Price -->
            <div class="mb-4">
              <span class="text-gold" style="font-size:2rem; font-weight:800;">{{ formatPrice(product.price) }}</span>
              <span class="text-muted ms-2 text-decoration-line-through" v-if="product.old_price">{{ formatPrice(product.old_price) }}</span>
              <div class="text-muted mt-1" style="font-size:.85rem;" v-if="product.is_rentable && product.daily_rental_price">
                <i class="bi bi-clock me-1"></i>{{ formatPrice(product.daily_rental_price) }} / day for rental
              </div>
            </div>

            <!-- Description -->
            <p class="text-muted mb-4" style="line-height:1.7;">{{ product.description }}</p>

            <!-- Buy: quantity + add to cart -->
            <div class="mb-3">
              <label class="form-label">Quantity</label>
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="d-flex align-items-center gap-2">
                  <button class="qty-btn" @click="quantity > 1 && quantity--">
                    <i class="bi bi-dash"></i>
                  </button>
                  <span class="text-cream px-2" style="font-size:1.1rem; min-width:30px; text-align:center;">{{ quantity }}</span>
                  <button class="qty-btn" @click="quantity++">
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-gold px-4 py-2" @click="addToCart" :disabled="cartLoading || product.stock === 0">
                  <span class="spinner-border spinner-border-sm me-2" v-if="cartLoading"></span>
                  <i class="bi bi-bag-plus me-2" v-else></i>
                  {{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
                </button>
                <button class="btn btn-outline-gold px-3 py-2" @click="toggleWishlist" :title="wishlist.isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'">
                  <i :class="wishlist.isInWishlist(product.id) ? 'bi bi-heart-fill text-danger' : 'bi bi-heart'"></i>
                </button>
                <ShareButton :title="product.name" />
              </div>
            </div>

            <!-- Rental section -->
            <div v-if="product.is_rentable" class="card p-3 mt-3" style="border-radius:1rem; border-color:rgba(201,169,110,.25)!important;">
              <h6 class="text-gold mb-3"><i class="bi bi-clock-history me-2"></i>Rent This Item</h6>
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label">Start Date</label>
                  <input type="date" class="form-control form-control-sm" v-model="rental.start_date" :min="today" />
                </div>
                <div class="col-6">
                  <label class="form-label">End Date</label>
                  <input type="date" class="form-control form-control-sm" v-model="rental.end_date" :min="rental.start_date || today" />
                </div>
              </div>
              <div class="d-flex align-items-center justify-content-between mb-3" v-if="rentalTotal">
                <span class="text-muted">Total ({{ rentalDays }} days):</span>
                <span class="text-gold fw-700">{{ formatPrice(rentalTotal) }}</span>
              </div>
              <button class="btn btn-outline-gold w-100" @click="addRental" :disabled="!rental.start_date || !rental.end_date || rentalLoading">
                <span class="spinner-border spinner-border-sm me-2" v-if="rentalLoading"></span>
                <i class="bi bi-calendar-check me-2" v-else></i>Add Rental to Cart
              </button>
            </div>
          </div>
        </div>

        <!-- Reviews section -->
        <div class="mt-5">
          <hr class="divider-gold my-4" />
          <div class="row g-4">
            <div class="col-lg-8">
              <h4 class="section-title text-cream mb-4">Customer Reviews</h4>
              <div v-if="reviewsLoading">
                <div class="skeleton mb-3" style="height:80px;" v-for="n in 3" :key="n"></div>
              </div>
              <div v-else-if="reviews.length === 0" class="text-muted py-4">
                <i class="bi bi-chat-left-dots fs-3 d-block mb-2"></i>No reviews yet. Be the first!
              </div>
              <div class="d-flex flex-column gap-3" v-else>
                <div class="card p-3" v-for="review in reviews" :key="review.id">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div style="width:36px; height:36px; border-radius:50%; background:var(--gold); display:flex; align-items:center; justify-content:center; font-weight:700; color:var(--navy); font-size:.85rem; flex-shrink:0;">
                      {{ (review.user?.name || 'U')[0].toUpperCase() }}
                    </div>
                    <div>
                      <div class="text-cream fw-600" style="font-size:.9rem;">{{ review.user?.name || 'Anonymous' }}</div>
                      <StarRating :rating="review.rating" :showCount="false" />
                    </div>
                    <div class="ms-auto text-muted" style="font-size:.78rem;">{{ formatDate(review.created_at) }}</div>
                  </div>
                  <p class="text-muted mb-0" style="font-size:.88rem;">{{ review.comment }}</p>
                </div>
              </div>

              <!-- Write a review (auth required) -->
              <div class="card p-4 mt-4" v-if="auth.isAuthenticated">
                <h6 class="text-cream mb-3">Write a Review</h6>
                <div class="mb-3">
                  <label class="form-label">Your Rating</label>
                  <div class="d-flex gap-1">
                    <button v-for="n in 5" :key="n" class="btn btn-sm p-1 border-0 bg-transparent" @click="newReview.rating = n">
                      <i :class="n <= newReview.rating ? 'bi bi-star-fill' : 'bi bi-star'" :style="{ color: n <= newReview.rating ? 'var(--gold)' : 'var(--text-muted)', fontSize: '1.2rem' }"></i>
                    </button>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Your Review</label>
                  <textarea class="form-control" rows="3" placeholder="Share your experience..." v-model="newReview.comment"></textarea>
                </div>
                <button class="btn btn-gold btn-sm" @click="submitReview" :disabled="submitReviewLoading || !newReview.rating">
                  <span class="spinner-border spinner-border-sm me-1" v-if="submitReviewLoading"></span>
                  Submit Review
                </button>
              </div>
              <div class="card p-3 mt-3 text-center" v-else>
                <span class="text-muted">Please <RouterLink class="text-gold" to="/login">sign in</RouterLink> to write a review.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="text-center py-5">
      <i class="bi bi-box-seam text-muted" style="font-size:3rem;"></i>
      <h5 class="text-muted mt-3">Product not found</h5>
      <RouterLink class="btn btn-outline-gold mt-2" to="/products">Back to Products</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productService, imageService, reviewService } from '@/services/api'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import StarRating from '@/components/ui/StarRating.vue'
import ShareButton from '@/components/ui/ShareButton.vue'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const wishlist = useWishlistStore()
const auth = useAuthStore()
const toast = useToast()

const product = ref(null)
const images = ref([])
const selectedImage = ref(null)
const reviews = ref([])
const loading = ref(true)
const cartLoading = ref(false)
const rentalLoading = ref(false)
const reviewsLoading = ref(true)
const submitReviewLoading = ref(false)
const quantity = ref(1)
const rental = ref({ start_date: '', end_date: '' })
const newReview = ref({ rating: 0, comment: '' })
const today = new Date().toISOString().split('T')[0]

const rentalDays = computed(() => {
  if (!rental.value.start_date || !rental.value.end_date) return 0
  const ms = new Date(rental.value.end_date) - new Date(rental.value.start_date)
  return Math.max(Math.ceil(ms / 86400000), 0)
})
const rentalTotal = computed(() => rentalDays.value * (product.value?.daily_rental_price || 0))

function formatPrice(val) {
  return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(val || 0)
}
function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : ''
}

async function addToCart() {
  if (!auth.isAuthenticated) { toast.info('Please sign in'); router.push({ name: 'Login' }); return }
  cartLoading.value = true
  for (let i = 0; i < quantity.value; i++) {
    await cart.addItem(product.value.id)
  }
  cartLoading.value = false
  toast.success('Added to cart!')
  cart.openCart()
}

async function addRental() {
  if (!auth.isAuthenticated) { toast.info('Please sign in'); router.push({ name: 'Login' }); return }
  if (!rental.value.start_date || !rental.value.end_date) { toast.error('Please select rental dates'); return }
  rentalLoading.value = true
  const res = await cart.addRental(product.value.id, rental.value.start_date, rental.value.end_date)
  rentalLoading.value = false
  if (res.success) { toast.success('Rental added to cart!'); cart.openCart() }
  else toast.error(res.message)
}

async function toggleWishlist() {
  const res = await wishlist.toggle(product.value.id)
  if (res?.needsAuth) { toast.info('Please sign in'); router.push({ name: 'Login' }); return }
  if (res?.added) toast.success('Added to wishlist')
  else if (res?.added === false) toast.info('Removed from wishlist')
}

async function submitReview() {
  if (!newReview.value.rating) { toast.error('Please select a rating'); return }
  submitReviewLoading.value = true
  try {
    await reviewService.create({ product_id: product.value.id, ...newReview.value })
    toast.success('Review submitted!')
    newReview.value = { rating: 0, comment: '' }
    await fetchReviews()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to submit review')
  } finally {
    submitReviewLoading.value = false
  }
}

async function fetchReviews() {
  reviewsLoading.value = true
  try {
    const res = await reviewService.getAll({ product_id: route.params.id })
    reviews.value = res.data?.data || res.data || []
  } catch (_) {
    reviews.value = []
  } finally {
    reviewsLoading.value = false
  }
}

onMounted(async () => {
  try {
    const [prodRes, imgRes] = await Promise.all([
      productService.getById(route.params.id),
      imageService.getAll(route.params.id).catch(() => ({ data: [] }))
    ])
    product.value = prodRes.data?.data || prodRes.data
    images.value = imgRes.data?.data || imgRes.data || []
    selectedImage.value = images.value[0]?.url || product.value?.image || null
    await fetchReviews()
  } catch (_) {
    product.value = null
  } finally {
    loading.value = false
  }
})
</script>
