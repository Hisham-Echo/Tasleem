import axios from 'axios'

// ── Mock adapter toggle ───────────────────────────────────────
// Set VITE_USE_MOCKS=true in .env.local to use mock data
let mockAdapterFn = null
if (import.meta.env.VITE_USE_MOCKS === 'true') {
  const { createMockAdapter } = await import('@/mocks/mockAdapter.js')
  mockAdapterFn = createMockAdapter()
  console.log('%c[Tasleem] Mock API enabled 🎭  (VITE_USE_MOCKS=true)', 'color:#c9a96e;font-weight:bold;font-size:13px;')
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 15000,
  adapter: mockAdapterFn || undefined
})

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('tasleem_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  error => Promise.reject(error)
)

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tasleem_token')
      localStorage.removeItem('tasleem_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api

export const authService = {
  register:           data           => api.post('/register', data),
  login:              data           => api.post('/login', data),
  logout:             ()             => api.post('/logout'),
  me:                 ()             => api.get('/me'),
  forgotPassword:     data           => api.post('/forgot-password', data),
  resetPassword:      data           => api.post('/reset-password', data),
  verifyEmail:        (id,hash,prms) => api.get(`/verify-email/${id}/${hash}`, { params: prms }),
  resendVerification: ()             => api.post('/email/verification-notification'),
}

export const userService = {
  getAll:      params     => api.get('/users', { params }),
  getById:     id         => api.get(`/users/${id}`),
  create:      data       => api.post('/users', data),
  update:      (id, data) => api.put(`/users/${id}`, data),
  delete:      id         => api.delete(`/users/${id}`),
  getProducts: id         => api.get(`/users/${id}/products`),
  getOrders:   id         => api.get(`/users/${id}/orders`),
  getRentals:  id         => api.get(`/users/${id}/rentals`),
}

export const productService = {
  getAll:  params     => api.get('/products', { params }),
  getById: id         => api.get(`/products/${id}`),
  create:  data       => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (id, data) => api.post(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:  id         => api.delete(`/products/${id}`),
}

export const categoryService = {
  getAll:  ()         => api.get('/categories'),
  getById: id         => api.get(`/categories/${id}`),
  create:  data       => api.post('/categories', data),
  update:  (id, data) => api.put(`/categories/${id}`, data),
  delete:  id         => api.delete(`/categories/${id}`),
}

export const orderService = {
  getAll:  params     => api.get('/orders', { params }),
  getById: id         => api.get(`/orders/${id}`),
  create:  data       => api.post('/orders', data),
  update:  (id, data) => api.put(`/orders/${id}`, data),
  cancel:  id         => api.put(`/orders/${id}`, { status: 'cancelled' }),
  delete:  id         => api.delete(`/orders/${id}`),
}

export const rentalService = {
  getAll:  params     => api.get('/rentals', { params }),
  getById: id         => api.get(`/rentals/${id}`),
  create:  data       => api.post('/rentals', data),
  update:  (id, data) => api.put(`/rentals/${id}`, data),
  return:  id         => api.put(`/rentals/${id}`, { status: 'returned' }),
  delete:  id         => api.delete(`/rentals/${id}`),
}

export const reviewService = {
  getAll:  params     => api.get('/reviews', { params }),
  getById: id         => api.get(`/reviews/${id}`),
  create:  data       => api.post('/reviews', data),
  update:  (id, data) => api.put(`/reviews/${id}`, data),
  delete:  id         => api.delete(`/reviews/${id}`),
}

export const paymentService = {
  getAll:  params     => api.get('/payments', { params }),
  getById: id         => api.get(`/payments/${id}`),
  create:  data       => api.post('/payments', data),
  update:  (id, data) => api.put(`/payments/${id}`, data),
  delete:  id         => api.delete(`/payments/${id}`),
}

export const cartService = {
  get:        ()         => api.get('/cart'),
  addItem:    data       => api.post('/cart', data),
  addRental:  data       => api.post('/cart/rentals', data),
  updateItem: (id, data) => api.put(`/cart/${id}`, data),
  removeItem: id         => api.delete(`/cart/${id}`),
  clear:      ()         => api.delete('/cart'),
}

export const wishlistService = {
  getAll: ()   => api.get('/wishlist'),
  add:    data => api.post('/wishlist', data),
  check:  id   => api.get(`/wishlist/check/${id}`),
  remove: id   => api.delete(`/wishlist/${id}`),
  clear:  ()   => api.delete('/wishlist'),
}

export const imageService = {
  getAll:       productId            => api.get(`/products/${productId}/images`),
  get:          (productId, imageId) => api.get(`/products/${productId}/images/${imageId}`),
  upload:       (productId, data)    => api.post(`/products/${productId}/images`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadSingle: (productId, data)    => api.post(`/products/${productId}/images/single`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateAlt:    (pid, iid, data)     => api.put(`/products/${pid}/images/${iid}`, data),
  delete:       (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
  bulkDelete:   (productId, data)    => api.delete(`/products/${productId}/images`, { data }),
}

export const recommendationService = {
  getAll:  params => api.get('/recommendations', { params }),
  getById: id     => api.get(`/recommendations/${id}`),
}

export const logService = {
  getAll: params => api.get('/logs', { params }),
}

export const notificationService = {
  getAll:       ()  => api.get('/notifications'),
  markRead:     id  => api.put(`/notifications/${id}/read`),
  markAllRead:  ()  => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
}

export const searchService = {
  global: query => api.get('/products', { params: { search: query, per_page: 20 } }),
}
