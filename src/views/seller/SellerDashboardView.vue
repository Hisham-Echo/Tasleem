<template>
  <div>
    <div class="page-header">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h1 class="text-cream mb-1"><i class="bi bi-shop me-2 text-gold"></i>Seller Dashboard</h1>
            <p class="text-muted mb-0">Manage your listings and track your performance.</p>
          </div>
          <RouterLink class="btn btn-gold px-4" to="/seller/products/new">
            <i class="bi bi-plus-lg me-2"></i>List New Product
          </RouterLink>
        </div>
      </div>
    </div>

    <div class="container py-4">
      <!-- Stats row -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3" v-for="stat in stats" :key="stat.label">
          <div class="card p-3 text-center">
            <i :class="stat.icon + ' fs-2 mb-2'" style="color:var(--gold);"></i>
            <div class="text-cream" style="font-size:1.6rem;font-weight:800;">{{ stat.loading ? '—' : stat.value }}</div>
            <div class="text-muted" style="font-size:.8rem;">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- Products table -->
      <div class="card p-0 overflow-hidden">
        <div class="card-header d-flex align-items-center justify-content-between px-4 py-3">
          <h5 class="text-cream mb-0">My Products</h5>
          <div class="d-flex gap-2">
            <input v-model="search" type="search" class="form-control form-control-sm" style="width:200px;" placeholder="Search..." />
          </div>
        </div>

        <LoadingSpinner v-if="loading" height="200px" />
        <div v-else-if="filteredProducts.length === 0" class="text-center py-5">
          <i class="bi bi-box-seam text-muted" style="font-size:2.5rem;"></i>
          <p class="text-muted mt-2">No products yet.</p>
          <RouterLink class="btn btn-gold btn-sm" to="/seller/products/new">List your first product</RouterLink>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th style="width:56px;"></th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Rentable</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in filteredProducts" :key="product.id">
                <td>
                  <div style="width:44px;height:44px;border-radius:.5rem;overflow:hidden;background:var(--navy-light);">
                    <img :src="product.image" style="width:100%;height:100%;object-fit:cover;" v-if="product.image" />
                    <div class="d-flex align-items-center justify-content-center h-100" v-else><i class="bi bi-image text-muted" style="font-size:.8rem;"></i></div>
                  </div>
                </td>
                <td>
                  <div class="text-cream" style="font-size:.9rem;font-weight:500;">{{ product.name }}</div>
                  <div class="text-muted" style="font-size:.75rem;">#{{ product.id }}</div>
                </td>
                <td><span class="badge badge-gold">{{ product.category?.name || '—' }}</span></td>
                <td class="text-gold fw-600">{{ formatPrice(product.price) }}</td>
                <td>
                  <span :class="product.stock > 0 ? 'text-success' : 'text-danger'" style="font-weight:500;">{{ product.stock }}</span>
                </td>
                <td>
                  <i class="bi" :class="product.is_rentable ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-muted'"></i>
                </td>
                <td>
                  <span class="badge" :class="product.stock > 0 ? 'bg-success' : 'bg-warning text-dark'">{{ product.stock > 0 ? 'Active' : 'Out of Stock' }}</span>
                </td>
                <td>
                  <div class="d-flex gap-1">
                    <RouterLink :to="`/products/${product.id}`" class="btn btn-sm btn-outline-gold px-2 py-1" title="View">
                      <i class="bi bi-eye"></i>
                    </RouterLink>
                    <RouterLink :to="`/seller/products/${product.id}/edit`" class="btn btn-sm btn-outline-gold px-2 py-1" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </RouterLink>
                    <button class="btn btn-sm px-2 py-1" style="background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.25);color:#e74c3c;" @click="deleteProduct(product)" title="Delete">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination v-if="totalPages > 1" :current-page="currentPage" :total-pages="totalPages" @change="fetchProducts" class="p-3" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userService, productService } from '@/services/api'
import { useToast } from 'vue-toastification'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import Pagination from '@/components/ui/Pagination.vue'

const auth = useAuthStore()
const toast = useToast()
const products = ref([])
const loading = ref(true)
const search = ref('')
const currentPage = ref(1)
const totalPages = ref(1)

const statsData = ref({ total: 0, active: 0, rentable: 0, outOfStock: 0 })
const stats = computed(() => [
  { icon: 'bi bi-box-seam', label: 'Total Products', value: statsData.value.total, loading: loading.value },
  { icon: 'bi bi-check-circle', label: 'Active', value: statsData.value.active, loading: loading.value },
  { icon: 'bi bi-clock-history', label: 'Rentable', value: statsData.value.rentable, loading: loading.value },
  { icon: 'bi bi-exclamation-circle', label: 'Out of Stock', value: statsData.value.outOfStock, loading: loading.value },
])

const filteredProducts = computed(() => {
  if (!search.value) return products.value
  const q = search.value.toLowerCase()
  return products.value.filter(p => p.name?.toLowerCase().includes(q) || p.category?.name?.toLowerCase().includes(q))
})

function formatPrice(v) { return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(v || 0) }

async function fetchProducts(page = 1) {
  loading.value = true
  try {
    const res = await userService.getProducts(auth.user.id)
    products.value = res.data?.data || res.data || []
    totalPages.value = res.data?.last_page || 1
    currentPage.value = page
    statsData.value = {
      total: products.value.length,
      active: products.value.filter(p => p.stock > 0).length,
      rentable: products.value.filter(p => p.is_rentable).length,
      outOfStock: products.value.filter(p => !p.stock || p.stock <= 0).length
    }
  } catch (_) { products.value = [] } finally { loading.value = false }
}

async function deleteProduct(product) {
  if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
  try {
    await productService.delete(product.id)
    products.value = products.value.filter(p => p.id !== product.id)
    statsData.value.total--
    toast.success('Product deleted')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Delete failed')
  }
}

onMounted(() => fetchProducts())
</script>
