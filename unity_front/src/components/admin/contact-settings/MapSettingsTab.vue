<template>
  <div v-if="store.data">
    <h3 class="text-3xl font-bold text-gray-800 mb-8 pb-4 relative">რუკის კონფიგურაცია</h3>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">
          განედი (Latitude) <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="store.data.map_settings.latitude"
          type="number"
          step="0.000001"
          placeholder="41.7151"
          @input="store.markDirty()"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">
          გრძედი (Longitude) <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="store.data.map_settings.longitude"
          type="number"
          step="0.000001"
          placeholder="44.8271"
          @input="store.markDirty()"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">ზუმის დონე</label>
        <input
          v-model.number="store.data.map_settings.zoom"
          type="number"
          min="1"
          max="20"
          placeholder="15"
          @input="store.markDirty()"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useContactSettingsAdminStore } from '@/stores/admin/contactSettings'

const store = useContactSettingsAdminStore()
</script>
