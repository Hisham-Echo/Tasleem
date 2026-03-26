<template>
  <div>
    <div class="page-header">
      <div class="container">
        <h1 class="text-cream mb-0"><i class="bi bi-bag-check me-2 text-gold"></i>My Orders</h1>
      </div>
    </div>
    <div class="container py-4">
      <LoadingSpinner v-if="loading" height="300px" text="Loading orders..." />

      <div v-else-if="orders.length === 0" class="text-center py-5">
        <i class="bi bi-bag-x text-muted" style="font-size:3rem;"></i>
        <h5 class="text-muted mt-3">No orders yet</h5>
        <RouterLink class="btn btn-gold mt-2" to="/products">Start Shopping</RouterLink>
      </div>

      <div class="d-flex flex-column gap-3" v-else>
        <div class="card p-4" v-for="order in orders" :key="order.id">
          <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="text-gold fw-700">Order #{{ order.id }}</span>
                <span class="badge" :class="statusBadge(order.status)">{{ order.status || 'pending' }}</span>
              </div>
              <div class="text-muted" style="font-size:.82rem;"><i class="bi bi-calendar me-1"></i>{{ formatDate(order.created_at) }}</div>
              <div class="text-muted mt-1" style="font-size:.82rem;"><i class="bi bi-geo-alt me-1"></i>{{ order.shipping_address }}</div>
              <div class="text-muted mt-1" style="font-size:.78rem;"><i class="bi bi-box me-1"></i>{{ order.items?.length || 0 }} item(s)</div>
            </div>
            <div class="text-end">
              <div class="text-gold fw-700 fs-5 mb-2">{{ formatPrice(order.total) }}</div>
              <div class="d-flex gap-2 justify-content-end">
                <RouterLink class="btn btn-sm btn-outline-gold" :to="`/orders/${order.id}`">
                  <i class="bi bi-eye me-1"></i>View
                </RouterLink>
                <button
                  v-if="canCancel(order.status)"
                  class="btn btn-sm btn-outline-danger"
                  @click="cancelOrder(order)"
                  :disabled="cancellingId === order.id"
                >
                  <span class="spinner-border spinner-border-sm me-1" v-if="cancellingId === order.id"></span>
                  <i class="bi bi-x-circle me-1" v-else></i>Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Pagination :current-page="currentPage" :total-pages="totalPages" @change="fetchOrders" />
    </div>

    <!-- Cancel confirm modal -->
    <div class="modal fade" id="cancelModal" tabindex="-1" ref="cancelModal">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content">
          <div class="modal-header border-0 pb-1">
            <h6 class="modal-title text-cream"><i class="bi bi-x-circle text-danger me-2"></i>Cancel Order?</h6>
          </div>
          <div class="modal-body text-muted" style="font-size:.88rem;">
            This will cancel order <strong class="text-cream">#{{ toCancel?.id }}</strong>. This action cannot be undone.
          </div>
          <div class="modal-footer border-0 pt-1 gap-2">
            <button class="btn btn-sm btn-outline-gold" data-bs-dismiss="modal">Keep Order</button>
            <button class="btn btn-sm btn-danger" @click="confirmCancel">Yes, Cancel It</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { orderService } from '@/services/api'
import { useToast } from 'vue-toastification'
import { Modal } from 'bootstrap'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import Pagination from '@/components/ui/Pagination.vue'

const toast = useToast()
const orders = ref([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const cancellingId = ref(null)
const toCancel = ref(null)
const cancelModal = ref(null)
let bsModal = null

function formatPrice(v) { return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' }).format(v || 0) }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '' }
function statusBadge(s) {
  const m = { pending: 'bg-warning text-dark', processing: 'bg-info text-dark', completed: 'bg-success', cancelled: 'bg-danger' }
  return m[s] || 'bg-secondary'
}
function canCancel(status) {
  return ['pending', 'processing'].includes(status)
}

function cancelOrder(order) {
  toCancel.value = order
  bsModal = bsModal || new Modal(cancelModal.value)
  bsModal.show()
}

async function confirmCancel() {
  if (!toCancel.value) return
  cancellingId.value = toCancel.value.id
  bsModal.hide()
  try {
    await orderService.update(toCancel.value.id, { status: 'cancelled' })
    const found = orders.value.find(o => o.id === toCancel.value.id)
    if (found) found.status = 'cancelled'
    toast.success(`Order #${toCancel.value.id} cancelled`)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to cancel order')
  } finally {
    cancellingId.value = null
    toCancel.value = null
  }
}

async function fetchOrders(page = 1) {
  loading.value = true
  try {
    const res = await orderService.getAll({ page, per_page: 10 })
    orders.value = res.data?.data || res.data || []
    totalPages.value = res.data?.last_page || 1
    currentPage.value = page
  } catch (_) { orders.value = [] } finally { loading.value = false }
}

onMounted(() => fetchOrders())
</script>
