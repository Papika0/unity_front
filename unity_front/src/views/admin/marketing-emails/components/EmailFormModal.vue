<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click="$emit('close')"
      >
        <div
          class="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
          @click.stop
        >
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-slate-800">
              {{ isEdit ? 'ელ. ფოსტის რედაქტირება' : 'ახალი ელ. ფოსტა' }}
            </h3>
            <button
              @click="$emit('close')"
              class="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="$emit('save')" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">ელ. ფოსტა *</label>
              <input
                :value="formData.email"
                @input="updateField('email', ($event.target as HTMLInputElement).value)"
                type="email"
                required
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900"
                placeholder="example@unity.ge"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">სახელი</label>
              <input
                :value="formData.name"
                @input="updateField('name', ($event.target as HTMLInputElement).value)"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900"
                placeholder="მაგ: მარკეტინგის განყოფილება"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">აღწერა</label>
              <textarea
                :value="formData.description"
                @input="updateField('description', ($event.target as HTMLTextAreaElement).value)"
                rows="3"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-slate-900"
                placeholder="დამატებითი ინფორმაცია..."
              ></textarea>
            </div>

            <div class="flex items-center">
              <input
                :checked="formData.is_active"
                @change="updateField('is_active', ($event.target as HTMLInputElement).checked)"
                type="checkbox"
                id="is_active"
                class="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <label for="is_active" class="ml-2 text-sm text-slate-700">აქტიური</label>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="$emit('close')"
                class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                გაუქმება
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                {{ isEdit ? 'განახლება' : 'დამატება' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { MarketingEmailFormData } from '@/services/adminMarketingEmailApi'

const props = defineProps<{
  show: boolean
  isEdit: boolean
  formData: MarketingEmailFormData
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save'): void
  (e: 'update:formData', data: MarketingEmailFormData): void
}>()

const updateField = (field: keyof MarketingEmailFormData, value: string | boolean) => {
  emit('update:formData', { ...props.formData, [field]: value })
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.25s ease;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.9);
}
</style>
