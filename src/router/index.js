import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // Public
  { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue') },
  { path: '/products', name: 'Products', component: () => import('@/views/products/ProductsView.vue') },
  { path: '/products/:id', name: 'ProductDetail', component: () => import('@/views/products/ProductDetailView.vue') },
  { path: '/categories', name: 'Categories', component: () => import('@/views/CategoriesView.vue') },
  { path: '/search', name: 'Search', component: () => import('@/views/search/SearchView.vue') },

  // Auth (guest only)
  { path: '/login', name: 'Login', component: () => import('@/views/auth/LoginView.vue'), meta: { guest: true } },
  { path: '/register', name: 'Register', component: () => import('@/views/auth/RegisterView.vue'), meta: { guest: true } },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('@/views/auth/ForgotPasswordView.vue'), meta: { guest: true } },
  { path: '/reset-password', name: 'ResetPassword', component: () => import('@/views/auth/ResetPasswordView.vue'), meta: { guest: true } },

  // Email verification
  { path: '/email/verify', name: 'VerifyEmail', component: () => import('@/views/auth/VerifyEmailView.vue'), meta: { requiresAuth: true } },
  { path: '/email/verify/:id/:hash', name: 'VerifyEmailLink', component: () => import('@/views/auth/VerifyEmailView.vue'), meta: { requiresAuth: true } },

  // Auth required
  { path: '/cart', name: 'Cart', component: () => import('@/views/CartView.vue'), meta: { requiresAuth: true } },
  { path: '/checkout', name: 'Checkout', component: () => import('@/views/CheckoutView.vue'), meta: { requiresAuth: true } },
  { path: '/orders', name: 'Orders', component: () => import('@/views/orders/OrdersView.vue'), meta: { requiresAuth: true } },
  { path: '/orders/:id', name: 'OrderDetail', component: () => import('@/views/orders/OrderDetailView.vue'), meta: { requiresAuth: true } },
  { path: '/rentals', name: 'Rentals', component: () => import('@/views/rentals/RentalsView.vue'), meta: { requiresAuth: true } },
  { path: '/wishlist', name: 'Wishlist', component: () => import('@/views/WishlistView.vue'), meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: () => import('@/views/profile/ProfileView.vue'), meta: { requiresAuth: true } },
  { path: '/payments', name: 'Payments', component: () => import('@/views/payments/PaymentsView.vue'), meta: { requiresAuth: true } },

  // Seller
  { path: '/seller/dashboard', name: 'SellerDashboard', component: () => import('@/views/seller/SellerDashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/seller/products/create', name: 'CreateProduct', component: () => import('@/views/seller/CreateProductView.vue'), meta: { requiresAuth: true } },
  { path: '/seller/products/:id/edit', name: 'EditProduct', component: () => import('@/views/seller/EditProductView.vue'), meta: { requiresAuth: true } },

  // Admin
  { path: '/admin', name: 'Admin', component: () => import('@/views/admin/AdminDashboardView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },

  // 404
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/views/NotFoundView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  }
})

router.beforeEach(async to => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'Home' }
  }
  if (to.meta.guest && auth.isAuthenticated) {
    return { name: 'Home' }
  }
})

export default router
