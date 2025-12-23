<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-2xl z-10"
      >
        <h2 class="text-2xl font-bold">
          {{ isEdit ? t('admin.buildings.edit_building') : t('admin.buildings.add_building') }}
        </h2>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Name (Georgian) -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            {{ t('admin.buildings.form.name_ka') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name_ka"
            type="text"
            required
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            :placeholder="t('admin.buildings.form.name_ka')"
          />
        </div>

        <!-- Name (English) -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            {{ t('admin.buildings.form.name_en') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name_en"
            type="text"
            required
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            :placeholder="t('admin.buildings.form.name_en')"
          />
        </div>

        <!-- Name (Russian) -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            {{ t('admin.buildings.form.name_ru') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.name_ru"
            type="text"
            required
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            :placeholder="t('admin.buildings.form.name_ru')"
          />
        </div>

        <!-- Identifier -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            {{ t('admin.buildings.form.identifier') }}
          </label>
          <input
            v-model="form.identifier"
            type="text"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            :placeholder="t('admin.buildings.form.identifier')"
          />
        </div>

        <!-- Display Order -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            {{ t('admin.buildings.form.sort_order') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="form.sort_order"
            type="number"
            min="1"
            required
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="1"
          />
          <p class="text-xs text-slate-500 mt-1">{{ t('admin.buildings.form.sort_order_desc') }}</p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
          <p class="text-red-600 text-sm">{{ error }}</p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            :disabled="isSubmitting"
            class="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium disabled:opacity-50"
          >
            {{ t('admin.common.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {{ isSubmitting ? t('admin.common.loading') : isEdit ? t('admin.common.save') : t('admin.common.add') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBuildingsAdminStore } from '@/stores/admin/buildings'
import { useTranslations } from '@/composables/i18n/useTranslations'
import type { Building } from '@/types/apartments'

const { t } = useTranslations()

interface Props {
  building?: Building | null
  projectId: number | null
}

interface Emits {
  (e: 'close'): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const buildingsStore = useBuildingsAdminStore()

const isEdit = computed(() => !!props.building)

const form = ref({
  name_ka: '',
  name_en: '',
  name_ru: '',
  identifier: '',
  sort_order: 1,
})

const isSubmitting = ref(false)
const error = ref('')

onMounted(() => {
  if (props.building) {
    form.value = {
      name_ka: props.building.name_ka || props.building.name || '',
      name_en: props.building.name_en || '',
      name_ru: props.building.name_ru || '',
      identifier: props.building.identifier || '',
      sort_order: props.building.sort_order || 1,
    }
  }
})

async function handleSubmit() {
  if (!props.projectId) {
    error.value = t('admin.errors.validation_error')
    return
  }

  error.value = ''
  isSubmitting.value = true

  try {
    const payload = {
      name: {
        ka: form.value.name_ka,
        en: form.value.name_en || null,
        ru: form.value.name_ru || null,
      },
      identifier: form.value.identifier,
      sort_order: form.value.sort_order,
    }

    if (isEdit.value && props.building) {
      await buildingsStore.updateBuilding(props.projectId, props.building.id, payload)
    } else {
      await buildingsStore.createBuilding(props.projectId, payload)
    }
    emit('saved')
  } catch (err: unknown) {
    const apiError = err as { response?: { data?: { message?: string } }; message?: string }
    error.value = apiError.response?.data?.message || apiError.message || t('admin.errors.unknown_error')
  } finally {
    isSubmitting.value = false
  }
}
</script>
