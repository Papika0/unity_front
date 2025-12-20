<template>
  <div class="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
    <div class="flex items-center space-x-2">
      <!-- Mode Buttons -->
      <div class="flex bg-gray-100 rounded-lg p-1">
        <button
          @click="emit('update:mode', 'draw')"
          class="px-3 py-1.5 text-sm font-medium rounded transition-colors"
          :class="{
            'bg-white text-blue-600 shadow-sm': mode === 'draw',
            'text-gray-600 hover:text-gray-900': mode !== 'draw',
          }"
          title="დახატვის რეჟიმი"
        >
          ✏️ დახატვა
        </button>
        <button
          @click="emit('update:mode', 'edit')"
          class="px-3 py-1.5 text-sm font-medium rounded transition-colors"
          :class="{
            'bg-white text-blue-600 shadow-sm': mode === 'edit',
            'text-gray-600 hover:text-gray-900': mode !== 'edit',
          }"
          title="რედაქტირების რეჟიმი"
        >
          📝 რედაქტირება
        </button>
        <button
          @click="emit('update:mode', 'select')"
          class="px-3 py-1.5 text-sm font-medium rounded transition-colors"
          :class="{
            'bg-white text-blue-600 shadow-sm': mode === 'select',
            'text-gray-600 hover:text-gray-900': mode !== 'select',
          }"
          title="არჩევის რეჟიმი (Shift+გადატანა = პანორამა)"
        >
          👆 არჩევა
        </button>
        <button
          @click="emit('update:mode', 'pan')"
          class="px-3 py-1.5 text-sm font-medium rounded transition-colors"
          :class="{
            'bg-white text-blue-600 shadow-sm': mode === 'pan',
            'text-gray-600 hover:text-gray-900': mode !== 'pan',
          }"
          title="პანორამის რეჟიმი - სურათის გადატანა"
        >
          ✋ პანორამა
        </button>
      </div>

      <!-- Tool Buttons -->
      <div class="flex items-center space-x-1 ml-4">
        <button
          @click="emit('zoom-in')"
          class="p-2 hover:bg-gray-100 rounded"
          title="Zoom In (Ctrl + +)"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
            />
          </svg>
        </button>
        <button
          @click="emit('zoom-out')"
          class="p-2 hover:bg-gray-100 rounded"
          title="Zoom Out (Ctrl + -)"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
            />
          </svg>
        </button>
        <button
          @click="emit('zoom-reset')"
          class="p-2 hover:bg-gray-100 rounded"
          title="Reset Zoom (Ctrl + 0)"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div class="border-l border-gray-300 h-6 mx-2" />

      <!-- Grid Controls -->
      <label class="flex items-center space-x-2 text-sm">
        <input
          :checked="showGrid"
          @change="emit('update:showGrid', ($event.target as HTMLInputElement).checked)"
          type="checkbox"
          class="rounded"
        />
        <span class="text-gray-700">ბადე</span>
      </label>
      <label class="flex items-center space-x-2 text-sm">
        <input
          :checked="snapToGrid"
          @change="emit('update:snapToGrid', ($event.target as HTMLInputElement).checked)"
          type="checkbox"
          class="rounded"
        />
        <span class="text-gray-700">მიმაგრება ბადეზე</span>
      </label>
      <select
        :value="gridSize"
        @change="emit('update:gridSize', Number(($event.target as HTMLSelectElement).value))"
        class="text-sm border-gray-300 text-black rounded"
      >
        <option :value="10">10px</option>
        <option :value="20">20px</option>
        <option :value="50">50px</option>
      </select>
    </div>

    <div class="flex items-center space-x-2">
      <!-- Undo/Redo -->
      <button
        @click="emit('undo')"
        :disabled="canUndo === false"
        class="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        title="Undo (Ctrl + Z)"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
          />
        </svg>
      </button>
      <button
        @click="emit('redo')"
        :disabled="canRedo === false"
        class="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        title="Redo (Ctrl + Y)"
      >
        <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
          />
        </svg>
      </button>

      <span class="text-sm text-gray-500">{{ Math.round(zoom * 100) }}%</span>

      <!-- Pan hint -->
      <div class="ml-4 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg hidden lg:block">
        <span class="text-xs text-blue-700">
          💡 გადასატანად: ✋ პანორამა ღილაკი ან Shift + გადატანა
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  mode: 'draw' | 'edit' | 'select' | 'pan'
  zoom: number
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
  canUndo: boolean
  canRedo: boolean
}>()

const emit = defineEmits<{
  'update:mode': [mode: 'draw' | 'edit' | 'select' | 'pan']
  'update:showGrid': [value: boolean]
  'update:snapToGrid': [value: boolean]
  'update:gridSize': [value: number]
  'zoom-in': []
  'zoom-out': []
  'zoom-reset': []
  undo: []
  redo: []
}>()
</script>
