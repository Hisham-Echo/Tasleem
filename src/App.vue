<template>
  <div id="app-root">
    <!-- Email verification banner -->
    <div v-if="auth.isAuthenticated && auth.needsVerification && !isAuthPage && !isVerifyPage"
      class="verify-banner d-flex align-items-center justify-content-center gap-2 px-3 py-2 flex-wrap">
      <i class="bi bi-envelope-exclamation-fill"></i>
      <span style="font-size:.85rem;">Please verify your email address to access all features.</span>
      <RouterLink to="/verify-email" class="btn btn-sm py-0 px-2" style="background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3);font-size:.8rem;">Verify Now</RouterLink>
    </div>

    <AppNavbar v-if="!isAuthPage" />

    <main class="flex-grow-1" :style="{ paddingBottom: auth.isAuthenticated && !isAuthPage ? '70px' : '0' }" style="min-height:60vh;">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <AppFooter v-if="!isAuthPage && !isMobileApp" />
    <MobileBottomNav v-if="!isAuthPage" />
    <CartSidebar />
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useWishlistStore } from '@/stores/wishlist'
import { useNotificationStore } from '@/stores/notifications'
import MockDevBar from '@/components/dev/MockDevBar.vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import MobileBottomNav from '@/components/layout/MobileBottomNav.vue'
import CartSidebar from '@/components/layout/CartSidebar.vue'

const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()
const wishlist = useWishlistStore()
const notifications = useNotificationStore()

const authPages = ['Login', 'Register', 'ForgotPassword', 'ResetPassword']
const isAuthPage = computed(() => authPages.includes(route.name))
const isVerifyPage = computed(() => route.name === 'VerifyEmail')
const isMobileApp = computed(() => window.innerWidth < 768 && route.name !== 'Home')

onMounted(async () => {
  if (auth.isAuthenticated) {
    await auth.fetchMe()
    await Promise.all([cart.fetchCart(), wishlist.fetchWishlist()])
    notifications.startPolling(60000)
  }
})

onBeforeUnmount(() => {
  notifications.stopPolling()
})
</script>

<style scoped>
.verify-banner {
  background: linear-gradient(90deg, #b7791f, #c9a96e);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 1050;
}
</style>
