<template>
  <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">ძიება</label>
        <input
          :value="search"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="ელ. ფოსტა ან სახელი..."
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900"
          @keyup.enter="$emit('apply')"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">სტატუსი</label>
        <select
          :value="active"
          @change="$emit('update:active', ($event.target as HTMLSelectElement).value)"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 bg-white"
        >
          <option v-for="option in activeFilterOptions" :key="option.value" :value="option.value">
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
defineProps<{
  search: string
  active: string
  activeFilterOptions: { value: string; label: string }[]
}>()

defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'update:active', value: string): void
  (e: 'apply'): void
  (e: 'reset'): void
}>()
</script>
