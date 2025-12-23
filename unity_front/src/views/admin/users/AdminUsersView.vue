<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Header -->
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
    <UsersTable
      :users="users"
      :loading="loading"
      @edit="editUser"
      @delete="confirmDelete"
    />

    <!-- Create/Edit Modal -->
    <UserFormModal
      :show="showCreateModal || showEditModal"
      :is-edit="showEditModal"
      :form="form"
      :roles="roles"
      :form-error="formError"
      :submitting="submitting"
      @close="closeModal"
      @submit="submitForm"
      @update:form="form = $event"
    />

    <!-- Delete Confirmation Modal -->
    <UserDeleteModal
      :show="showDeleteModal"
      :user-name="userToDelete?.name || ''"
      :deleting="deleting"
      @close="showDeleteModal = false"
      @confirm="deleteUserConfirmed"
    />

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
import { UsersTable, UserFormModal, UserDeleteModal } from './components'
import { useUsersList } from './composables'

const {
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
  form,
  showToast,
  toastMessage,
  toastType,
  
  // Actions
  editUser,
  confirmDelete,
  closeModal,
  submitForm,
  deleteUserConfirmed,
} = useUsersList()
</script>
