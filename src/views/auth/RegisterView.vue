<template>
  <div class="auth-page">
    <!-- Left panel -->
    <div class="auth-panel flex-grow-1 d-none d-lg-flex align-items-center justify-content-center p-5">
      <div class="auth-panel-content text-center">
        <div class="big-text mb-4">تسليم</div>
        <h2 class="text-cream mb-3">Join <span class="text-gold">Tasleem</span><br />Today</h2>
        <p class="text-muted" style="max-width:300px;">Start buying, selling and renting in minutes. No listing fees to get started.</p>
        <div class="mt-4 p-4 card" style="max-width:280px; margin:0 auto; border-radius:1rem;">
          <div class="text-gold fw-700" style="font-size:2rem;">FREE</div>
          <div class="text-cream" style="font-size:.9rem;">to join & start selling</div>
          <hr style="border-color:var(--navy-border);" />
          <ul class="list-unstyled text-start mb-0">
            <li class="text-muted mb-2" style="font-size:.85rem;" v-for="f in perks" :key="f">
              <i class="bi bi-check-circle text-gold me-2"></i>{{ f }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Form -->
    <div class="d-flex align-items-center justify-content-center p-4 p-md-5" style="min-width:min(100%,500px); overflow-y:auto;">
      <div class="auth-card" style="max-width:460px;">
        <div class="auth-logo mb-1">تسليم<span>.</span></div>
        <p class="text-muted mb-4" style="font-size:.9rem;">Create your account</p>

        <form @submit.prevent="onSubmit" novalidate>
          <div class="alert alert-danger py-2 px-3 mb-3" style="background:rgba(231,76,60,.1); border:1px solid rgba(231,76,60,.25); border-radius:.6rem; font-size:.88rem;" v-if="errorMsg">
            <i class="bi bi-exclamation-circle me-2"></i>{{ errorMsg }}
          </div>

          <div class="mb-3">
            <label class="form-label">Full Name</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-person"></i></span>
              <input v-model="form.name" type="text" class="form-control" :class="{ 'is-invalid': errors.name }" placeholder="Ahmed Mohamed" autocomplete="name" />
              <div class="invalid-feedback">{{ errors.name }}</div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Email Address</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-envelope"></i></span>
              <input v-model="form.email" type="email" class="form-control" :class="{ 'is-invalid': errors.email }" placeholder="you@example.com" autocomplete="email" />
              <div class="invalid-feedback">{{ errors.email }}</div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Phone Number</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-phone"></i></span>
              <input v-model="form.phone" type="tel" class="form-control" :class="{ 'is-invalid': errors.phone }" placeholder="01234567890" autocomplete="tel" />
              <div class="invalid-feedback">{{ errors.phone }}</div>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Password</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock"></i></span>
              <input v-model="form.password" :type="showPw ? 'text' : 'password'" class="form-control" :class="{ 'is-invalid': errors.password }" placeholder="Min. 8 characters" autocomplete="new-password" />
              <button type="button" class="input-group-text cursor-pointer" @click="showPw = !showPw">
                <i :class="showPw ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
              <div class="invalid-feedback">{{ errors.password }}</div>
            </div>
            <!-- Password strength -->
            <div class="mt-2 d-flex gap-1" v-if="form.password">
              <div v-for="n in 4" :key="n" class="flex-grow-1" style="height:3px; border-radius:2px; transition:.2s;" :style="{ background: n <= passwordStrength ? strengthColors[passwordStrength - 1] : 'var(--navy-border)' }"></div>
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label">Confirm Password</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
              <input v-model="form.password_confirmation" :type="showPw ? 'text' : 'password'" class="form-control" :class="{ 'is-invalid': errors.password_confirmation }" placeholder="Repeat password" autocomplete="new-password" />
              <div class="invalid-feedback">{{ errors.password_confirmation }}</div>
            </div>
          </div>

          <div class="form-check mb-4">
            <input class="form-check-input" type="checkbox" v-model="form.terms" id="terms" :class="{ 'is-invalid': errors.terms }" />
            <label class="form-check-label text-muted" for="terms" style="font-size:.85rem;">
              I agree to the <a href="#" class="text-gold">Terms of Service</a> and <a href="#" class="text-gold">Privacy Policy</a>
            </label>
            <div class="invalid-feedback">{{ errors.terms }}</div>
          </div>

          <button type="submit" class="btn btn-gold w-100 py-2" :disabled="auth.loading">
            <span class="spinner-border spinner-border-sm me-2" v-if="auth.loading"></span>
            {{ auth.loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <div class="or-divider my-4">or</div>
        <p class="text-center mb-0 text-muted" style="font-size:.9rem;">
          Already have an account?
          <RouterLink class="text-gold text-decoration-none fw-500" to="/login">Sign in</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useToast } from 'vue-toastification'

const router = useRouter()
const auth = useAuthStore()
const cart = useCartStore()
const wishlist = useWishlistStore()
const toast = useToast()

const showPw = ref(false)
const errorMsg = ref('')
const form = reactive({ name: '', email: '', phone: '', password: '', password_confirmation: '', terms: false })
const errors = reactive({ name: '', email: '', phone: '', password: '', password_confirmation: '', terms: '' })
const perks = ['Free to list products', 'AI recommendations', 'Secure payments', 'Rental income']
const strengthColors = ['#e74c3c', '#f39c12', '#3498db', '#2ecc71']

const passwordStrength = computed(() => {
  const p = form.password
  if (!p) return 0
  let s = 0
  if (p.length >= 8) s++
  if (/[A-Z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return Math.max(s, 1)
})

function validate() {
  Object.keys(errors).forEach(k => errors[k] = '')
  let valid = true
  if (!form.name.trim()) { errors.name = 'Full name is required'; valid = false }
  if (!form.email) { errors.email = 'Email is required'; valid = false }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'Enter a valid email'; valid = false }
  if (!form.phone) { errors.phone = 'Phone number is required'; valid = false }
  else if (!/^[\d\+\-\s]{7,15}$/.test(form.phone)) { errors.phone = 'Enter a valid phone number'; valid = false }
  if (!form.password) { errors.password = 'Password is required'; valid = false }
  else if (form.password.length < 8) { errors.password = 'Minimum 8 characters'; valid = false }
  if (form.password !== form.password_confirmation) { errors.password_confirmation = 'Passwords do not match'; valid = false }
  if (!form.terms) { errors.terms = 'You must accept the terms'; valid = false }
  return valid
}

async function onSubmit() {
  errorMsg.value = ''
  if (!validate()) return
  const { terms, ...payload } = form
  const res = await auth.register(payload)
  if (res.success) {
    toast.success('Account created! Welcome to Tasleem 🎉')
    await Promise.all([cart.fetchCart(), wishlist.fetchWishlist()])
    router.push('/')
  } else {
    errorMsg.value = res.message
    if (res.errors) {
      Object.assign(errors, Object.fromEntries(Object.entries(res.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])))
    }
  }
}
</script>
