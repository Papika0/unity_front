/**
 * useMarketingEmails - Composable for managing marketing emails list
 * Handles CRUD operations, filtering, and pagination
 */

import { ref, onMounted } from 'vue'
import { adminMarketingEmailApi, type MarketingEmail, type MarketingEmailFormData } from '@/services/adminMarketingEmailApi'
import { useToastStore } from '@/stores/ui/toast'

interface EmailFilters {
  active: string
  search: string
  per_page: number
  page: number
}

interface Pagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export function useMarketingEmails() {
  // ============================================
  // STORES
  // ============================================
  const toastStore = useToastStore()

  // ============================================
  // STATE
  // ============================================
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

  const filters = ref<EmailFilters>({
    active: 'all',
    search: '',
    per_page: 15,
    page: 1,
  })

  const pagination = ref<Pagination>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  })

  const activeFilterOptions = [
    { value: 'all', label: 'ყველა' },
    { value: 'true', label: 'აქტიური' },
    { value: 'false', label: 'არააქტიური' },
  ]

  // ============================================
  // ACTIONS
  // ============================================
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
    } catch (err: unknown) {
      console.error('Failed to save email:', err)
      const error = err as { response?: { data?: { message?: string } } }
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

  // ============================================
  // HELPERS
  // ============================================
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ka-GE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(() => {
    loadEmails()
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // State
    emails,
    loading,
    showModal,
    editingEmail,
    formData,
    filters,
    pagination,
    activeFilterOptions,

    // Actions
    loadEmails,
    openCreateModal,
    openEditModal,
    closeModal,
    saveEmail,
    toggleActive,
    deleteEmail,
    applyFilters,
    resetFilters,
    changePage,

    // Helpers
    formatDate,
  }
}
