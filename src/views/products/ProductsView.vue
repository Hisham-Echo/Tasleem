<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-2">
            <li class="breadcrumb-item"><RouterLink to="/">Home</RouterLink></li>
            <li class="breadcrumb-item active">Products</li>
          </ol>
        </nav>
        <h1 class="text-cream mb-0">All Products</h1>
      </div>
    </div>

    <div class="container py-4">
      <div class="row g-4">
        <!-- Filters sidebar -->
        <div class="col-lg-3">
          <div class="card p-3 sticky-top" style="top:80px;">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="text-cream mb-0">Filters</h6>
              <button class="btn btn-sm text-gold p-0" @click="resetFilters">Reset</button>
            </div>

            <!-- Search -->
            <div class="mb-3">
              <label class="form-label">Search</label>
              <input v-model="filters.search" type="search" class="form-control form-control-sm" placeholder="Search products..." @input="debouncedFetch" />
            </div>

            <!-- Category -->
            <div class="mb-3">
              <label class="form-label">Category</label>
              <select v-model="filters.category_id" class="form-select form-select-sm" @change="fetchProducts(1)">
                <option value="">All Categories</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>

            <!-- Rentable toggle -->
            <div class="mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" v-model="filters.rentable" id="rentable" @change="fetchProducts(1)" />
                <label class="form-check-label text-muted" for="rentable">Rentable only</label>
              </div>
            </div>

            <!-- Price range -->
            <div class="mb-3">
              <label class="form-label">Max Price: <span class="text-gold">{{ formatPrice(filters.max_price) }}</span></label>
              <input type="range" class="form-range" v-model="filters.max_price" min="0" max="50000" step="100" @change="fetchProducts(1)" />
              <div class="d-flex justify-content-between text-muted" style="font-size:.75rem;">
                <span>0</span><span>50,000 EGP</span>
              </div>
            </div>

            <!-- Sort -->
            <div>
              <label class="form-label">Sort By</label>
              <select v-model="filters.sort" class="form-select form-select-sm" @change="fetchProducts(1)">
                <option value="">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Products grid -->
        <div class="col-lg-9">
          <!-- Toolbar -->
          <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
            <div class="text-muted" style="font-size:.9rem;">
              <span v-if="!loading">{{ total }} product{{ total !== 1 ? 's' : '' }} found</span>
              <span v-else>Loading...</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-sm" :class="viewMode === 'grid' ? 'btn-gold' : 'btn-outline-gold'" @click="viewMode = 'grid'">
                <i class="bi bi-grid-3x3-gap"></i>
              </button>
              <button class="btn btn-sm" :class="viewMode === 'list' ? 'btn-gold' : 'btn-outline-gold'" @click="viewMode = 'list'">
                <i class="bi bi-list"></i>
              </button>
            </div>
          </div>

          <!-- Grid view -->
          <div class="row g-4" v-if="viewMode === 'grid'">
            <div class="col-6 col-md-4 col-xl-4" v-for="product in products" :key="product.id">
              <ProductCard :product="product" />
            </div>
            <div class="col-6 col-md-4 col-xl-4" v-if="loading" v-for="n in 9" :key="'sk'+n">
              <ProductSkeleton />
            </div>
          </div>

          <!-- List view -->
          <div class="d-flex flex-column gap-3" v-else>
            <div class="card card-hover p-0 overflow-hidden" v-for="product in products" :key="product.id" @click="$router.push({ name: 'ProductDetail', params: { id: product.id } })" style="cursor:pointer;">
              <div class="d-flex">
                <div style="width:140px; flex-shrink:0; background:var(--navy-light); height:120px; overflow:hidden;">
                  <img :src="product.image" :alt="product.name" style="width:100%; height:100%; object-fit:cover;" v-if="product.image" />
                  <div class="d-flex align-items-center justify-content-center h-100" v-else>
                    <i class="bi bi-image text-muted fs-3"></i>
                  </div>
                </div>
                <div class="p-3 flex-grow-1 d-flex align-items-center justify-content-between">
                  <div>
                    <span class="badge badge-gold mb-1" v-if="product.category">{{ product.category?.name }}</span>
                    <h6 class="text-cream mb-1">{{ product.name }}</h6>
                    <p class="text-muted mb-0" style="font-size:.82rem; line-clamp:2;">{{ product.description?.slice(0, 80) }}...</p>
                  </div>
                  <div class="text-end ms-3 flex-shrink-0">
                    <div class="product-price mb-2">{{ formatPrice(product.price) }}</div>
                    <button class="btn btn-gold btn-sm" @click.stop="addToCart(product)">
                      <i class="bi bi-bag-plus me-1"></i>Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="!loading && products.length === 0" class="text-center py-5">
            <i class="bi bi-search text-muted" style="font-size:3rem;"></i>
            <h5 class="text-muted mt-3">No products found</h5>
            <button class="btn btn-outline-gold btn-sm mt-2" @click="resetFilters">Clear Filters</button>
          </div>

          <!-- Pagination -->
          <Pagination :current-page="currentPage" :total-pages="totalPages" @change="fetchProducts" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { productService, categoryService } from '@/services/api'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import ProductCard from '@/components/ui/ProductCard.vue'
import ProductSkeleton from '@/components/ui/ProductSkeleton.vue'
import Pagination from '@/components/ui/Pagination.vue'

const route = useRoute()
const cart = useCartStore()
const auth = useAuthStore()
const toast = useToast()

const products = ref([])
const categories = ref([])
const loading = ref(true)
const total = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const viewMode = ref('grid')

const filters = reactive({
  search: route.query.search || '',
  category_id: route.query.category_id || '',
  rentable: route.query.rentable === '1',
  max_price: 50000,
  sort: ''
})

let debounceTimer = null
function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchProducts(1), 400)
}

function formatPrice(val) {
  return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(val || 0)
}

async function fetchProducts(page = 1) {
  loading.value = true
  currentPage.value = page
  try {
    const params = {
      page,
      per_page: 9,
      search: filters.search || undefined,
      category_id: filters.category_id || undefined,
      is_rentable: filters.rentable ? 1 : undefined,
      max_price: filters.max_price < 50000 ? filters.max_price : undefined,
      sort: filters.sort || undefined
    }
    const res = await productService.getAll(params)
    const data = res.data
    products.value = data.data || data || []
    total.value = data.total || products.value.length
    totalPages.value = data.last_page || Math.ceil(total.value / 9) || 1
  } catch (e) {
    products.value = []
  } finally {
    loading.value = false
  }
}

async function addToCart(product) {
  if (!auth.isAuthenticated) { toast.info('Please sign in'); return }
  const res = await cart.addItem(product.id)
  if (res.success) { toast.success('Added to cart!'); cart.openCart() }
  else toast.error(res.message)
}

function resetFilters() {
  filters.search = ''
  filters.category_id = ''
  filters.rentable = false
  filters.max_price = 50000
  filters.sort = ''
  fetchProducts(1)
}

onMounted(async () => {
  const [catRes] = await Promise.all([categoryService.getAll(), fetchProducts(1)])
  categories.value = catRes.data?.data || catRes.data || []
})
</script>
