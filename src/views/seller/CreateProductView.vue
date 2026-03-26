<template>
  <div>
    <div class="page-header">
      <div class="container">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-2">
            <li class="breadcrumb-item"><RouterLink to="/">Home</RouterLink></li>
            <li class="breadcrumb-item"><RouterLink to="/seller/dashboard">My Listings</RouterLink></li>
            <li class="breadcrumb-item active">List a Product</li>
          </ol>
        </nav>
        <h1 class="text-cream mb-0"><i class="bi bi-plus-circle me-2 text-gold"></i>List a Product</h1>
      </div>
    </div>

    <div class="container py-4">
      <div class="row g-4">
        <div class="col-lg-8">
          <form @submit.prevent="onSubmit" novalidate>

            <!-- Basic Info -->
            <div class="card p-4 mb-4">
              <h5 class="text-cream mb-4"><span class="text-gold me-2">01.</span>Basic Information</h5>
              <div class="mb-3">
                <label class="form-label">Product Name <span class="text-danger">*</span></label>
                <input class="form-control" v-model="form.name" :class="{ 'is-invalid': errors.name }" placeholder="e.g. iPhone 14 Pro Max 256GB" maxlength="150" />
                <div class="invalid-feedback">{{ errors.name }}</div>
                <div class="text-muted mt-1" style="font-size:.75rem;">{{ form.name.length }}/150</div>
              </div>
              <div class="mb-3">
                <label class="form-label">Description <span class="text-danger">*</span></label>
                <textarea class="form-control" v-model="form.description" :class="{ 'is-invalid': errors.description }" rows="5" placeholder="Describe condition, features, included accessories..." maxlength="2000"></textarea>
                <div class="invalid-feedback">{{ errors.description }}</div>
                <div class="text-muted mt-1" style="font-size:.75rem;">{{ form.description.length }}/2000</div>
              </div>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Category <span class="text-danger">*</span></label>
                  <select class="form-select" v-model="form.category_id" :class="{ 'is-invalid': errors.category_id }">
                    <option value="">Select a category</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                  <div class="invalid-feedback">{{ errors.category_id }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Condition</label>
                  <select class="form-select" v-model="form.condition">
                    <option value="new">New</option>
                    <option value="like_new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Pricing & Stock -->
            <div class="card p-4 mb-4">
              <h5 class="text-cream mb-4"><span class="text-gold me-2">02.</span>Pricing & Inventory</h5>
              <div class="row g-3 mb-3">
                <div class="col-md-4">
                  <label class="form-label">Sale Price (EGP) <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text">EGP</span>
                    <input class="form-control" type="number" v-model="form.price" :class="{ 'is-invalid': errors.price }" min="0" step="0.01" placeholder="0.00" />
                  </div>
                  <div class="text-danger mt-1" style="font-size:.8rem;" v-if="errors.price">{{ errors.price }}</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Original Price (EGP)</label>
                  <div class="input-group">
                    <span class="input-group-text">EGP</span>
                    <input class="form-control" type="number" v-model="form.old_price" min="0" step="0.01" placeholder="Optional" />
                  </div>
                  <div class="text-muted mt-1" style="font-size:.75rem;">Shown as strikethrough</div>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Stock Qty <span class="text-danger">*</span></label>
                  <input class="form-control" type="number" v-model="form.stock" :class="{ 'is-invalid': errors.stock }" min="0" placeholder="0" />
                  <div class="invalid-feedback">{{ errors.stock }}</div>
                </div>
              </div>

              <hr class="divider-gold my-3" />
              <div class="form-check form-switch mb-3">
                <input class="form-check-input" type="checkbox" v-model="form.is_rentable" id="rentSwitch" style="width:2.5em;height:1.3em;" />
                <label class="form-check-label text-cream ms-2" for="rentSwitch">
                  <i class="bi bi-clock-history me-1 text-gold"></i> Also available for rent
                </label>
              </div>
              <Transition name="fade">
                <div class="row g-3" v-if="form.is_rentable">
                  <div class="col-md-4">
                    <label class="form-label">Daily Rental (EGP)</label>
                    <div class="input-group">
                      <span class="input-group-text">EGP</span>
                      <input class="form-control" type="number" v-model="form.daily_rental_price" :class="{ 'is-invalid': errors.daily_rental_price }" min="0" step="0.01" />
                    </div>
                    <div class="text-danger mt-1" style="font-size:.8rem;" v-if="errors.daily_rental_price">{{ errors.daily_rental_price }}</div>
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Min Rental Days</label>
                    <input class="form-control" type="number" v-model="form.min_rental_days" min="1" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Max Rental Days</label>
                    <input class="form-control" type="number" v-model="form.max_rental_days" min="1" />
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Images -->
            <div class="card p-4 mb-4">
              <h5 class="text-cream mb-4"><span class="text-gold me-2">03.</span>Product Images</h5>
              <ProductImageUpload ref="imageUploader" @update:files="imageFiles = $event" :max-images="8" />
            </div>

            <!-- Actions -->
            <div class="d-flex gap-3 flex-wrap">
              <button type="submit" class="btn btn-gold px-5 py-2" :disabled="loading">
                <span class="spinner-border spinner-border-sm me-2" v-if="loading"></span>
                <i class="bi bi-check2-circle me-2" v-else></i>
                {{ loading ? 'Publishing...' : 'Publish Product' }}
              </button>
              <button type="button" class="btn btn-outline-gold" @click="saveDraft" :disabled="loading">Save as Draft</button>
              <RouterLink to="/seller/dashboard" class="btn btn-link text-muted">Cancel</RouterLink>
            </div>
          </form>
        </div>

        <!-- Tips sidebar -->
        <div class="col-lg-4">
          <div class="card p-4 sticky-top" style="top:80px;">
            <h6 class="text-cream mb-3"><i class="bi bi-lightbulb text-gold me-2"></i>Tips for Selling Fast</h6>
            <div class="d-flex flex-column gap-3">
              <div v-for="tip in tips" :key="tip.t">
                <div class="text-cream" style="font-size:.85rem;font-weight:600;">{{ tip.t }}</div>
                <div class="text-muted" style="font-size:.78rem;margin-top:2px;">{{ tip.d }}</div>
              </div>
            </div>
            <hr class="divider-gold my-3" />
            <h6 class="text-cream mb-2" style="font-size:.82rem;text-transform:uppercase;letter-spacing:.06em;">Live Preview</h6>
            <div class="card overflow-hidden" style="border-radius:.75rem;">
              <div style="height:110px;background:var(--navy-light);overflow:hidden;display:flex;align-items:center;justify-content:center;">
                <img :src="previewImage" style="width:100%;height:100%;object-fit:cover;" v-if="previewImage" />
                <i class="bi bi-image text-muted fs-2" v-else></i>
              </div>
              <div class="p-2">
                <div class="text-cream text-truncate" style="font-size:.82rem;font-weight:600;">{{ form.name || 'Product Name' }}</div>
                <div class="text-gold" style="font-size:.9rem;font-weight:700;">{{ form.price ? `EGP ${Number(form.price).toLocaleString()}` : '---' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { categoryService, productService, imageService } from '@/services/api'
import { useToast } from 'vue-toastification'
import ProductImageUpload from '@/components/ui/ProductImageUpload.vue'

const router = useRouter()
const toast = useToast()
const categories = ref([])
const loading = ref(false)
const imageFiles = ref([])
const imageUploader = ref(null)

const form = reactive({
  name: '', description: '', category_id: '', condition: 'new',
  price: '', old_price: '', stock: 1,
  is_rentable: false, daily_rental_price: '', min_rental_days: 1, max_rental_days: 30
})

const errors = reactive({ name: '', description: '', category_id: '', price: '', stock: '', daily_rental_price: '' })

const previewImage = computed(() => imageUploader.value?.previews?.[0]?.url || null)

const tips = [
  { t: '📸 Photos sell products', d: 'Use good lighting & multiple angles. First photo is the hero image.' },
  { t: '✏️ Specific titles rank higher', d: 'Include brand, model, size, and color.' },
  { t: '💰 Competitive pricing wins', d: 'Check similar listings to find the sweet spot.' },
  { t: '📋 Full descriptions build trust', d: 'Mention condition, defects, what\'s included.' }
]

function validate() {
  Object.keys(errors).forEach(k => errors[k] = '')
  let ok = true
  if (!form.name.trim()) { errors.name = 'Required'; ok = false }
  if (!form.description.trim()) { errors.description = 'Required'; ok = false }
  if (!form.category_id) { errors.category_id = 'Required'; ok = false }
  if (!form.price || Number(form.price) <= 0) { errors.price = 'Enter a valid price'; ok = false }
  if (form.stock === '' || Number(form.stock) < 0) { errors.stock = 'Enter stock quantity'; ok = false }
  if (form.is_rentable && Number(form.daily_rental_price) <= 0) { errors.daily_rental_price = 'Enter daily price'; ok = false }
  return ok
}

async function submit(draft = false) {
  if (!draft && !validate()) { toast.error('Please fix the highlighted errors'); return }
  loading.value = true
  try {
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v) })
    if (draft) fd.set('status', 'draft')
    const res = await productService.create(fd)
    const productId = (res.data?.data || res.data)?.id

    if (imageFiles.value.length > 0 && productId) {
      const imgFd = new FormData()
      imageFiles.value.forEach(f => imgFd.append('images[]', f))
      await imageService.upload(productId, imgFd).catch(() => toast.info('Product saved but image upload failed'))
    }
    toast.success(draft ? 'Draft saved!' : 'Product published! 🎉')
    router.push('/seller/dashboard')
  } catch (e) {
    const errs = e.response?.data?.errors || {}
    Object.assign(errors, Object.fromEntries(Object.entries(errs).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])))
    toast.error(e.response?.data?.message || 'Failed to publish')
  } finally { loading.value = false }
}

const onSubmit = () => submit(false)
const saveDraft = () => submit(true)

onMounted(async () => {
  const res = await categoryService.getAll().catch(() => ({ data: [] }))
  categories.value = res.data?.data || res.data || []
})
</script>
