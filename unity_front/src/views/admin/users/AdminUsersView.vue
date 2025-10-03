<template>
  <div>
    <div class="mb-8 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">მომხმარებლების მართვა</h1>
        <p class="mt-1 text-sm text-gray-600">
          შექმენით და მართეთ სისტემის მომხმარებლები
        </p>
      </div>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        ახალი მომხმარებელი
      </button>
    </div>

    <!-- Users Table -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p class="mt-2 text-gray-600">იტვირთება...</p>
      </div>

      <div v-else-if="users.length === 0" class="p-8 text-center">
        <p class="text-gray-600">მომხმარებლები არ არის</p>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              სახელი
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ელ. ფოსტა
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              როლი
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              შეკვრის თარიღი
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              მოქმედებები
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-600">{{ user.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                :class="getRoleBadgeClass(user.role)"
              >
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {{ formatDate(user.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="editUser(user)"
                class="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                რედაქტირება
              </button>
              <button
                @click="confirmDelete(user)"
                class="text-red-600 hover:text-red-900"
              >
                წაშლა
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed z-10 inset-0 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="submitForm">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                {{ showEditModal ? 'მომხმარებლის რედაქტირება' : 'ახალი მომხმარებელი' }}
              </h3>

              <!-- Name -->
              <div class="mb-4">
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">სახელი</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <!-- Email -->
              <div class="mb-4">
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">ელ. ფოსტა</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <!-- Password -->
              <div class="mb-4">
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                  პაროლი {{ showEditModal ? '(დატოვეთ ცარიელი არ შეცვლის შემთხვევაში)' : '' }}
                </label>
                <input
                  id="password"
                  v-model="form.password"
                  type="password"
                  :required="!showEditModal"
                  :minlength="8"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <!-- Role -->
              <div class="mb-4">
                <label for="role" class="block text-sm font-medium text-gray-700 mb-1">როლი</label>
                <select
                  id="role"
                  v-model="form.role_id"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">აირჩიეთ როლი</option>
                  <option v-for="role in roles" :key="role.id" :value="role.id">
                    {{ getRoleLabel(role.name) }}
                  </option>
                </select>
              </div>

              <div v-if="formError" class="mb-4 text-sm text-red-600">
                {{ formError }}
              </div>
            </div>

            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                :disabled="submitting"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {{ submitting ? 'იტვირთება...' : (showEditModal ? 'შენახვა' : 'შექმნა') }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                გაუქმება
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed z-10 inset-0 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showDeleteModal = false"></div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">მომხმარებლის წაშლა</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-600">
                    დარწმუნებული ხართ, რომ გსურთ მომხმარებლის <strong>{{ userToDelete?.name }}</strong> წაშლა?
                    ეს მოქმედება შეუქცევადია.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="deleteUserConfirmed"
              :disabled="deleting"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {{ deleting ? 'იშლება...' : 'წაშლა' }}
            </button>
            <button
              @click="showDeleteModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              გაუქმება
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div
      v-if="showToast"
      class="fixed bottom-4 right-4 rounded-lg shadow-lg p-4 max-w-sm transition-opacity duration-300"
      :class="toastType === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'"
    >
      <div class="flex items-center">
        <svg v-if="toastType === 'success'" class="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="h-5 w-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span class="text-sm font-medium" :class="toastType === 'success' ? 'text-green-900' : 'text-red-900'">
          {{ toastMessage }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userApi, type User, type Role } from '@/services/userApi'

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

const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const form = ref({
  name: '',
  email: '',
  password: '',
  role_id: '',
})

const loadUsers = async () => {
  try {
    loading.value = true
    const response = await userApi.getUsers()
    users.value = response.data
  } catch (error: any) {
    console.error('Error loading users:', error)
    showToastMessage('მომხმარებლების ჩატვირთვა ვერ მოხერხდა', 'error')
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    const response = await userApi.getRoles()
    roles.value = response.data
  } catch (error: any) {
    console.error('Error loading roles:', error)
  }
}

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

    const data: any = {
      name: form.value.name,
      email: form.value.email,
      role_id: Number(form.value.role_id),
    }

    if (form.value.password) {
      data.password = form.value.password
    }

    if (showEditModal.value && editingUser.value) {
      await userApi.updateUser(editingUser.value.id, data)
      showToastMessage('მომხმარებელი წარმატებით განახლდა', 'success')
    } else {
      await userApi.createUser(data)
      showToastMessage('მომხმარებელი წარმატებით შეიქმნა', 'success')
    }

    closeModal()
    loadUsers()
  } catch (error: any) {
    console.error('Error submitting form:', error)
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
  } catch (error: any) {
    console.error('Error deleting user:', error)
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

onMounted(() => {
  loadUsers()
  loadRoles()
})
</script>
