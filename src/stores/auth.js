import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const user  = ref(JSON.parse(localStorage.getItem('tasleem_user') || 'null'))
  const token = ref(localStorage.getItem('tasleem_token') || null)
  const loading = ref(false)
  const emailVerified = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin         = computed(() => user.value?.role === 'admin')
  const isSeller        = computed(() => ['seller','admin'].includes(user.value?.role))
  const fullName        = computed(() => user.value?.name || '')
  const needsVerification = computed(() => user.value && !user.value.email_verified_at)

  function setAuth(userData, tokenData) {
    user.value  = userData
    token.value = tokenData
    localStorage.setItem('tasleem_user',  JSON.stringify(userData))
    localStorage.setItem('tasleem_token', tokenData)
  }

  function clearAuth() {
    user.value  = null
    token.value = null
    localStorage.removeItem('tasleem_user')
    localStorage.removeItem('tasleem_token')
  }

  async function login(credentials) {
    loading.value = true
    try {
      const res = await authService.login(credentials)
      const { user: u, token: t } = res.data
      setAuth(u, t)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' }
    } finally {
      loading.value = false
    }
  }

  async function register(data) {
    loading.value = true
    try {
      const res = await authService.register(data)
      const { user: u, token: t } = res.data
      setAuth(u, t)
      return { success: true }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed',
        errors:  err.response?.data?.errors  || {}
      }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try { await authService.logout() } catch (_) {}
    clearAuth()
  }

  async function fetchMe() {
    try {
      const res = await authService.me()
      user.value = res.data.user || res.data
      localStorage.setItem('tasleem_user', JSON.stringify(user.value))
    } catch (_) {
      clearAuth()
    }
  }

  async function updateProfile(data) {
    loading.value = true
    try {
      const { userService } = await import('@/services/api')
      const res = await userService.update(user.value.id, data)
      user.value = res.data.user || res.data
      localStorage.setItem('tasleem_user', JSON.stringify(user.value))
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Update failed' }
    } finally {
      loading.value = false
    }
  }

  async function forgotPassword(email) {
    loading.value = true
    try {
      await authService.forgotPassword({ email })
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to send reset link' }
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(data) {
    loading.value = true
    try {
      const res = await authService.resetPassword(data)
      const u = res.data?.user
      const t = res.data?.token
      if (u && t) setAuth(u, t)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Password reset failed', errors: err.response?.data?.errors || {} }
    } finally {
      loading.value = false
    }
  }

  async function resendVerification() {
    loading.value = true
    try {
      await authService.resendVerification()
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to resend email' }
    } finally {
      loading.value = false
    }
  }

  return {
    user, token, loading, emailVerified,
    isAuthenticated, isAdmin, isSeller, fullName, needsVerification,
    login, register, logout, fetchMe, updateProfile,
    forgotPassword, resetPassword, resendVerification,
  }
})
