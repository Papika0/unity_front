<template>
  <div
    v-if="show"
    class="fixed z-10 inset-0 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="$emit('close')"></div>

      <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <form @submit.prevent="$emit('submit')">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              {{ isEdit ? 'მომხმარებლის რედაქტირება' : 'ახალი მომხმარებელი' }}
            </h3>

            <!-- Name -->
            <div class="mb-4">
              <label for="name" class="block text-sm font-medium text-gray-700 mb-1">სახელი</label>
              <input
                id="name"
                :value="form.name"
                @input="$emit('update:form', { ...form, name: ($event.target as HTMLInputElement).value })"
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
                :value="form.email"
                @input="$emit('update:form', { ...form, email: ($event.target as HTMLInputElement).value })"
                type="email"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <!-- Password -->
            <div class="mb-4">
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                პაროლი {{ isEdit ? '(დატოვეთ ცარიელი არ შეცვლის შემთხვევაში)' : '' }}
              </label>
              <input
                id="password"
                :value="form.password"
                @input="$emit('update:form', { ...form, password: ($event.target as HTMLInputElement).value })"
                type="password"
                :required="!isEdit"
                :minlength="8"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <!-- Role -->
            <div class="mb-4">
              <label for="role" class="block text-sm font-medium text-gray-700 mb-1">როლი</label>
              <select
                id="role"
                :value="form.role_id"
                @change="$emit('update:form', { ...form, role_id: ($event.target as HTMLSelectElement).value })"
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
              {{ submitting ? 'იტვირთება...' : (isEdit ? 'შენახვა' : 'შექმნა') }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              გაუქმება
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Role } from '@/services/userApi'

interface UserForm {
  name: string
  email: string
  password: string
  role_id: string
}

defineProps<{
  show: boolean
  isEdit: boolean
  form: UserForm
  roles: Role[]
  formError: string
  submitting: boolean
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
  (e: 'update:form', form: UserForm): void
}>()

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: 'ადმინისტრატორი',
    marketing: 'მარკეტინგი',
    editor: 'რედაქტორი',
  }
  return labels[role] || role
}
</script>
