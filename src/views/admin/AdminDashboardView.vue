<template>
  <div>
    <div class="page-header">
      <div class="container">
        <div class="d-flex align-items-center gap-3">
          <div class="p-2 rounded-xl" style="background:rgba(201,169,110,.1);border:1px solid rgba(201,169,110,.2);">
            <i class="bi bi-shield-fill-check text-gold" style="font-size:1.5rem;"></i>
          </div>
          <div>
            <h1 class="text-cream mb-0">Admin Dashboard</h1>
            <p class="text-muted mb-0" style="font-size:.85rem;">Platform overview & management</p>
          </div>
        </div>
      </div>
    </div>

    <div class="container py-4">
      <!-- KPI cards -->
      <div class="row g-3 mb-5">
        <div class="col-6 col-md-3" v-for="kpi in kpis" :key="kpi.label">
          <div class="card p-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted" style="font-size:.8rem;text-transform:uppercase;letter-spacing:.07em;">{{ kpi.label }}</span>
              <div class="p-2 rounded" :style="{background: kpi.bg}">
                <i :class="kpi.icon" :style="{color: kpi.color, fontSize:'1rem'}"></i>
              </div>
            </div>
            <div class="text-cream" style="font-size:1.75rem;font-weight:800;line-height:1;">
              <span v-if="kpi.loading" class="skeleton d-inline-block" style="width:60px;height:1.75rem;"></span>
              <span v-else>{{ kpi.value }}</span>
            </div>
            <div class="text-muted mt-1" style="font-size:.75rem;">{{ kpi.sub }}</div>
          </div>
        </div>
      </div>

      <!-- Quick links -->
      <div class="row g-3 mb-5">
        <div class="col-md-6">
          <RouterLink to="/admin/users" class="card p-4 d-flex flex-row align-items-center gap-3 card-hover text-decoration-none">
            <div style="width:52px;height:52px;border-radius:1rem;background:rgba(52,152,219,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="bi bi-people text-info" style="font-size:1.5rem;"></i>
            </div>
            <div>
              <div class="text-cream fw-600">User Management</div>
              <div class="text-muted" style="font-size:.83rem;">View, edit, and manage all user accounts and roles</div>
            </div>
            <i class="bi bi-arrow-right text-muted ms-auto"></i>
          </RouterLink>
        </div>
        <div class="col-md-6">
          <RouterLink to="/admin/logs" class="card p-4 d-flex flex-row align-items-center gap-3 card-hover text-decoration-none">
            <div style="width:52px;height:52px;border-radius:1rem;background:rgba(201,169,110,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="bi bi-journal-code text-gold" style="font-size:1.5rem;"></i>
            </div>
            <div>
              <div class="text-cream fw-600">Activity Logs</div>
              <div class="text-muted" style="font-size:.83rem;">Track all system actions, entity changes, and audit trail</div>
            </div>
            <i class="bi bi-arrow-right text-muted ms-auto"></i>
          </RouterLink>
        </div>
        <div class="col-md-6">
          <RouterLink to="/products" class="card p-4 d-flex flex-row align-items-center gap-3 card-hover text-decoration-none">
            <div style="width:52px;height:52px;border-radius:1rem;background:rgba(46,204,113,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="bi bi-box-seam" style="font-size:1.5rem;color:#2ecc71;"></i>
            </div>
            <div>
              <div class="text-cream fw-600">Products</div>
              <div class="text-muted" style="font-size:.83rem;">Browse and manage all marketplace listings</div>
            </div>
            <i class="bi bi-arrow-right text-muted ms-auto"></i>
          </RouterLink>
        </div>
        <div class="col-md-6">
          <RouterLink to="/payments" class="card p-4 d-flex flex-row align-items-center gap-3 card-hover text-decoration-none">
            <div style="width:52px;height:52px;border-radius:1rem;background:rgba(155,89,182,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="bi bi-credit-card" style="font-size:1.5rem;color:#9b59b6;"></i>
            </div>
            <div>
              <div class="text-cream fw-600">Payments</div>
              <div class="text-muted" style="font-size:.83rem;">Review all payment transactions and statuses</div>
            </div>
            <i class="bi bi-arrow-right text-muted ms-auto"></i>
          </RouterLink>
        </div>
      </div>

      <!-- Recent users -->
      <div class="card p-0 overflow-hidden">
        <div class="card-header px-4 py-3 d-flex align-items-center justify-content-between">
          <h6 class="text-cream mb-0">Recent Users</h6>
          <RouterLink class="btn btn-outline-gold btn-sm" to="/admin/users">View All</RouterLink>
        </div>
        <LoadingSpinner v-if="usersLoading" height="160px" />
        <div class="table-responsive" v-else>
          <table class="table mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in recentUsers" :key="user.id">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--gold-dark),var(--gold));display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:700;color:var(--navy);flex-shrink:0;">
                      {{ (user.name||'U')[0].toUpperCase() }}
                    </div>
                    <span class="text-cream" style="font-size:.88rem;">{{ user.name }}</span>
                  </div>
                </td>
                <td class="text-muted" style="font-size:.85rem;">{{ user.email }}</td>
                <td><span class="badge" :class="roleBadge(user.role)">{{ user.role || 'user' }}</span></td>
                <td class="text-muted" style="font-size:.82rem;">{{ formatDate(user.created_at) }}</td>
                <td>
                  <RouterLink :to="`/admin/users`" class="btn btn-sm btn-outline-gold px-2 py-1">
                    <i class="bi bi-arrow-right"></i>
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { userService, productService, orderService } from '@/services/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const recentUsers = ref([])
const usersLoading = ref(true)
const counts = ref({ users: 0, products: 0, orders: 0, revenue: 0 })
const countsLoading = ref(true)

const kpis = computed(() => [
  { label: 'Total Users',    value: counts.value.users,    icon: 'bi bi-people-fill',    color: '#3498db', bg: 'rgba(52,152,219,.1)',    sub: 'Registered accounts', loading: countsLoading.value },
  { label: 'Products',       value: counts.value.products,  icon: 'bi bi-box-seam-fill',  color: '#2ecc71', bg: 'rgba(46,204,113,.1)',    sub: 'Active listings', loading: countsLoading.value },
  { label: 'Orders',         value: counts.value.orders,    icon: 'bi bi-bag-check-fill', color: 'var(--gold)', bg: 'rgba(201,169,110,.1)', sub: 'All time', loading: countsLoading.value },
  { label: 'Revenue (EGP)',  value: formatPrice(counts.value.revenue), icon: 'bi bi-cash-coin', color: '#9b59b6', bg: 'rgba(155,89,182,.1)', sub: 'Total processed', loading: countsLoading.value },
])

function formatPrice(v) { return new Intl.NumberFormat('en-EG', { notation: 'compact', maximumFractionDigits: 1 }).format(v || 0) }
function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-EG', { month:'short', day:'numeric', year:'numeric' }) : '—' }
function roleBadge(role) {
  const m = { admin: 'bg-danger', seller: 'bg-warning text-dark', user: 'badge-gold' }
  return m[role] || 'badge-gold'
}

onMounted(async () => {
  try {
    const [usersRes, prodRes, ordersRes] = await Promise.all([
      userService.getAll({ per_page: 5, page: 1 }),
      productService.getAll({ per_page: 1 }),
      orderService.getAll({ per_page: 1 })
    ])
    recentUsers.value = usersRes.data?.data || usersRes.data || []
    counts.value = {
      users: usersRes.data?.total || recentUsers.value.length,
      products: prodRes.data?.total || 0,
      orders: ordersRes.data?.total || 0,
      revenue: 0
    }
  } catch (_) {} finally { usersLoading.value = false; countsLoading.value = false }
})
</script>
