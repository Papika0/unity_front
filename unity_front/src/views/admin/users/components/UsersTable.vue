<template>
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
              @click="$emit('edit', user)"
              class="text-indigo-600 hover:text-indigo-900 mr-4"
            >
              რედაქტირება
            </button>
            <button
              @click="$emit('delete', user)"
              class="text-red-600 hover:text-red-900"
            >
              წაშლა
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/services/userApi'

defineProps<{
  users: User[]
  loading: boolean
}>()

defineEmits<{
  (e: 'edit', user: User): void
  (e: 'delete', user: User): void
}>()

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
</script>
