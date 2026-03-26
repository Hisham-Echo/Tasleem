<template>
  <div>
    <div class="page-header">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-2">
            <li class="breadcrumb-item"><RouterLink to="/">Home</RouterLink></li>
            <li class="breadcrumb-item"><RouterLink to="/orders">Orders</RouterLink></li>
            <li class="breadcrumb-item active">#{{ order?.id }}</li>
          </ol>
        </nav>
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <h1 class="text-cream mb-0">Order #{{ order?.id }}</h1>
          <span v-if="order" class="badge fs-6 px-3 py-2" :class="statusBadge(order.status)">
            {{ order.status || 'pending' }}
          </span>
        </div>
      </div>
    </div>

    <div class="container py-4">
      <LoadingSpinner v-if="loading" height="300px" />

      <div class="row g-4" v-else-if="order">
        <!-- Items & timeline -->
        <div class="col-lg-8">
          <!-- Status timeline -->
          <div class="card p-4 mb-4">
            <h6 class="text-cream mb-3">Order Progress</h6>
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div v-for="(step, i) in statusSteps" :key="step.key"
                class="d-flex flex-column align-items-center gap-1 flex-grow-1">
                <div class="timeline-dot"
                  :class="{
                    active: currentStepIndex >= i,
                    current: currentStepIndex === i,
                    cancelled: order.status === 'cancelled' && step.key === 'cancelled'
                  }">
                  <i :class="step.icon" style="font-size:.85rem;"></i>
                </div>
                <span class="text-center" style="font-size:.7rem; color:var(--text-muted); white-space:nowrap;">{{ step.label }}</span>
              </div>
            </div>
          </div>

          <!-- Order items -->
          <div class="card p-4 mb-4">
            <h6 class="text-cream mb-3">Items Ordered</h6>
            <div class="d-flex flex-column gap-3">
              <div class="d-flex align-items-center gap-3" v-for="item in (order.items || [])" :key="item.id">
                <RouterLink :to="`/products/${item.product_id || item.product?.id}`">
                  <div class="rounded-xl overflow-hidden flex-shrink-0" style="width:72px;height:72px;background:var(--navy-light);">
                    <img :src="item.image || item.product?.image" style="width:100%;height:100%;object-fit:cover;" v-if="item.image || item.product?.image" />
                    <div class="d-flex align-items-center justify-content-center h-100" v-else>
                      <i class="bi bi-image text-muted"></i>
                    </div>
                  </div>
                </RouterLink>
                <div class="flex-grow-1">
                  <RouterLink :to="`/products/${item.product_id || item.product?.id}`" class="text-cream text-decoration-none fw-500">
                    {{ item.name || item.product?.name }}
                  </RouterLink>
                  <div class="text-muted" style="font-size:.82rem;">Qty: {{ item.quantity || 1 }}</div>
                  <div class="text-muted" style="font-size:.78rem;">{{ formatPrice(item.price) }} each</div>
                </div>
                <div class="text-gold fw-700">{{ formatPrice((item.price || 0) * (item.quantity || 1)) }}</div>
              </div>
            </div>
          </div>

          <!-- Shipping -->
          <div class="card p-4">
            <h6 class="text-cream mb-3"><i class="bi bi-truck me-2 text-gold"></i>Shipping Details</h6>
            <div class="text-muted" style="font-size:.9rem; line-height:1.7;">{{ order.shipping_address || 'Not specified' }}</div>
          </div>
        </div>

        <!-- Summary & actions -->
        <div class="col-lg-4">
          <div class="card p-4 mb-3">
            <h6 class="text-cream mb-3">Order Summary</h6>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Subtotal</span>
              <span class="text-cream">{{ formatPrice(order.subtotal || order.total) }}</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted">Shipping</span>
              <span class="text-cream">{{ formatPrice(order.shipping_cost || 50) }}</span>
            </div>
            <hr class="divider-gold my-2" />
            <div class="d-flex justify-content-between mb-3">
              <span class="text-cream fw-700">Total</span>
              <span class="text-gold fw-700 fs-5">{{ formatPrice(order.total) }}</span>
            </div>
            <div class="d-flex flex-column gap-1" style="font-size:.82rem;">
              <div class="text-muted"><i class="bi bi-credit-card me-2"></i>{{ order.payment_method || 'Cash on Delivery' }}</div>
              <div class="text-muted"><i class="bi bi-calendar me-2"></i>{{ formatDate(order.created_at) }}</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="card p-4">
            <h6 class="text-cream mb-3">Actions</h6>
            <!-- Cancel order -->
            <div v-if="canCancel">
              <p class="text-muted mb-2" style="font-size:.82rem;">Not happy with your order? Cancel before it ships.</p>
              <button class="btn w-100 mb-2" style="background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.25);color:#e74c3c;" @click="showCancelConfirm = true" :disabled="cancelling">
                <i class="bi bi-x-circle me-2"></i>Cancel Order
              </button>
            </div>
            <!-- Cancelled note -->
            <div v-if="order.status === 'cancelled'" class="alert py-2 px-3 mb-2" style="background:rgba(231,76,60,.08);border:1px solid rgba(231,76,60,.2);border-radius:.6rem;font-size:.82rem;">
              <i class="bi bi-info-circle me-1"></i> This order was cancelled.
            </div>
            <!-- Completed — leave a review -->
            <div v-if="order.status === 'completed'" class="alert py-2 px-3 mb-2" style="background:rgba(46,204,113,.08);border:1px solid rgba(46,204,113,.2);border-radius:.6rem;font-size:.82rem;">
              <i class="bi bi-check-circle me-1"></i> Order delivered! Leave a review for the seller.
            </div>
            <RouterLink class="btn btn-outline-gold w-100 btn-sm" to="/orders">
              <i class="bi bi-arrow-left me-2"></i>Back to Orders
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Not found -->
      <div v-else class="text-center py-5">
        <i class="bi bi-bag-x text-muted" style="font-size:3rem;"></i>
        <p class="text-muted mt-2">Order not found</p>
        <RouterLink class="btn btn-outline-gold" to="/orders">Back to Orders</RouterLink>
      </div>
    </div>

    <!-- Cancel confirmation modal -->
    <Transition name="fade">
      <div v-if="showCancelConfirm" class="modal-overlay" @click.self="showCancelConfirm = false">
        <div class="card p-4" style="max-width:400px;width:100%;border-radius:1.25rem;">
          <div class="text-center mb-4">
            <div class="mx-auto mb-3" style="width:60px;height:60px;border-radius:50%;background:rgba(231,76,60,.1);display:flex;align-items:center;justify-content:center;">
              <i class="bi bi-exclamation-triangle" style="font-size:1.6rem;color:#e74c3c;"></i>
            </div>
            <h5 class="text-cream">Cancel this order?</h5>
            <p class="text-muted mb-0" style="font-size:.88rem;">Order #{{ order?.id }} will be cancelled. This action cannot be undone.</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn w-100" style="background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.3);color:#e74c3c;" @click="cancelOrder" :disabled="cancelling">
              <span class="spinner-border spinner-border-sm me-2" v-if="cancelling"></span>
              {{ cancelling ? 'Cancelling...' : 'Yes, Cancel Order' }}
            </button>
            <button class="btn btn-outline-gold w-100" @click="showCancelConfirm = false">Keep Order</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { orderService } from '@/services/api'
import { useToast } from 'vue-toastification'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const route = useRoute()
const toast = useToast()
const order = ref(null)
const loading = ref(true)
const cancelling = ref(false)
const showCancelConfirm = ref(false)

const statusSteps = [
  { key: 'pending',    label: 'Placed',    icon: 'bi bi-check2' },
  { key: 'processing',label: 'Processing', icon: 'bi bi-gear' },
  { key: 'shipped',   label: 'Shipped',   icon: 'bi bi-truck' },
  { key: 'completed', label: 'Delivered', icon: 'bi bi-house-check' },
]

const statusOrder = ['pending','processing','shipped','completed']
const currentStepIndex = computed(() => {
  if (order.value?.status === 'cancelled') return -1
  return statusOrder.indexOf(order.value?.status) ?? 0
})

const canCancel = computed(() =>
  order.value && ['pending','processing'].includes(order.value.status)
)

function formatPrice(v) { return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(v || 0) }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-EG', { year:'numeric', month:'long', day:'numeric' }) : '' }
function statusBadge(s) {
  const m = { pending:'bg-warning text-dark', processing:'bg-info text-dark', shipped:'badge-gold', completed:'bg-success', cancelled:'bg-danger' }
  return m[s] || 'bg-secondary'
}

async function cancelOrder() {
  cancelling.value = true
  try {
    await orderService.cancel(order.value.id)
    order.value.status = 'cancelled'
    showCancelConfirm.value = false
    toast.success('Order cancelled successfully')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to cancel order')
  } finally {
    cancelling.value = false
  }
}

onMounted(async () => {
  try {
    const res = await orderService.getById(route.params.id)
    order.value = res.data?.data || res.data
  } catch (_) { order.value = null } finally { loading.value = false }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 1060;
  background: rgba(0,0,0,.65);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem; backdrop-filter: blur(4px);
}
.timeline-dot {
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--navy-light); border: 2px solid var(--navy-border);
  color: var(--text-muted); transition: var(--transition);
}
.timeline-dot.active  { border-color: var(--gold); color: var(--gold); background: rgba(201,169,110,.1); }
.timeline-dot.current { background: var(--gold); color: var(--navy); border-color: var(--gold); }
.timeline-dot.cancelled { border-color: #e74c3c; color: #e74c3c; background: rgba(231,76,60,.1); }
</style>
