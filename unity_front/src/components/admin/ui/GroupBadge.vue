<template>
  <span :class="badgeClasses"> {{ getGroupIcon(group) }} {{ getGroupLabel(group) }} </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  group: string
}

const props = defineProps<Props>()

const groupConfig = {
  general: { icon: '🏠', label: 'ზოგადი', color: 'bg-slate-100 text-slate-800' },
  navigation: { icon: '🧭', label: 'ნავიგაცია', color: 'bg-blue-100 text-blue-800' },
  forms: { icon: '📝', label: 'ფორმები', color: 'bg-green-100 text-green-800' },
  buttons: { icon: '🔘', label: 'ღილაკები', color: 'bg-purple-100 text-purple-800' },
  messages: { icon: '💬', label: 'შეტყობინებები', color: 'bg-yellow-100 text-yellow-800' },
  errors: { icon: '⚠️', label: 'შეცდომები', color: 'bg-red-100 text-red-800' },
  admin: { icon: '👨‍💼', label: 'ადმინისტრაცია', color: 'bg-indigo-100 text-indigo-800' },
  projects: { icon: '🏗️', label: 'პროექტები', color: 'bg-orange-100 text-orange-800' },
  auth: { icon: '🔐', label: 'ავთენტიფიკაცია', color: 'bg-pink-100 text-pink-800' },
  testimonials: { icon: '💭', label: 'რეკომენდაციები', color: 'bg-teal-100 text-teal-800' },
}

const badgeClasses = computed(() => {
  const config = groupConfig[props.group as keyof typeof groupConfig] || groupConfig.general
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`
})

const getGroupIcon = (group: string) => {
  return groupConfig[group as keyof typeof groupConfig]?.icon || groupConfig.general.icon
}

const getGroupLabel = (group: string) => {
  return groupConfig[group as keyof typeof groupConfig]?.label || group
}
</script>
