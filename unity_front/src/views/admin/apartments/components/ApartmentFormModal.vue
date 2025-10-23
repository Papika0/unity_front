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
          {{ isEdit ? 'ბინის რედაქტირება' : 'ახალი ბინის დამატება' }}
        </h2>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Building Selection -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            შენობა <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.building_id"
            required
            :disabled="isEdit"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50 text-gray-900"
          >
            <option :value="null">-- აირჩიეთ შენობა --</option>
            <option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </option>
          </select>
        </div>

        <!-- Floor Number -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            სართული <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="form.floor_number"
            type="number"
            required
            min="1"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
            placeholder="მაგ: 5"
          />
        </div>

        <!-- Apartment Number -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            ბინის ნომერი <span class="text-red-500">*</span>
          </label>
          <input
            v-model="form.apartment_number"
            type="text"
            required
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
            placeholder="მაგ: 501"
          />
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            სტატუსი <span class="text-red-500">*</span>
          </label>
          <select
            v-model="form.status"
            required
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
          >
            <option value="available">ხელმისაწვდომი</option>
            <option value="reserved">დაჯავშნილი</option>
            <option value="sold">გაყიდული</option>
          </select>
        </div>

        <!-- Price -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">ფასი (₾)</label>
          <input
            v-model.number="form.price"
            type="number"
            step="0.01"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
            placeholder="მაგ: 120000"
          />
        </div>

        <!-- Areas Row -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              მთლიანი ფართობი (მ²)
            </label>
            <input
              v-model.number="form.area_total"
              type="number"
              step="0.01"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
              placeholder="მაგ: 75.5"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              საცხოვრებელი ფართობი (მ²)
            </label>
            <input
              v-model.number="form.area_living"
              type="number"
              step="0.01"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
              placeholder="მაგ: 65.5"
            />
          </div>
        </div>

        <!-- Rooms Row -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">ოთახების რაოდენობა</label>
            <input
              v-model.number="form.bedrooms"
              type="number"
              min="0"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
              placeholder="მაგ: 2"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">სველი წერტილები</label>
            <input
              v-model.number="form.bathrooms"
              type="number"
              min="0"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
              placeholder="მაგ: 1"
            />
          </div>
        </div>

        <!-- Amenities -->
        <div class="grid grid-cols-2 gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.has_balcony" type="checkbox" class="w-5 h-5 text-emerald-600" />
            <span class="text-sm font-medium text-slate-700">აქვს აივანი</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input v-model="form.has_parking" type="checkbox" class="w-5 h-5 text-emerald-600" />
            <span class="text-sm font-medium text-slate-700">აქვს პარკინგი</span>
          </label>
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
            გაუქმება
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !form.building_id"
            class="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {{ isSubmitting ? 'იტვირთება...' : isEdit ? 'შენახვა' : 'დამატება' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApartmentsAdminStore } from '@/stores/admin/apartments'
import type { Apartment, Building } from '@/types/apartments'

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

const isEdit = computed(() => !!props.apartment)

const form = ref({
  building_id: null as number | null,
  floor_number: 1,
  apartment_number: '',
  status: 'available' as 'available' | 'reserved' | 'sold',
  price: null as number | null,
  area_total: null as number | null,
  area_living: null as number | null,
  bedrooms: null as number | null,
  bathrooms: null as number | null,
  has_balcony: false,
  has_parking: false,
})

const isSubmitting = ref(false)
const error = ref('')

onMounted(() => {
  if (props.apartment) {
    form.value = {
      building_id: props.apartment.building_id,
      floor_number: props.apartment.floor_number,
      apartment_number: props.apartment.apartment_number,
      status: props.apartment.status,
      price: props.apartment.price,
      area_total: props.apartment.area_total,
      area_living: props.apartment.area_living,
      bedrooms: props.apartment.bedrooms,
      bathrooms: props.apartment.bathrooms,
      has_balcony: props.apartment.has_balcony,
      has_parking: props.apartment.has_parking,
    }
  }
})

async function handleSubmit() {
  if (!props.projectId || !form.value.building_id) {
    error.value = 'პროექტი ან შენობა არ არის არჩეული'
    return
  }

  error.value = ''
  isSubmitting.value = true

  try {
    const payload = {
      floor_number: form.value.floor_number,
      apartment_number: form.value.apartment_number,
      status: form.value.status,
      price: form.value.price,
      area_total: form.value.area_total,
      area_living: form.value.area_living,
      bedrooms: form.value.bedrooms,
      bathrooms: form.value.bathrooms,
      has_balcony: form.value.has_balcony,
      has_parking: form.value.has_parking,
    }

    if (isEdit.value && props.apartment) {
      await apartmentsStore.updateApartment(props.apartment.id, payload)
    } else {
      await apartmentsStore.createApartment(props.projectId, form.value.building_id, payload)
    }
    emit('saved')
  } catch (err: unknown) {
    const apiError = err as { response?: { data?: { message?: string } }; message?: string }
    error.value = apiError.response?.data?.message || apiError.message || 'დაფიქსირდა შეცდომა'
  } finally {
    isSubmitting.value = false
  }
}
</script>
