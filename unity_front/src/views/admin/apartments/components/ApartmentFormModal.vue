<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-t-2xl z-10"
      >
        <h2 class="text-2xl font-bold">
          {{ isEdit ? t('admin.apartments.edit_apartment') : t('admin.apartments.add_apartment') }}
        </h2>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Building Selection -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            {{ t('admin.apartments.form.building') }} <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.building_id"
            required
            :disabled="isEdit"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 text-gray-900"
          >
            <option :value="null">-- {{ t('admin.apartments.form.building') }} --</option>
            <option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </option>
          </select>
        </div>

        <!-- Floor Number -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            {{ t('admin.apartments.form.floor') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="form.floor_number"
            type="number"
            required
            min="1"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
            :placeholder="t('admin.apartments.form.floor')"
          />
        </div>

        <!-- Apartment Number -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            {{ t('admin.apartments.form.number') }} <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.apartment_number"
            type="text"
            required
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
            :placeholder="t('admin.apartments.form.number')"
          />
        </div>

        <!-- Cadastral Code -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            {{ t('admin.apartments.form.cadastral_code') }}
          </label>
          <input
            v-model="form.cadastral_code"
            type="text"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
            :placeholder="t('admin.apartments.form.cadastral_code')"
          />
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            {{ t('admin.common.status') }} <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.status"
            required
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
          >
            <option value="available">{{ t('status.available') }}</option>
            <option value="reserved">{{ t('status.reserved') }}</option>
            <option value="sold">{{ t('status.sold') }}</option>
          </select>
        </div>

        <!-- Price -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('admin.apartments.form.price') }}</label>
          <input
            v-model.number="form.price"
            type="number"
            step="0.01"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
            :placeholder="t('admin.apartments.form.price')"
          />
        </div>

        <!-- Areas Row -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              {{ t('admin.apartments.form.area_total') }}
            </label>
            <input
              v-model.number="form.area_total"
              type="number"
              step="0.01"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
              placeholder="75.5"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              {{ t('admin.apartments.form.area_living') }}
            </label>
            <input
              v-model.number="form.area_living"
              type="number"
              step="0.01"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
              placeholder="65.5"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              {{ t('admin.apartments.form.summer_area') }}
            </label>
            <input
              v-model.number="form.summer_area"
              type="number"
              step="0.01"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
              placeholder="14.40"
            />
            <small class="text-sm text-slate-500">{{ t('admin.apartments.form.summer_area_desc') }}</small>
          </div>
        </div>

        <!-- Rooms Row -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('admin.apartments.form.rooms') }}</label>
            <input
              v-model.number="form.bedrooms"
              type="number"
              min="0"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
              placeholder="2"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">{{ t('admin.apartments.form.bathrooms') }}</label>
            <input
              v-model.number="form.bathrooms"
              type="number"
              min="0"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
              placeholder="1"
            />
          </div>
        </div>

        <!-- Amenities -->
        <div class="grid grid-cols-2 gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.has_balcony" type="checkbox" class="w-5 h-5 text-emerald-600" />
            <span class="text-sm font-medium text-slate-700">{{ t('admin.apartments.form.has_balcony') }}</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.is_parking" type="checkbox" class="w-5 h-5 text-emerald-600" />
            <span class="text-sm font-medium text-slate-700">{{ t('admin.apartments.form.is_parking') }}</span>
          </label>
        </div>

        <!-- Room Details (Editable) -->
        <div v-if="form.room_details" class="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <label class="block text-sm font-medium text-slate-700 mb-3">{{ t('admin.apartments.form.room_details') }}</label>
          <div class="space-y-4">
            <!-- Bedrooms -->
            <div v-if="form.room_details.bedrooms" class="bg-white p-4 rounded-lg">
              <strong class="text-slate-700 block mb-3">{{ t('admin.apartments.form.bedrooms') }}:</strong>
              <div class="space-y-2">
                <div v-for="(area, room) in form.room_details.bedrooms" :key="room" class="flex items-center gap-3">
                  <label class="text-sm text-slate-600 min-w-[120px]">{{ translateRoomName(room) }}:</label>
                  <input
                    v-model.number="form.room_details.bedrooms[room]"
                    type="number"
                    step="0.01"
                    class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    :placeholder="t('common.sqm')"
                  />
                  <span class="text-sm text-slate-500">{{ t('common.sqm') }}</span>
                </div>
              </div>
            </div>

            <!-- Bathrooms -->
            <div v-if="form.room_details.bathrooms" class="bg-white p-4 rounded-lg">
              <strong class="text-slate-700 block mb-3">{{ t('admin.apartments.form.bathrooms') }}:</strong>
              <div class="space-y-2">
                <div v-for="(area, room) in form.room_details.bathrooms" :key="room" class="flex items-center gap-3">
                  <label class="text-sm text-slate-600 min-w-[120px]">{{ translateRoomName(room) }}:</label>
                  <input
                    v-model.number="form.room_details.bathrooms[room]"
                    type="number"
                    step="0.01"
                    class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    :placeholder="t('common.sqm')"
                  />
                  <span class="text-sm text-slate-500">{{ t('common.sqm') }}</span>
                </div>
              </div>
            </div>

            <!-- Other Rooms -->
            <div v-if="form.room_details.other_rooms" class="bg-white p-4 rounded-lg">
              <strong class="text-slate-700 block mb-3">{{ t('admin.apartments.form.other_rooms') }}:</strong>
              <div class="space-y-2">
                <div v-for="(area, room) in form.room_details.other_rooms" :key="room" class="flex items-center gap-3">
                  <label class="text-sm text-slate-600 min-w-[120px]">{{ translateRoomName(room) }}:</label>
                  <input
                    v-model.number="form.room_details.other_rooms[room]"
                    type="number"
                    step="0.01"
                    class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
                    :placeholder="t('common.sqm')"
                  />
                  <span class="text-sm text-slate-500">{{ t('common.sqm') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Apartment Images Section (only in edit mode) -->
        <div v-if="isEdit" class="border border-slate-200 rounded-xl p-4 bg-slate-50">
          <label class="block text-sm font-medium text-slate-700 mb-3">{{ t('apartments.image_2d') }} / {{ t('apartments.image_3d') }}</label>
          
          <div class="grid grid-cols-2 gap-4">
            <!-- 2D Image -->
            <div>
              <label class="block text-xs text-slate-500 mb-2">{{ t('apartments.image_2d') }}</label>
              <div v-if="preview2d || props.apartment?.image_2d?.url" class="relative mb-2">
                <img 
                  :src="preview2d || props.apartment?.image_2d?.url" 
                  :alt="t('apartments.image_2d')"
                  class="w-full h-32 object-cover rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  @click="remove2d"
                  class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  :title="t('admin.common.delete')"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <input
                type="file"
                accept="image/*"
                @change="handle2dChange"
                class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>

            <!-- 3D Image -->
            <div>
              <label class="block text-xs text-slate-500 mb-2">{{ t('apartments.image_3d') }}</label>
              <div v-if="preview3d || props.apartment?.image_3d?.url" class="relative mb-2">
                <img 
                  :src="preview3d || props.apartment?.image_3d?.url" 
                  :alt="t('apartments.image_3d')"
                  class="w-full h-32 object-cover rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  @click="remove3d"
                  class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  :title="t('admin.common.delete')"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <input
                type="file"
                accept="image/*"
                @change="handle3dChange"
                class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>
          </div>
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
            :disabled="isSubmitting || !form.building_id"
            class="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {{ isSubmitting ? t('admin.common.loading') : isEdit ? t('admin.common.save') : t('admin.common.add') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useApartmentsAdminStore } from '@/stores/admin/apartments'
import { useToast } from '@/composables/ui/useToast'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { adminApartmentsApi } from '@/services/adminApartmentsApi'
import type { Apartment, Building, RoomDetails } from '@/types/apartments'

interface Props {
  apartment?: Apartment | null
  projectId: number | null
  buildings: Building[]
}

interface Emits {
  (e: 'close'): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const apartmentsStore = useApartmentsAdminStore()
const { success, error: showError } = useToast()
const { t } = useTranslations()

// Keyboard handler for ESC to close
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && !isSubmitting.value) {
    emit('close')
  }
}

// Format room name from snake_case to Title Case as fallback
function formatRoomName(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Translate room names
function translateRoomName(key: string): string {
  const translationKey = `apartments.rooms.${key}`
  const translated = t(translationKey)
  
  // If translation same as key, it means it's missing in locales
  if (translated === translationKey) {
    return formatRoomName(key)
  }
  
  return translated
}

const isEdit = computed(() => !!props.apartment)

const form = ref({
  building_id: null as number | null,
  floor_number: 1,
  apartment_number: '',
  cadastral_code: null as string | null,
  status: 'available' as 'available' | 'reserved' | 'sold',
  price: null as number | null,
  area_total: null as number | null,
  area_living: null as number | null,
  summer_area: null as number | null,
  bedrooms: null as number | null,
  bathrooms: null as number | null,
  room_details: null as RoomDetails | null,
  has_balcony: false,
  is_parking: false,
})

const isSubmitting = ref(false)
const error = ref('')

// Image upload state
const image2dFile = ref<File | null>(null)
const image3dFile = ref<File | null>(null)
const preview2d = ref<string | null>(null)
const preview3d = ref<string | null>(null)

function handle2dChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    image2dFile.value = file
    preview2d.value = URL.createObjectURL(file)
  }
}

function handle3dChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    image3dFile.value = file
    preview3d.value = URL.createObjectURL(file)
  }
}

async function remove2d() {
  // If there's an existing image on the server, delete it
  if (props.apartment?.image_2d?.id) {
    try {
      await adminApartmentsApi.deleteImage(props.apartment.id, props.apartment.image_2d.id)
      success(t('admin.messages.delete_success'))
    } catch (err) {
      showError(t('admin.errors.delete_error'))
    }
  }
  // Clear local state
  image2dFile.value = null
  preview2d.value = null
}

async function remove3d() {
  // If there's an existing image on the server, delete it
  if (props.apartment?.image_3d?.id) {
    try {
      await adminApartmentsApi.deleteImage(props.apartment.id, props.apartment.image_3d.id)
      success(t('admin.messages.delete_success'))
    } catch (err) {
      showError(t('admin.errors.delete_error'))
    }
  }
  // Clear local state
  image3dFile.value = null
  preview3d.value = null
}

onMounted(() => {
  // Add keyboard listener for ESC
  window.addEventListener('keydown', handleKeydown)
  
  if (props.apartment) {
    form.value = {
      building_id: props.apartment.building_id,
      floor_number: props.apartment.floor_number,
      apartment_number: props.apartment.apartment_number,
      cadastral_code: props.apartment.cadastral_code || null,
      status: props.apartment.status,
      price: props.apartment.price,
      area_total: props.apartment.area_total,
      area_living: props.apartment.area_living,
      summer_area: props.apartment.summer_area || null,
      bedrooms: props.apartment.bedrooms,
      bathrooms: props.apartment.bathrooms,
      room_details: props.apartment.room_details || null,
      has_balcony: props.apartment.has_balcony,
      is_parking: props.apartment.is_parking,
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  // Clean up object URLs
  if (preview2d.value) URL.revokeObjectURL(preview2d.value)
  if (preview3d.value) URL.revokeObjectURL(preview3d.value)
})

async function handleSubmit() {
  if (!props.projectId || !form.value.building_id) {
    const errorMsg = t('admin.errors.validation_error')
    error.value = errorMsg
    showError(errorMsg)
    return
  }

  error.value = ''
  isSubmitting.value = true

  try {
    const payload = {
      floor_number: form.value.floor_number,
      apartment_number: form.value.apartment_number,
      cadastral_code: form.value.cadastral_code,
      status: form.value.status,
      price: form.value.price,
      area_total: form.value.area_total,
      area_living: form.value.area_living,
      summer_area: form.value.summer_area,
      bedrooms: form.value.bedrooms,
      bathrooms: form.value.bathrooms,
      room_details: form.value.room_details,
      has_balcony: form.value.has_balcony,
      has_parking: form.value.is_parking,
    }

    let apartmentId: number

    if (isEdit.value && props.apartment) {
      await apartmentsStore.updateApartment(props.apartment.id, payload)
      apartmentId = props.apartment.id
      success(t('admin.messages.update_success'))
    } else {
      const result = await apartmentsStore.createApartment(props.projectId, form.value.building_id, payload)
      apartmentId = result.data?.id || result.id
      success(t('admin.messages.create_success'))
    }

    // Upload images if any were selected
    if (image2dFile.value || image3dFile.value) {
      try {
        await adminApartmentsApi.uploadImages(apartmentId, image2dFile.value, image3dFile.value)
      } catch (err) {
        // Don't fail the whole operation if image upload fails
        console.error('Image upload failed:', err)
      }
    }

    emit('saved')
  } catch (err: unknown) {
    const apiError = err as { response?: { data?: { message?: string } }; message?: string }
    error.value = apiError.response?.data?.message || apiError.message || t('admin.errors.unknown_error')
    showError(error.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>
