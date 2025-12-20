/**
 * useUsersList - Composable for managing users list
 * Handles CRUD operations, modals, and toast notifications
 */

import { ref, onMounted } from 'vue'
import { userApi, type User, type Role } from '@/services/userApi'

interface UserForm {
  name: string
  email: string
  password: string
  role_id: string
}

export function useUsersList() {
  // ============================================
  // STATE
  // ============================================
  const users = ref<User[]>([])
  const roles = ref<Role[]>([])
  const loading = ref(false)
  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)
  const submitting = ref(false)
  const deleting = ref(false)
  const formError = ref('')
  const userToDelete = ref<User | null>(null)
  const editingUser = ref<User | null>(null)

  // Toast state
  const showToast = ref(false)
  const toastMessage = ref('')
  const toastType = ref<'success' | 'error'>('success')

  const form = ref<UserForm>({
    name: '',
    email: '',
    password: '',
    role_id: '',
  })

  // ============================================
  // ACTIONS
  // ============================================
  const loadUsers = async () => {
    try {
      loading.value = true
      const response = await userApi.getUsers()
      users.value = response.data
    } catch (err: unknown) {
      console.error('Error loading users:', err)
      showToastMessage('მომხმარებლების ჩატვირთვა ვერ მოხერხდა', 'error')
    } finally {
      loading.value = false
    }
  }

  const loadRoles = async () => {
    try {
      const response = await userApi.getRoles()
      roles.value = response.data
    } catch (err: unknown) {
      console.error('Error loading roles:', err)
    }
  }

  const editUser = (user: User) => {
    editingUser.value = user
    form.value = {
      name: user.name,
      email: user.email,
      password: '',
      role_id: String(user.role_id),
    }
    showEditModal.value = true
  }

  const confirmDelete = (user: User) => {
    userToDelete.value = user
    showDeleteModal.value = true
  }

  const closeModal = () => {
    showCreateModal.value = false
    showEditModal.value = false
    formError.value = ''
    form.value = {
      name: '',
      email: '',
      password: '',
      role_id: '',
    }
    editingUser.value = null
  }

  const submitForm = async () => {
    try {
      submitting.value = true
      formError.value = ''

      if (showEditModal.value && editingUser.value) {
        const updateData: { name: string; email: string; role_id: number; password?: string } = {
          name: form.value.name,
          email: form.value.email,
          role_id: Number(form.value.role_id),
        }
        if (form.value.password) {
          updateData.password = form.value.password
        }
        await userApi.updateUser(editingUser.value.id, updateData)
        showToastMessage('მომხმარებელი წარმატებით განახლდა', 'success')
      } else {
        const createData = {
          name: form.value.name,
          email: form.value.email,
          role_id: Number(form.value.role_id),
          password: form.value.password,
        }
        await userApi.createUser(createData)
        showToastMessage('მომხმარებელი წარმატებით შეიქმნა', 'success')
      }

      closeModal()
      loadUsers()
    } catch (err: unknown) {
      console.error('Error submitting form:', err)
      const error = err as { response?: { data?: { message?: string } } }
      formError.value = error.response?.data?.message || 'შეცდომა მოხდა'
    } finally {
      submitting.value = false
    }
  }

  const deleteUserConfirmed = async () => {
    if (!userToDelete.value) return

    try {
      deleting.value = true
      await userApi.deleteUser(userToDelete.value.id)
      showToastMessage('მომხმარებელი წარმატებით წაიშალა', 'success')
      showDeleteModal.value = false
      userToDelete.value = null
      loadUsers()
    } catch (err: unknown) {
      console.error('Error deleting user:', err)
      const error = err as { response?: { data?: { message?: string } } }
      showToastMessage(error.response?.data?.message || 'წაშლა ვერ მოხერხდა', 'error')
    } finally {
      deleting.value = false
    }
  }

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    toastMessage.value = message
    toastType.value = type
    showToast.value = true

    setTimeout(() => {
      showToast.value = false
    }, 3000)
  }

  // ============================================
  // HELPERS
  // ============================================
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'ადმინისტრატორი',
      marketing: 'მარკეტინგი',
      editor: 'რედაქტორი',
    }
    return labels[role] || role
  }

  const getRoleBadgeClass = (role: string) => {
    const classes: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      marketing: 'bg-blue-100 text-blue-800',
      editor: 'bg-green-100 text-green-800',
    }
    return classes[role] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(() => {
    loadUsers()
    loadRoles()
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // State
    users,
    roles,
    loading,
    showCreateModal,
    showEditModal,
    showDeleteModal,
    submitting,
    deleting,
    formError,
    userToDelete,
    editingUser,
    form,
    showToast,
    toastMessage,
    toastType,
    
    // Actions
    loadUsers,
    loadRoles,
    editUser,
    confirmDelete,
    closeModal,
    submitForm,
    deleteUserConfirmed,
    showToastMessage,
    
    // Helpers
    getRoleLabel,
    getRoleBadgeClass,
    formatDate,
  }
}
