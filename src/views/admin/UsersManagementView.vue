<template>
  <div>
    <div class="page-header">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-2">
            <li class="breadcrumb-item"><RouterLink to="/admin">Admin</RouterLink></li>
            <li class="breadcrumb-item active">Users</li>
          </ol>
        </nav>
        <h1 class="text-cream mb-0"><i class="bi bi-people me-2 text-gold"></i>User Management</h1>
      </div>
    </div>

    <div class="container py-4">
      <!-- Filters -->
      <div class="card p-3 mb-4">
        <div class="row g-2 align-items-end">
          <div class="col-md-4">
            <label class="form-label">Search</label>
            <div class="input-group input-group-sm">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input v-model="filters.search" type="search" class="form-control" placeholder="Name or email..." @input="debouncedFetch" />
            </div>
          </div>
          <div class="col-md-3">
            <label class="form-label">Role</label>
            <select v-model="filters.role" class="form-select form-select-sm" @change="fetchUsers(1)">
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="seller">Seller</option>
              <option value="user">User</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label">Status</label>
            <select v-model="filters.status" class="form-select form-select-sm" @change="fetchUsers(1)">
              <option value="">All</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-gold btn-sm w-100" @click="resetFilters">
              <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card p-0 overflow-hidden">
        <div class="card-header px-4 py-3 d-flex align-items-center justify-content-between">
          <span class="text-cream">{{ total }} user{{ total !== 1 ? 's' : '' }}</span>
          <button class="btn btn-gold btn-sm" @click="showCreateModal = true">
            <i class="bi bi-person-plus me-1"></i>Add User
          </button>
        </div>
        <LoadingSpinner v-if="loading" height="200px" />
        <div class="table-responsive" v-else>
          <table class="table mb-0">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="users.length === 0">
                <td colspan="7" class="text-center text-muted py-4">No users found</td>
              </tr>
              <tr v-for="user in users" :key="user.id">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--gold-dark),var(--gold));display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;color:var(--navy);flex-shrink:0;">
                      {{ (user.name||'U')[0].toUpperCase() }}
                    </div>
                    <span class="text-cream" style="font-size:.88rem;">{{ user.name }}</span>
                  </div>
                </td>
                <td class="text-muted" style="font-size:.85rem;">{{ user.email }}</td>
                <td class="text-muted" style="font-size:.85rem;">{{ user.phone || '—' }}</td>
                <td>
                  <select class="form-select form-select-sm" style="width:110px;background:var(--navy-light);" :value="user.role" @change="updateRole(user, $event.target.value)">
                    <option value="user">User</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <i class="bi" :class="user.email_verified_at ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-danger'"></i>
                </td>
                <td class="text-muted" style="font-size:.82rem;">{{ formatDate(user.created_at) }}</td>
                <td>
                  <div class="d-flex gap-1">
                    <button class="btn btn-sm px-2 py-1" style="background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.25);color:#e74c3c;" @click="deleteUser(user)" title="Delete">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-3 py-2">
          <Pagination :current-page="currentPage" :total-pages="totalPages" @change="fetchUsers" />
        </div>
      </div>
    </div>

    <!-- Create User Modal -->
    <Transition name="fade">
      <div v-if="showCreateModal" class="modal-overlay" @click.self="showCreateModal=false">
        <div class="card p-4" style="max-width:460px;width:100%;border-radius:1.25rem;">
          <div class="d-flex align-items-center justify-content-between mb-4">
            <h5 class="text-cream mb-0">Create User</h5>
            <button class="btn-close btn-close-white" @click="showCreateModal=false"></button>
          </div>
          <form @submit.prevent="createUser" novalidate>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label">Full Name</label>
                <input v-model="newUser.name" class="form-control" placeholder="Ahmed Mohamed" />
              </div>
              <div class="col-12">
                <label class="form-label">Email</label>
                <input v-model="newUser.email" type="email" class="form-control" placeholder="ahmed@example.com" />
              </div>
              <div class="col-12">
                <label class="form-label">Phone</label>
                <input v-model="newUser.phone" class="form-control" placeholder="01234567890" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Role</label>
                <select v-model="newUser.role" class="form-select">
                  <option value="user">User</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Password</label>
                <input v-model="newUser.password" type="password" class="form-control" placeholder="Min 8 chars" />
              </div>
            </div>
            <div class="d-flex gap-2 mt-4">
              <button type="submit" class="btn btn-gold flex-grow-1" :disabled="createLoading">
                <span class="spinner-border spinner-border-sm me-2" v-if="createLoading"></span>
                Create User
              </button>
              <button type="button" class="btn btn-outline-gold" @click="showCreateModal=false">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { userService } from '@/services/api'
import { useToast } from 'vue-toastification'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import Pagination from '@/components/ui/Pagination.vue'

const toast = useToast()
const users = ref([])
const loading = ref(true)
const total = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const showCreateModal = ref(false)
const createLoading = ref(false)
const filters = reactive({ search: '', role: '', status: '' })
const newUser = reactive({ name: '', email: '', phone: '', role: 'user', password: '' })

let debounceTimer = null
function debouncedFetch() { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => fetchUsers(1), 350) }

function formatDate(d) { return d ? new Date(d).toLocaleDateString('en-EG', { month:'short', day:'numeric', year:'numeric' }) : '—' }
function resetFilters() { filters.search=''; filters.role=''; filters.status=''; fetchUsers(1) }

async function fetchUsers(page = 1) {
  loading.value = true
  try {
    const params = { page, per_page: 15, search: filters.search||undefined, role: filters.role||undefined, status: filters.status||undefined }
    const res = await userService.getAll(params)
    users.value = res.data?.data || res.data || []
    total.value = res.data?.total || users.value.length
    totalPages.value = res.data?.last_page || 1
    currentPage.value = page
  } catch (_) { users.value = [] } finally { loading.value = false }
}

async function updateRole(user, newRole) {
  try {
    await userService.update(user.id, { role: newRole })
    user.role = newRole
    toast.success(`Role updated to ${newRole}`)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to update role')
  }
}

async function deleteUser(user) {
  if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return
  try {
    await userService.delete(user.id)
    users.value = users.value.filter(u => u.id !== user.id)
    total.value--
    toast.success('User deleted')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Delete failed')
  }
}

async function createUser() {
  if (!newUser.name || !newUser.email || !newUser.password) { toast.error('Name, email and password are required'); return }
  createLoading.value = true
  try {
    await userService.create({ ...newUser, password_confirmation: newUser.password })
    toast.success('User created!')
    showCreateModal.value = false
    Object.assign(newUser, { name:'', email:'', phone:'', role:'user', password:'' })
    fetchUsers(1)
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to create user')
  } finally {
    createLoading.value = false
  }
}

onMounted(() => fetchUsers())
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 1060;
  background: rgba(0,0,0,.65);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  backdrop-filter: blur(4px);
}
</style>
