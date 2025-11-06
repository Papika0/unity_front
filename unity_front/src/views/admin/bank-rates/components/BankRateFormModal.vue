<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div
        class="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity"
        @click="closeModal"
      ></div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-6">
          <h3 class="text-2xl font-light text-white">
            {{ isEdit ? 'ბანკის რედაქტირება / Edit Bank' : 'ახალი ბანკი / Add Bank' }}
          </h3>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="p-8 space-y-6">
          <!-- Bank Name (Multi-language) -->
          <div class="space-y-4">
            <h4 class="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              ბანკის სახელი / Bank Name
            </h4>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                🇬🇪 ქართული / Georgian
              </label>
              <input
                v-model="form.bank_name_ka"
                type="text"
                required
                class="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900"
                placeholder="თიბისი ბანკი"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                🇬🇧 English
              </label>
              <input
                v-model="form.bank_name_en"
                type="text"
                required
                class="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900"
                placeholder="TBC Bank"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                🇷🇺 Русский / Russian
              </label>
              <input
                v-model="form.bank_name_ru"
                type="text"
                required
                class="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900"
                placeholder="TBC Банк"
              />
            </div>
          </div>

          <!-- Interest Rate -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              საპროცენტო განაკვეთი (%) / Interest Rate (%)
            </label>
            <input
              v-model.number="form.interest_rate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              required
              class="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900"
              placeholder="8.5"
            />
          </div>

          <!-- Loan Term Range -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                მინ. ვადა (წლები) / Min. Term (years)
              </label>
              <input
                v-model.number="form.min_loan_term_years"
                type="number"
                min="1"
                required
                class="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900"
                placeholder="1"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                მაქს. ვადა (წლები) / Max. Term (years)
              </label>
              <input
                v-model.number="form.max_loan_term_years"
                type="number"
                min="1"
                required
                class="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900"
                placeholder="20"
              />
            </div>
          </div>

          <!-- Min Down Payment -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              მინ. შენატანი (%) / Min. Down Payment (%)
            </label>
            <input
              v-model.number="form.min_down_payment_percent"
              type="number"
              min="0"
              max="100"
              required
              class="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900"
              placeholder="20"
            />
          </div>

          <!-- Active Status -->
          <div class="flex items-center">
            <input
              v-model="form.is_active"
              type="checkbox"
              id="is_active"
              class="w-5 h-5 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
            />
            <label for="is_active" class="ml-3 text-sm font-medium text-slate-700">
              აქტიური / Active
            </label>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-3 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all font-medium"
            >
              გაუქმება / Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              შენახვა / Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { BankRate, BankRateFormData } from '@/types/admin/calculator'

interface Props {
  modelValue: boolean
  bank?: BankRate | null
}

const props = withDefaults(defineProps<Props>(), {
  bank: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [data: BankRateFormData, bankId?: number]
}>()

const form = ref<BankRateFormData>({
  bank_name: '',
  bank_name_ka: '',
  bank_name_en: '',
  bank_name_ru: '',
  interest_rate: 0,
  min_loan_term_years: 1,
  max_loan_term_years: 20,
  min_down_payment_percent: 20,
  is_active: true,
})

const isEdit = ref(false)

const resetForm = () => {
  form.value = {
    bank_name: '',
    bank_name_ka: '',
    bank_name_en: '',
    bank_name_ru: '',
    interest_rate: 0,
    min_loan_term_years: 1,
    max_loan_term_years: 20,
    min_down_payment_percent: 20,
    is_active: true,
  }
}

// Watch for bank prop changes to populate form
watch(
  () => props.bank,
  (bank) => {
    if (bank) {
      isEdit.value = true
      form.value = {
        bank_name: bank.bank_name,
        bank_name_ka: bank.bank_name_ka,
        bank_name_en: bank.bank_name_en,
        bank_name_ru: bank.bank_name_ru,
        interest_rate: bank.interest_rate,
        min_loan_term_years: bank.min_loan_term_years,
        max_loan_term_years: bank.max_loan_term_years,
        min_down_payment_percent: bank.min_down_payment_percent,
        is_active: bank.is_active,
      }
    } else {
      isEdit.value = false
      resetForm()
    }
  },
  { immediate: true },
)

const closeModal = () => {
  emit('update:modelValue', false)
  setTimeout(resetForm, 300) // Delay reset for smooth close animation
}

const handleSubmit = () => {
  // Auto-fill bank_name from Georgian (ka) if not set, fallback to English
  if (!form.value.bank_name) {
    form.value.bank_name = form.value.bank_name_ka || form.value.bank_name_en
  }

  if (isEdit.value && props.bank) {
    emit('save', form.value, props.bank.id)
  } else {
    emit('save', form.value)
  }
}
</script>
