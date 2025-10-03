<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminMarketingEmailApi, type MarketingEmail, type MarketingEmailFormData } from '@/services/adminMarketingEmailApi'
import { useToastStore } from '@/stores/ui/toast'

const toastStore = useToastStore()

const emails = ref<MarketingEmail[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingEmail = ref<MarketingEmail | null>(null)
const formData = ref<MarketingEmailFormData>({
  email: '',
  name: '',
  description: '',
  is_active: true,
})

// Filters
const filters = ref({
  active: 'all',
  search: '',
  per_page: 15,
  page: 1,
})

// Pagination
const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 15,
  total: 0,
})

const activeFilterOptions = [
  { value: 'all', label: 'ყველა' },
  { value: 'true', label: 'აქტიური' },
  { value: 'false', label: 'არააქტიური' },
]

const loadEmails = async () => {
  loading.value = true
  try {
    const response = await adminMarketingEmailApi.getAll(filters.value)
    emails.value = response.data
    pagination.value = response.meta
  } catch (error) {
    console.error('Failed to load emails:', error)
    toastStore.error('შეცდომა', 'ელ. ფოსტების ჩატვირთვა ვერ მოხერხდა')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingEmail.value = null
  formData.value = {
    email: '',
    name: '',
    description: '',
    is_active: true,
  }
  showModal.value = true
}

const openEditModal = (email: MarketingEmail) => {
  editingEmail.value = email
  formData.value = {
    email: email.email,
    name: email.name || '',
    description: email.description || '',
    is_active: email.is_active,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingEmail.value = null
  formData.value = {
    email: '',
    name: '',
    description: '',
    is_active: true,
  }
}

const saveEmail = async () => {
  try {
    if (editingEmail.value) {
      await adminMarketingEmailApi.update(editingEmail.value.id, formData.value)
      toastStore.success('წარმატება', 'ელ. ფოსტა განახლდა')
    } else {
      await adminMarketingEmailApi.create(formData.value)
      toastStore.success('წარმატება', 'ელ. ფოსტა დაემატა')
    }
    closeModal()
    await loadEmails()
  } catch (error: any) {
    console.error('Failed to save email:', error)
    toastStore.error('შეცდომა', error.response?.data?.message || 'ელ. ფოსტის შენახვა ვერ მოხერხდა')
  }
}

const toggleActive = async (email: MarketingEmail) => {
  try {
    await adminMarketingEmailApi.toggleActive(email.id)
    toastStore.success('წარმატება', 'სტატუსი შეიცვალა')
    await loadEmails()
  } catch (error) {
    console.error('Failed to toggle status:', error)
    toastStore.error('შეცდომა', 'სტატუსის შეცვლა ვერ მოხერხდა')
  }
}

const deleteEmail = async (id: number) => {
  if (!confirm('დარწმუნებული ხართ, რომ გსურთ ამ ელ. ფოსტის წაშლა?')) return

  try {
    await adminMarketingEmailApi.delete(id)
    toastStore.success('წარმატება', 'ელ. ფოსტა წაიშალა')
    await loadEmails()
  } catch (error) {
    console.error('Failed to delete email:', error)
    toastStore.error('შეცდომა', 'ელ. ფოსტის წაშლა ვერ მოხერხდა')
  }
}

const applyFilters = () => {
  filters.value.page = 1
  loadEmails()
}

const resetFilters = () => {
  filters.value = {
    active: 'all',
    search: '',
    per_page: 15,
    page: 1,
  }
  loadEmails()
}

const changePage = (page: number) => {
  filters.value.page = page
  loadEmails()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('ka-GE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(() => {
  loadEmails()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">მარკეტინგის ელ. ფოსტები</h1>
        <p class="text-sm text-slate-600 mt-1">ელ. ფოსტების მართვა, რომლებზეც მოდის შეტყობინებები</p>
      </div>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center space-x-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>დამატება</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">ძიება</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="ელ. ფოსტა ან სახელი..."
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900"
            @keyup.enter="applyFilters"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">სტატუსი</label>
          <select
            v-model="filters.active"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 bg-white"
          >
            <option v-for="option in activeFilterOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="flex space-x-2 col-span-2">
          <button
            @click="applyFilters"
            class="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
          >
            ძიება
          </button>
          <button
            @click="resetFilters"
            class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            გასუფთავება
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">ელ. ფოსტა</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">სახელი</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">აღწერა</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">სტატუსი</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">დამატების თარიღი</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">მოქმედებები</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-200">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500">იტვირთება...</td>
            </tr>
            <tr v-else-if="emails.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-500">ელ. ფოსტები არ მოიძებნა</td>
            </tr>
            <tr
              v-for="email in emails"
              :key="email.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-slate-900">{{ email.email }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-slate-900">{{ email.name || '-' }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-slate-500 max-w-xs truncate">{{ email.description || '-' }}</div>
              </td>
              <td class="px-6 py-4">
                <button
                  @click="toggleActive(email)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors"
                  :class="email.is_active
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-red-100 text-red-800 hover:bg-red-200'"
                >
                  {{ email.is_active ? 'აქტიური' : 'არააქტიური' }}
                </button>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">
                {{ formatDate(email.created_at) }}
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button
                  @click="openEditModal(email)"
                  class="text-blue-600 hover:text-blue-800 transition-colors"
                  title="რედაქტირება"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="deleteEmail(email.id)"
                  class="text-red-600 hover:text-red-800 transition-colors"
                  title="წაშლა"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="bg-slate-50 px-6 py-4 border-t border-slate-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-slate-700 font-medium">
            ნაჩვენებია {{ pagination.from }}-{{ pagination.to }} სულ {{ pagination.total }}-დან
          </div>
          <div class="flex space-x-2">
            <button
              :disabled="pagination.current_page === 1"
              @click="changePage(pagination.current_page - 1)"
              class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              წინა
            </button>
            <button
              :disabled="pagination.current_page === pagination.last_page"
              @click="changePage(pagination.current_page + 1)"
              class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              შემდეგი
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          @click="closeModal"
        >
          <div
            class="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
            @click.stop
          >
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-slate-800">
                {{ editingEmail ? 'ელ. ფოსტის რედაქტირება' : 'ახალი ელ. ფოსტა' }}
              </h3>
              <button
                @click="closeModal"
                class="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form @submit.prevent="saveEmail" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">ელ. ფოსტა *</label>
                <input
                  v-model="formData.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900"
                  placeholder="example@unity.ge"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">სახელი</label>
                <input
                  v-model="formData.name"
                  type="text"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900"
                  placeholder="მაგ: მარკეტინგის განყოფილება"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">აღწერა</label>
                <textarea
                  v-model="formData.description"
                  rows="3"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-slate-900"
                  placeholder="დამატებითი ინფორმაცია..."
                ></textarea>
              </div>

              <div class="flex items-center">
                <input
                  v-model="formData.is_active"
                  type="checkbox"
                  id="is_active"
                  class="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <label for="is_active" class="ml-2 text-sm text-slate-700">აქტიური</label>
              </div>

              <div class="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  @click="closeModal"
                  class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  {{ editingEmail ? 'განახლება' : 'დამატება' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.25s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9);
}
</style>
