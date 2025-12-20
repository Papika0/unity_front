<template>
  <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">ძიება</label>
        <input
          v-model="filters.search"
          type="text"
          placeholder="სახელი, ელ. ფოსტა, ტელეფონი..."
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900"
          @keyup.enter="$emit('apply')"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">სტატუსი</label>
        <select
          v-model="filters.status"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 bg-white"
        >
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">წყარო</label>
        <select
          v-model="filters.source"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 bg-white"
        >
          <option v-for="option in sourceOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="flex space-x-2 col-span-2">
        <button
          @click="$emit('apply')"
          class="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
        >
          ძიება
        </button>
        <button
          @click="$emit('reset')"
          class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
        >
          გასუფთავება
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{
  modelValue: {
    status: string
    source: string
    search: string
    date_from: string
    date_to: string
    per_page: number
    page: number
  }
}>()

const filters = props.modelValue

const statusOptions = [
  { value: 'all', label: 'ყველა' },
  { value: 'new', label: 'ახალი' },
  { value: 'contacted', label: 'დაკავშირებული' },
  { value: 'in_progress', label: 'მიმდინარე' },
  { value: 'completed', label: 'დასრულებული' },
  { value: 'cancelled', label: 'გაუქმებული' },
]

const sourceOptions = [
  { value: 'all', label: 'ყველა' },
  { value: 'contact_form', label: 'კონტაქტის ფორმა' },
  { value: 'call_request', label: 'ზარის მოთხოვნა' },
]

defineEmits<{
  (e: 'apply'): void
  (e: 'reset'): void
  (e: 'update:modelValue', value: typeof props.modelValue): void
}>()
</script>
