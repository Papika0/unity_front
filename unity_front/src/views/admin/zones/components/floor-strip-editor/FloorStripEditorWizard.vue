<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">სართულების გენერაცია</h2>
            <p class="text-sm text-gray-500 mt-1">მონიშნული ზონის საფუძველზე</p>
          </div>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded transition-colors">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="p-6 space-y-4">
        <!-- Selected zone preview -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div class="flex items-center space-x-2">
            <div
              class="w-4 h-4 rounded border-2"
              :style="{ 
                backgroundColor: selectedZone?.fillColor || '#3b82f680', 
                borderColor: selectedZone?.strokeColor || '#3b82f6' 
              }"
            />
            <div>
              <p class="text-sm font-medium text-blue-900">
                შაბლონი: {{ selectedZone?.label || 'არჩეული ზონა' }}
              </p>
              <p class="text-xs text-blue-700">
                {{ selectedZone?.points?.length || 0 }} წერტილი
              </p>
            </div>
          </div>
        </div>

        <!-- Generation settings -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              საწყისი სართული
              <span class="text-xs text-gray-500">(ამ ზონისთვის)</span>
            </label>
            <input
              v-model.number="smartWizardData.startFloor"
              type="number"
              class="w-full border-gray-300 rounded text-gray-900"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              რაოდენობა
              <span class="text-xs text-gray-500">(მათ შორის საწყისი)</span>
            </label>
            <input
              v-model.number="smartWizardData.count"
              type="number"
              class="w-full border-gray-300 rounded text-gray-900"
              min="1"
              max="100"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            ვერტიკალური ინტერვალი (px)
          </label>
          <input
            v-model.number="smartWizardData.verticalSpacing"
            type="number"
            class="w-full border-gray-300 rounded text-gray-900"
            min="0"
          />
          <p class="text-xs text-gray-500 mt-1">
            მანძილი სართულებს შორის (ზემოთ ან ქვემოთ)
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">მიმართულება</label>
          <div class="flex space-x-2">
            <button
              @click="smartWizardData.direction = 'up'"
              class="flex-1 px-4 py-2 rounded-lg border-2 transition-colors"
              :class="smartWizardData.direction === 'up' 
                ? 'bg-purple-50 border-purple-500 text-purple-700' 
                : 'border-gray-300 text-gray-700 hover:border-gray-400'"
            >
              <svg class="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
              <span class="text-sm font-medium">ზემოთ</span>
            </button>
            <button
              @click="smartWizardData.direction = 'down'"
              class="flex-1 px-4 py-2 rounded-lg border-2 transition-colors"
              :class="smartWizardData.direction === 'down' 
                ? 'bg-purple-50 border-purple-500 text-purple-700' 
                : 'border-gray-300 text-gray-700 hover:border-gray-400'"
            >
              <svg class="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <span class="text-sm font-medium">ქვემოთ</span>
            </button>
          </div>
        </div>

        <!-- Preview info -->
        <div class="bg-green-50 border border-green-200 rounded-lg p-3">
          <p class="text-sm text-green-700">
            <strong>გენერირდება:</strong> {{ smartWizardData.count }} სართული
            <br/>
            <strong>ნომრები:</strong> 
            {{ smartWizardData.startFloor }} - 
            {{ smartWizardData.startFloor + smartWizardData.count - 1 }}
          </p>
        </div>
      </div>

      <div class="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          გაუქმება
        </button>
        <button
          @click="$emit('generate')"
          :disabled="!isValid"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          გენერაცია
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Polygon } from '@/utils/polygon'

interface WizardData {
  startFloor: number
  count: number
  verticalSpacing: number
  direction: 'up' | 'down'
}

defineProps<{
  show: boolean
  selectedZone: Polygon | undefined
  isValid: boolean
}>()

const smartWizardData = defineModel<WizardData>('smartWizardData', { required: true })

defineEmits<{
  (e: 'close'): void
  (e: 'generate'): void
}>()
</script>
