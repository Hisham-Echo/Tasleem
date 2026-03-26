<template>
  <div>
    <div class="page-header">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-2">
            <li class="breadcrumb-item"><RouterLink to="/admin">Admin</RouterLink></li>
            <li class="breadcrumb-item active">Activity Logs</li>
          </ol>
        </nav>
        <h1 class="text-cream mb-0"><i class="bi bi-journal-code me-2 text-gold"></i>Activity Logs</h1>
      </div>
    </div>

    <div class="container py-4">
      <!-- Filters -->
      <div class="card p-3 mb-4">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <label class="form-label">Action Type</label>
            <select v-model="filters.action" class="form-select form-select-sm" @change="fetchLogs(1)">
              <option value="">All Actions</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Entity Type</label>
            <select v-model="filters.entity_type" class="form-select form-select-sm" @change="fetchLogs(1)">
              <option value="">All Entities</option>
              <option value="Product">Product</option>
              <option value="Order">Order</option>
              <option value="User">User</option>
              <option value="Rental">Rental</option>
              <option value="Payment">Payment</option>
              <option value="Review">Review</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Entity ID</label>
            <input v-model="filters.entity_id" type="number" class="form-control form-control-sm" placeholder="e.g. 42" @input="debouncedFetch" />
          </div>
          <div class="col-md-3">
            <label class="form-label">Status</label>
            <select v-model="filters.status" class="form-select form-select-sm" @change="fetchLogs(1)">
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div class="col-12">
            <button class="btn btn-outline-gold btn-sm" @click="resetFilters">
              <i class="bi bi-arrow-counterclockwise me-1"></i>Reset Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Log table -->
      <div class="card p-0 overflow-hidden">
        <div class="card-header px-4 py-3 d-flex align-items-center justify-content-between">
          <span class="text-cream">{{ total }} log{{ total !== 1 ? 's' : '' }}</span>
          <button class="btn btn-sm btn-outline-gold" @click="fetchLogs(1)">
            <i class="bi bi-arrow-clockwise me-1"></i>Refresh
          </button>
        </div>

        <LoadingSpinner v-if="loading" height="240px" />
        <div class="table-responsive" v-else>
          <table class="table mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Action</th>
                <th>Entity</th>
                <th>User</th>
                <th>Status</th>
                <th>IP</th>
                <th>Time</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="logs.length === 0">
                <td colspan="8" class="text-center text-muted py-5">No logs found</td>
              </tr>
              <tr v-for="log in logs" :key="log.id" :class="{'table-danger-subtle': log.status==='failed'}">
                <td class="text-muted" style="font-size:.78rem;">{{ log.id }}</td>
                <td>
                  <span class="badge" :class="actionBadge(log.action)">
                    <i :class="actionIcon(log.action)" class="me-1"></i>{{ log.action }}
                  </span>
                </td>
                <td>
                  <span class="text-cream" style="font-size:.85rem;">{{ log.entity_type || '—' }}</span>
                  <span class="text-muted ms-1" style="font-size:.78rem;" v-if="log.entity_id">#{{ log.entity_id }}</span>
                </td>
                <td>
                  <span class="text-muted" style="font-size:.82rem;">{{ log.user?.name || log.user_id || '—' }}</span>
                </td>
                <td>
                  <span class="badge" :class="log.status==='success' ? 'bg-success' : 'bg-danger'">{{ log.status || 'success' }}</span>
                </td>
                <td class="text-muted" style="font-size:.78rem;">{{ log.ip_address || '—' }}</td>
                <td class="text-muted" style="font-size:.78rem; white-space:nowrap;">{{ formatDate(log.created_at) }}</td>
                <td>
                  <button class="btn btn-sm btn-link text-muted p-0" @click="expandedLog = expandedLog === log.id ? null : log.id" title="Details">
                    <i class="bi" :class="expandedLog===log.id ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                  </button>
                </td>
              </tr>
              <!-- Expanded detail row -->
              <template v-for="log in logs" :key="'detail-'+log.id">
                <tr v-if="expandedLog === log.id">
                  <td colspan="8" style="background:var(--navy-light);padding:1rem;">
                    <div class="row g-3">
                      <div class="col-md-6" v-if="log.old_values">
                        <div class="text-muted mb-1" style="font-size:.75rem;text-transform:uppercase;letter-spacing:.07em;">Before</div>
                        <pre class="mb-0 text-cream" style="font-size:.75rem;background:var(--navy);padding:.75rem;border-radius:.5rem;overflow-x:auto;">{{ JSON.stringify(log.old_values, null, 2) }}</pre>
                      </div>
                      <div class="col-md-6" v-if="log.new_values">
                        <div class="text-muted mb-1" style="font-size:.75rem;text-transform:uppercase;letter-spacing:.07em;">After</div>
                        <pre class="mb-0 text-cream" style="font-size:.75rem;background:var(--navy);padding:.75rem;border-radius:.5rem;overflow-x:auto;">{{ JSON.stringify(log.new_values, null, 2) }}</pre>
                      </div>
                      <div class="col-12" v-if="!log.old_values && !log.new_values">
                        <span class="text-muted" style="font-size:.82rem;">No detail data available</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <div class="p-3">
          <Pagination :current-page="currentPage" :total-pages="totalPages" @change="fetchLogs" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { logService } from '@/services/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import Pagination from '@/components/ui/Pagination.vue'

const logs = ref([])
const loading = ref(true)
const total = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const expandedLog = ref(null)
const filters = reactive({ action: '', entity_type: '', entity_id: '', status: '' })

let debounceTimer = null
function debouncedFetch() { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => fetchLogs(1), 350) }
function resetFilters() { Object.assign(filters, { action:'', entity_type:'', entity_id:'', status:'' }); fetchLogs(1) }

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-EG', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
}

function actionBadge(action) {
  const m = { created:'bg-success', updated:'bg-info text-dark', deleted:'bg-danger', login:'badge-gold', logout:'bg-secondary' }
  return m[action] || 'bg-secondary'
}
function actionIcon(action) {
  const m = { created:'bi bi-plus-circle', updated:'bi bi-pencil', deleted:'bi bi-trash', login:'bi bi-box-arrow-in-right', logout:'bi bi-box-arrow-right' }
  return m[action] || 'bi bi-activity'
}

async function fetchLogs(page = 1) {
  loading.value = true
  expandedLog.value = null
  try {
    const params = { page, per_page: 20, action: filters.action||undefined, entity_type: filters.entity_type||undefined, entity_id: filters.entity_id||undefined, status: filters.status||undefined }
    const res = await logService.getAll(params)
    logs.value = res.data?.data || res.data || []
    total.value = res.data?.total || logs.value.length
    totalPages.value = res.data?.last_page || 1
    currentPage.value = page
  } catch (_) { logs.value = [] } finally { loading.value = false }
}

onMounted(() => fetchLogs())
</script>
