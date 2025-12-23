<template>
  <div v-if="store.data">
    <h3 class="text-3xl font-bold text-gray-800 mb-8 pb-4 relative">{{ t('admin.contact_settings.fields.social_links_title') }}</h3>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">Facebook URL</label>
        <input
          v-model="store.data.social_links.facebook"
          type="url"
          placeholder="https://facebook.com/company"
          @input="store.markDirty()"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">Instagram URL</label>
        <input
          v-model="store.data.social_links.instagram"
          type="url"
          placeholder="https://instagram.com/company"
          @input="store.markDirty()"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useContactSettingsAdminStore } from '@/stores/admin/contactSettings'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t } = useTranslations()
const store = useContactSettingsAdminStore()
</script>
