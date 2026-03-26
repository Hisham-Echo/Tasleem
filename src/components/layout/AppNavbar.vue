<template>
  <nav class="navbar navbar-tasleem navbar-expand-lg sticky-top">
    <div class="container">
      <!-- Brand -->
      <RouterLink class="navbar-brand" to="/">تسليم<span>.</span></RouterLink>

      <!-- Mobile right actions -->
      <div class="d-flex align-items-center gap-1 d-lg-none">
        <NotificationBell v-if="auth.isAuthenticated" />
        <button class="btn btn-sm p-1 cart-badge text-cream position-relative" @click="cart.openCart()" v-if="auth.isAuthenticated">
          <i class="bi bi-bag fs-5"></i>
          <span class="badge" v-if="cart.totalItems > 0">{{ cart.totalItems }}</span>
        </button>
        <button class="navbar-toggler border-0 p-1" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
          <i class="bi bi-list fs-4 text-cream"></i>
        </button>
      </div>

      <div class="collapse navbar-collapse" id="navbarMain">
        <!-- Search -->
        <form class="search-bar d-flex mx-lg-4 my-2 my-lg-0 flex-grow-1" @submit.prevent="onSearch">
          <input class="form-control" type="search" placeholder="Search products..." v-model="searchQuery" />
          <button class="btn" type="submit"><i class="bi bi-search"></i></button>
        </form>

        <ul class="navbar-nav align-items-lg-center gap-1">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/products">Products</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/categories">Categories</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" to="/rentals" v-if="auth.isAuthenticated">Rentals</RouterLink>
          </li>

          <!-- Guest buttons -->
          <template v-if="!auth.isAuthenticated">
            <li class="nav-item ms-lg-2">
              <RouterLink class="btn btn-outline-gold btn-sm px-3" to="/login">Sign In</RouterLink>
            </li>
            <li class="nav-item ms-1">
              <RouterLink class="btn btn-gold btn-sm px-3" to="/register">Get Started</RouterLink>
            </li>
          </template>

          <!-- Authenticated -->
          <template v-else>
            <!-- Seller dashboard -->
            <li class="nav-item" v-if="auth.isSeller">
              <RouterLink class="nav-link" to="/seller">
                <i class="bi bi-shop me-1"></i>Sell
              </RouterLink>
            </li>

            <!-- Admin link -->
            <li class="nav-item" v-if="auth.isAdmin">
              <RouterLink class="nav-link" to="/admin">
                <i class="bi bi-shield-check me-1"></i>Admin
              </RouterLink>
            </li>

            <!-- Notifications (desktop) -->
            <li class="nav-item d-none d-lg-flex align-items-center">
              <NotificationBell />
            </li>

            <!-- Wishlist -->
            <li class="nav-item d-none d-lg-flex align-items-center">
              <RouterLink class="nav-link position-relative px-2" to="/wishlist">
                <i class="bi bi-heart fs-5"></i>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size:.55rem;padding:.25em .4em;" v-if="wishlist.count > 0">{{ wishlist.count }}</span>
              </RouterLink>
            </li>

            <!-- Cart -->
            <li class="nav-item d-none d-lg-flex align-items-center">
              <button class="nav-link cart-badge border-0 bg-transparent position-relative px-2" @click="cart.openCart()">
                <i class="bi bi-bag fs-5"></i>
                <span class="badge" v-if="cart.totalItems > 0">{{ cart.totalItems }}</span>
              </button>
            </li>

            <!-- Profile dropdown -->
            <li class="nav-item dropdown ms-lg-1">
              <a class="nav-link dropdown-toggle d-flex align-items-center gap-2" href="#" data-bs-toggle="dropdown">
                <div class="user-avatar">{{ initials }}</div>
              </a>
              <ul class="dropdown-menu dropdown-menu-end" style="min-width:220px;">
                <li class="px-3 py-2">
                  <div class="text-cream fw-600" style="font-size:.9rem;">{{ auth.fullName }}</div>
                  <div class="text-muted" style="font-size:.78rem;">{{ auth.user?.email }}</div>
                  <span class="badge mt-1" :class="roleBadge">{{ auth.user?.role || 'user' }}</span>
                </li>
                <li><hr class="dropdown-divider m-1" style="border-color:var(--navy-border);" /></li>
                <li><RouterLink class="dropdown-item" to="/profile"><i class="bi bi-person me-2"></i>My Profile</RouterLink></li>
                <li><RouterLink class="dropdown-item" to="/orders"><i class="bi bi-bag-check me-2"></i>My Orders</RouterLink></li>
                <li><RouterLink class="dropdown-item" to="/rentals"><i class="bi bi-clock-history me-2"></i>My Rentals</RouterLink></li>
                <li><RouterLink class="dropdown-item" to="/payments"><i class="bi bi-credit-card me-2"></i>Payments</RouterLink></li>
                <li><RouterLink class="dropdown-item" to="/wishlist"><i class="bi bi-heart me-2"></i>Wishlist</RouterLink></li>
                <template v-if="auth.isSeller">
                  <li><hr class="dropdown-divider m-1" style="border-color:var(--navy-border);" /></li>
                  <li><RouterLink class="dropdown-item text-gold" to="/seller"><i class="bi bi-shop me-2"></i>Seller Dashboard</RouterLink></li>
                  <li><RouterLink class="dropdown-item" to="/seller/products/new"><i class="bi bi-plus-circle me-2"></i>List a Product</RouterLink></li>
                </template>
                <template v-if="auth.isAdmin">
                  <li><hr class="dropdown-divider m-1" style="border-color:var(--navy-border);" /></li>
                  <li><RouterLink class="dropdown-item" to="/admin"><i class="bi bi-shield-check me-2"></i>Admin Panel</RouterLink></li>
                  <li><RouterLink class="dropdown-item" to="/admin/users"><i class="bi bi-people me-2"></i>Manage Users</RouterLink></li>
                  <li><RouterLink class="dropdown-item" to="/admin/logs"><i class="bi bi-journal-code me-2"></i>Activity Logs</RouterLink></li>
                </template>
                <li><hr class="dropdown-divider m-1" style="border-color:var(--navy-border);" /></li>
                <li>
                  <button class="dropdown-item text-danger" @click="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i>Sign Out
                  </button>
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useToast } from 'vue-toastification'
import NotificationBell from '@/components/ui/NotificationBell.vue'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const wishlist = useWishlistStore()
const toast = useToast()
const searchQuery = ref('')

const initials = computed(() =>
  (auth.fullName || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'
)

const roleBadge = computed(() => {
  const m = { admin: 'bg-danger', seller: 'bg-warning text-dark', user: 'badge-gold' }
  return m[auth.user?.role] || 'badge-gold'
})

function onSearch() {
  if (!searchQuery.value.trim()) return
  router.push({ name: 'Search', query: { q: searchQuery.value.trim() } })
  searchQuery.value = ''
}

async function handleLogout() {
  await auth.logout()
  cart.items = []
  wishlist.items = []
  toast.info('Signed out successfully')
  router.push('/')
}
</script>

<style scoped>
.user-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, var(--gold-dark), var(--gold));
  display: flex; align-items: center; justify-content: center;
  font-size: .78rem; font-weight: 700; color: var(--navy);
  border: 2px solid rgba(201,169,110,.4);
}
</style>
