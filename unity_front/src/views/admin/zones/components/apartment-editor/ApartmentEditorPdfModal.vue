<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in">
      <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-red-100 rounded-lg">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900">PDF-ით ბინების გამოვლენა</h2>
              <p class="text-sm text-gray-500 mt-1">ატვირთეთ PDF წითელი ხაზებით ბინების ავტომატური გამოვლენისთვის</p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="p-6 space-y-6">
        <!-- Source PDF Upload -->
        <div>
          <label class="flex items-center text-sm font-medium text-gray-900 mb-3">
            <svg class="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            PDF წითელი ხაზებით (საჭირო)
          </label>
          <div
            class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer group"
            @drop.prevent="handlePdfDrop"
            @dragover.prevent
            @click="triggerPdfInput"
          >
            <input
              ref="pdfInput"
              type="file"
              accept=".pdf"
              class="hidden"
              @change="handlePdfChange"
            />
            <svg
              class="mx-auto h-12 w-12 text-red-400 group-hover:text-red-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p class="text-sm text-gray-700 mt-2">
              <span class="font-semibold text-red-600">აირჩიეთ PDF</span>
              <span class="text-gray-500"> ან გადმოიტანეთ</span>
            </p>
            <p class="text-xs text-gray-500 mt-1">მხოლოდ PDF ფორმატი</p>
          </div>
          <div v-if="pdfFile" class="mt-2 flex items-center justify-between text-sm bg-red-50 p-2 rounded-lg">
            <span class="text-gray-700 font-medium">{{ pdfFile.name }}</span>
            <button @click="clearPdfFile" class="text-red-600 hover:text-red-700">წაშლა</button>
          </div>
        </div>

        <!-- Target Image Upload -->
        <div>
          <label class="flex items-center text-sm font-medium text-gray-900 mb-3">
            <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            სუფთა სურათი (არასავალდებულო)
          </label>
          <p class="text-xs text-gray-500 mb-3">
            თუ გაქვთ იგივე გეგმა სუფთა ფორმატში (ხაზების გარეშე), ატვირთეთ აქ. პოლიგონები დალაგდება ამ სურათზე.
          </p>
          <div
            class="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 cursor-pointer group"
            @drop.prevent="handleTargetImageDrop"
            @dragover.prevent
            @click="triggerTargetInput"
          >
            <input
              ref="targetInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleTargetImageChange"
            />
            <svg
              class="mx-auto h-12 w-12 text-blue-400 group-hover:text-blue-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p class="text-sm text-gray-700 mt-2">
              <span class="font-semibold text-blue-600">აირჩიეთ სურათი</span>
              <span class="text-gray-500"> ან გადმოიტანეთ</span>
            </p>
            <p class="text-xs text-gray-500 mt-1">PNG, JPG, WebP</p>
          </div>
          <div v-if="targetImageFile" class="mt-2 flex items-center justify-between text-sm bg-blue-50 p-2 rounded-lg">
            <span class="text-gray-700 font-medium">{{ targetImageFile.name }}</span>
            <button @click="clearTargetImageFile" class="text-blue-600 hover:text-blue-700">წაშლა</button>
          </div>
        </div>

        <!-- Info Box -->
        <div class="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div class="flex items-start space-x-2">
            <svg class="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm text-amber-800">
              <p class="font-medium">როგორ მუშაობს?</p>
              <ul class="mt-1 list-disc list-inside text-xs space-y-1">
                <li>PDF-ში წითელი ხაზები განსაზღვრავენ ბინების საზღვრებს</li>
                <li>ალგორითმი ავტომატურად აღმოაჩენს ჩაკეტილ არეებს</li>
                <li>თუ სუფთა სურათი ატვირთულია, პოლიგონები გადატანილი იქნება მასზე</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="px-5 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white hover:border-gray-400 transition-all duration-200"
        >
          გაუქმება
        </button>
        <button
          @click="$emit('detect')"
          :disabled="!pdfFile || isPdfDetecting"
          class="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <svg
            v-if="isPdfDetecting"
            class="animate-spin h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>{{ isPdfDetecting ? 'გამოვლენა...' : 'გამოვლენა' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  show: boolean
  pdfFile: File | null
  targetImageFile: File | null
  isPdfDetecting: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'detect'): void
  (e: 'pdf-selected', file: File): void
  (e: 'target-image-selected', file: File): void
  (e: 'clear-pdf'): void
  (e: 'clear-target-image'): void
}>()

const pdfInput = ref<HTMLInputElement>()
const targetInput = ref<HTMLInputElement>()

function triggerPdfInput() {
  pdfInput.value?.click()
}

function triggerTargetInput() {
  targetInput.value?.click()
}

function handlePdfChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type === 'application/pdf') {
    emit('pdf-selected', file)
  }
}

function handlePdfDrop(event: DragEvent) {
  const file = event.dataTransfer?.files[0]
  if (file && file.type === 'application/pdf') {
    emit('pdf-selected', file)
  }
}

function clearPdfFile() {
  emit('clear-pdf')
  if (pdfInput.value) {
    pdfInput.value.value = ''
  }
}

function handleTargetImageChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file && file.type.startsWith('image/')) {
    emit('target-image-selected', file)
  }
}

function handleTargetImageDrop(event: DragEvent) {
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    emit('target-image-selected', file)
  }
}

function clearTargetImageFile() {
  emit('clear-target-image')
  if (targetInput.value) {
    targetInput.value.value = ''
  }
}
</script>
