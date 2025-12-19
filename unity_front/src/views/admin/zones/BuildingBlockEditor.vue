<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="goBack"
            class="p-2 hover:bg-gray-100 rounded transition-colors"
            title="უკან დაბრუნება"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">შენობის ბლოკების რედაქტორი</h1>
            <p class="text-sm text-gray-500 mt-1">
              {{ selectedProject?.title || 'პროექტი' }} - ზონების ხატვა
            </p>
          </div>
          <ZoneEditorBreadcrumbs class="ml-4" />
        </div>

        <div class="flex items-center space-x-3">
          <!-- Phase 2: Unsaved Changes Badge -->
          <Transition name="fade">
            <div
              v-if="hasChanges && !isSaving"
              class="px-3 py-1 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg text-sm font-medium flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>შეუნახავი ცვლილებები</span>
            </div>
          </Transition>

          <!-- Phase 3: Last Draft Saved Indicator -->
          <div v-if="getLastSavedTime()" class="text-xs text-gray-500 flex items-center space-x-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>ბოლო დრაფტი: {{ getLastSavedTime() }}</span>
          </div>

          <!-- Phase 4: Keyboard Shortcut Hint -->
          <div class="text-xs text-gray-500 hidden lg:flex items-center space-x-1">
            <kbd class="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+S</kbd>
            <span>შენახვა</span>
          </div>

          <button
            @click="openImageUpload"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span class="hidden md:inline">სურათის ატვირთვა</span>
          </button>

          <!-- Phase 2: Discard Changes Button -->
          <button
            @click="handleDiscard"
            :disabled="!hasChanges || isSaving"
            class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            title="ცვლილებების გაუქმება და ბოლო შენახული მდგომარეობის აღდგენა"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="hidden md:inline">გაუქმება</span>
          </button>

          <button
            @click="saveZones"
            :disabled="!hasChanges || isSaving"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <svg
              v-if="!isSaving"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg
              v-else
              class="w-5 h-5 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span class="hidden md:inline">{{ isSaving ? 'შენახვა...' : 'შენახვა' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Project Selector Sidebar -->
      <div class="w-80 lg:w-72 xl:w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <!-- Project Selector -->
        <div class="p-6 border-b border-gray-200 bg-gradient-to-br from-indigo-50 to-white">
          <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <svg class="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            პროექტი
          </h3>
          <select
            v-model="selectedProjectId"
            @change="handleProjectChange"
            class="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          >
            <option value="">აირჩიეთ პროექტი</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.title }}
            </option>
          </select>
        </div>

        <!-- Buildings List -->
        <div v-if="selectedProjectId" class="flex-1 overflow-y-auto p-4">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900 flex items-center">
              <svg class="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              შენობები
            </h3>
            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {{ buildings.length }}
            </span>
          </div>
          
          <div v-if="isLoadingBuildings" class="text-center py-8">
            <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-sm text-gray-500 mt-2">იტვირთება...</p>
          </div>
          
          <div v-else-if="buildings.length === 0" class="text-center py-8">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p class="text-sm text-gray-500">არ არის შენობები</p>
          </div>
          
          <div v-else class="space-y-2">
            <div
              v-for="building in buildings"
              :key="building.id"
              @click="navigateToBuildingFloors(building.id)"
              class="p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-indigo-100 border border-gray-200 hover:border-indigo-300 transition-all duration-200 cursor-pointer group"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                    {{ building.name_ka || building.name }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1 flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    {{ building.identifier }}
                  </div>
                </div>
                <div class="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="p-4 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          <h4 class="text-xs font-semibold text-gray-900 uppercase mb-3 flex items-center">
            <svg class="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ინსტრუქციები
          </h4>
          <ol class="text-xs text-gray-700 space-y-2">
            <li class="flex items-start">
              <span class="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">1</span>
              <span>აირჩიეთ პროექტი</span>
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">2</span>
              <span>ატვირთეთ ზონის სურათი</span>
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">3</span>
              <span>დახატეთ შენობის ბლოკები</span>
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">4</span>
              <span>დააკავშირეთ ისინი შენობებთან</span>
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">5</span>
              <span>შეინახეთ ცვლილებები</span>
            </li>
          </ol>
        </div>
      </div>

      <!-- Polygon Editor -->
      <div class="flex-1">
        <PolygonEditor
          v-if="selectedProjectId && backgroundImageUrl"
          ref="editorRef"
          :background-image="backgroundImageUrl"
          :image-width="imageWidth"
          :image-height="imageHeight"
          :initial-polygons="zones"
          :entities="buildings"
          entity-label="შენობა"
          @change="handleZonesChange"
          @polygon-click="navigateToFloorEditor"
        />
        <div
          v-else
          class="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 via-white to-indigo-50"
        >
          <div class="text-center max-w-md px-6">
            <div class="relative inline-block">
              <div class="absolute inset-0 bg-indigo-100 rounded-full blur-2xl opacity-30"></div>
              <svg
                class="relative mx-auto h-32 w-32 text-indigo-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 class="mt-6 text-xl font-semibold text-gray-900">
              {{ selectedProjectId ? 'ზონის სურათი არ არის ატვირთული' : 'დაიწყეთ პროექტის არჩევით' }}
            </h3>
            <p class="mt-3 text-sm text-gray-600 leading-relaxed">
              {{
                selectedProjectId
                  ? 'ასატვირთად ზონის სურათი, რომელზეც დახატავთ შენობის ბლოკების ინტერაქტიულ ზონებს'
                  : 'პროექტის არჩევის შემდეგ შეძლებთ ზონის სურათის ატვირთვას და შენობის ბლოკების დახატვას'
              }}
            </p>
            <button
              v-if="selectedProjectId"
              @click="openImageUpload"
              class="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span class="font-medium">სურათის ატვირთვა</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Upload Modal -->
    <div
      v-if="showImageModal"
      class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeImageModal"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in">
        <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-indigo-100 rounded-lg">
                <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900">ზონის სურათის ატვირთვა</h2>
            </div>
            <button
              @click="closeImageModal"
              class="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
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

        <div class="p-6 space-y-6">
          <!-- File Upload -->
          <div>
            <label class="flex items-center text-sm font-medium text-gray-900 mb-3">
              <svg class="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              სურათის ფაილი
            </label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 cursor-pointer group"
              @drop.prevent="handleFileDrop"
              @dragover.prevent
              @click="triggerFileInput"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />
              <div class="relative inline-block mb-4">
                <div class="absolute inset-0 bg-indigo-100 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <svg
                  class="relative mx-auto h-16 w-16 text-indigo-400 group-hover:text-indigo-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <p class="text-base text-gray-700">
                <span class="font-semibold text-indigo-600">დააჭირეთ ატვირთვისთვის</span>
                <span class="text-gray-500"> ან გადმოიტანეთ ფაილი</span>
              </p>
              <p class="text-xs text-gray-500 mt-2 flex items-center justify-center space-x-4">
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  PNG, JPG, WebP
                </span>
                <span>•</span>
                <span class="flex items-center">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  მაქს. 10MB
                </span>
              </p>
            </div>

            <!-- Preview -->
            <div v-if="previewImageUrl" class="mt-4 p-4 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl border border-gray-200">
              <img :src="previewImageUrl" alt="Preview" class="w-full rounded-lg shadow-md border border-gray-300" />
              <div class="mt-3 flex items-center justify-between">
                <div class="flex items-center space-x-2 text-sm text-gray-700">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="font-medium">{{ previewImageFile?.name }}</span>
                </div>
                <button 
                  @click="clearPreview" 
                  class="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-red-50 transition-all"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>წაშლა</span>
                </button>
              </div>
            </div>
          </div>

          <!-- ViewBox (auto-detected) -->
          <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <label class="flex items-center text-sm font-medium text-blue-900 mb-2">
              <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ViewBox (ავტომატური განსაზღვრა)
            </label>
            <input
              v-model="viewBox"
              type="text"
              readonly
              class="w-full px-4 py-2 border-blue-300 rounded-lg bg-white text-sm text-gray-900 font-mono"
              placeholder="0 0 1200 800"
            />
            <p class="text-xs text-blue-700 mt-2 flex items-start">
              <svg class="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
              </svg>
              <span>ViewBox ავტომატურად განისაზღვრება სურათის ზომის მიხედვით</span>
            </p>
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
          <button
            @click="closeImageModal"
            class="px-5 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white hover:border-gray-400 transition-all duration-200"
          >
            გაუქმება
          </button>
          <button
            @click="uploadImage"
            :disabled="!previewImageFile || isUploading"
            class="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <svg
              v-if="isUploading"
              class="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>{{ isUploading ? 'ატვირთვა...' : 'ატვირთვა' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Phase 1: Confirmation Dialog for Unsaved Changes -->
    <ConfirmDialog
      :show="showConfirmDialog"
      title="შეუნახავი ცვლილებები"
      message="გაქვთ შეუნახავი ზონები. გსურთ მათი შენახვა?"
      confirmText="შენახვა და გასვლა"
      destructiveText="გაუქმება და გასვლა"
      cancelText="დარჩენა"
      :isLoading="isSaving"
      @confirm="saveAndNavigate"
      @destructive="discardAndNavigate"
      @cancel="cancelNavigation"
    />
  </div>
</template>

<style scoped>
/* Fade transition for unsaved changes badge */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PolygonEditor from '@/components/admin/PolygonEditor.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import ZoneEditorBreadcrumbs from '@/components/admin/ZoneEditorBreadcrumbs.vue'
import type { Polygon } from '@/utils/polygon'
import type { Project } from '@/types'
import type { Building } from '@/types/apartments'
import api from '@/plugins/axios/api'
import { compressImage } from '@/utils/image-compression'
import { useUnsavedChanges } from '@/composables/useUnsavedChanges'
import { useToast } from '@/composables/useToast'
import { useAutoSave } from '@/composables/useAutoSave'
import { useZoneValidation } from '@/composables/useZoneValidation'
import { useZoneEditorStore } from '@/stores/admin/zoneEditor'

interface ZoneResponse {
  id: number
  svg_coordinates: number[][]
  entity_id: number | null
  entity_type: string
  display_config: {
    label?: string
    fill?: string
    stroke?: string
    hover?: string
  }
}

// Router
const router = useRouter()
const route = useRoute()

// State
const projects = ref<Project[]>([])
const buildings = ref<Building[]>([])
const zones = ref<Polygon[]>([])
const selectedProjectId = ref<number | string>(
  (Array.isArray(route.params.id) ? route.params.id[0] : route.params.id) || ''
)
const selectedProject = computed(() => projects.value.find((p) => p.id === selectedProjectId.value))
const isLoadingBuildings = ref(false)
const isSaving = ref(false)
const hasChanges = ref(false)
const backgroundImageUrl = ref('')
const imageWidth = ref(1200)
const imageHeight = ref(800)

// Image upload
const showImageModal = ref(false)
const fileInput = ref<HTMLInputElement>()
const previewImageUrl = ref('')
const previewImageFile = ref<File | null>(null)
const viewBox = ref('')
const isUploading = ref(false)

// Editor ref
const editorRef = ref<InstanceType<typeof PolygonEditor>>()

// Zone Editor Store
const zoneStore = useZoneEditorStore()

// Update store when project changes or on initial mount
watch(selectedProject, (project) => {
  if (project) {
    zoneStore.setProject(project.id, project.title)
  }
}, { immediate: true })

// Composables
const { success, error: showError, warning, info } = useToast()
const { validateZones } = useZoneValidation()

// Phase 1: Unsaved Changes Protection
const {
  showConfirmDialog,
  saveAndNavigate,
  discardAndNavigate,
  cancelNavigation,
  confirmNavigationChange
} = useUnsavedChanges({
  hasChanges,
  isSaving,
  onSave: async () => {
    await saveZones()
  },
  onDiscard: () => {
    loadZones()
    hasChanges.value = false
  },
  message: 'გაქვთ შეუნახავი ზონები. გსურთ მათი შენახვა?'
})

// Phase 3: Auto-Save & Draft Recovery
// Draft key computed from route params (source of truth)
const draftKey = computed(() => {
  const pid = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id || 'new'
  return `zones-draft-building-${pid}`
})

const {
  loadDraft,
  clearDraft,
  checkForDraft,
  getLastSavedTime,
  startAutoSave
} = useAutoSave({
  key: draftKey.value,
  data: zones,
  hasChanges,
  interval: 30000 // 30 seconds
})

// Methods
function goBack() {
  // Navigation guard will handle unsaved changes
  const customBackRoute = zoneStore.getBackRoute()
  router.push(customBackRoute)
}

function navigateToFloorEditor(polygon: Polygon) {
  console.log('🏢 Navigating to floor editor for building:', polygon.entityId)
  if (!polygon.entityId) {
    warning('შენობა არ არის მითითებული')
    return
  }
  router.push({
    name: 'admin-zones-floor-strips',
    params: {
      id: selectedProjectId.value,
      buildingId: polygon.entityId
    }
  })
}

function navigateToBuildingFloors(buildingId: number) {
  console.log('🏢 Navigating to floors for building:', buildingId)
  router.push({
    name: 'admin-zones-floor-strips',
    params: {
      id: selectedProjectId.value,
      buildingId: buildingId
    }
  })
}

async function loadProjects() {
  try {
    const response = await api.get('/admin/projects')
    projects.value = response.data.data || response.data
  } catch (error) {
    console.error('Failed to load projects:', error)
  }
}

async function loadBuildings() {
  if (!selectedProjectId.value) {
    buildings.value = []
    return
  }

  isLoadingBuildings.value = true
  try {
    const response = await api.get(`/admin/projects/${selectedProjectId.value}/buildings`)
    buildings.value = response.data.data || response.data
  } catch (error) {
    console.error('Failed to load buildings:', error)
    buildings.value = []
  } finally {
    isLoadingBuildings.value = false
  }
}

async function loadZones() {
  if (!selectedProjectId.value) return

  try {
    // Load zone image first
    await loadZoneImage()

    // Then load interactive zones
    const response = await api.get(
      `/admin/projects/${selectedProjectId.value}/interactive-zones`,
      {
        params: { zone_type: 'building_block' },
      }
    )

    const data = response.data.data || response.data
    console.log('🎯 LoadZones - Raw API response:', data)
    
    zones.value = (data || []).map((zone: ZoneResponse) => ({
      id: `zone-${zone.id}`,
      points: zone.svg_coordinates.map((coord: number[]) => ({ x: coord[0], y: coord[1] })),
      entityId: zone.entity_id,
      label: zone.display_config.label || `Zone ${zone.id}`,
      fillColor: zone.display_config.fill || '#3b82f680',
      strokeColor: zone.display_config.stroke || '#3b82f6',
      visible: true,
      selected: false,
    }))
    
    console.log('🎯 LoadZones - Mapped zones:', zones.value)
    console.log('🎯 LoadZones - Zone count:', zones.value.length)
  } catch (error) {
    console.error('Failed to load zones:', error)
    zones.value = []
  }
}

async function loadZoneImage() {
  if (!selectedProjectId.value) return

  try {
    const response = await api.get('/admin/zone-images', {
      params: {
        project_id: selectedProjectId.value,
        level_type: 'overview',
        image_type: 'background',
      },
    })

    const images = response.data.data || response.data
    console.log('Zone images response:', images)
    
    if (images && images.length > 0) {
      // Get the LATEST zone image (first in array, sorted by created_at desc)
      const zoneImage = images[0]
      console.log('Selected zone image:', zoneImage)
      
      // Get the image URL from the images relationship
      if (zoneImage.images && zoneImage.images.length > 0) {
        const imageData = zoneImage.images[0]
        
        // Use full_url from backend (includes proper storage path)
        backgroundImageUrl.value = imageData.full_url || imageData.url
        
        console.log('Image data:', imageData)
        console.log('Image URL:', backgroundImageUrl.value)
      }

      // Set dimensions from viewbox
      if (zoneImage.viewbox) {
        const [, , w, h] = zoneImage.viewbox.split(' ').map(Number)
        imageWidth.value = w
        imageHeight.value = h
        console.log('Image dimensions:', w, 'x', h)
      }
    } else {
      console.log('No zone images found')
    }
  } catch (error) {
    console.error('Failed to load zone image:', error)
  }
}

async function handleProjectChange() {
  // Check for unsaved changes before switching projects
  if (hasChanges.value && !confirmNavigationChange('გაქვთ შეუნახავი ცვლილებები. დარწმუნებული ხართ რომ გსურთ პროექტის შეცვლა?')) {
    // Revert selection to previous project
    return
  }

  // UPDATE URL to match new selection
  if (selectedProjectId.value) {
    router.replace({
      name: 'admin-zones-building-blocks',
      params: { id: selectedProjectId.value.toString() }
    })
  }

  zones.value = []
  backgroundImageUrl.value = ''
  hasChanges.value = false
  await loadBuildings()
  await loadZones()
}

function handleZonesChange(updatedZones: Polygon[]) {
  zones.value = updatedZones
  hasChanges.value = true
}

async function saveZones() {
  if (!selectedProjectId.value || !hasChanges.value) return

  // Phase 4: Validate zones before saving
  const validation = validateZones(zones.value, imageWidth.value, imageHeight.value)

  if (!validation.valid) {
    validation.errors.forEach(err => showError(err, 5000))
    return
  }

  if (validation.warnings.length > 0) {
    const proceed = confirm(
      'გაფრთხილებები:\n\n' +
      validation.warnings.join('\n\n') +
      '\n\nგსურთ გაგრძელება?'
    )
    if (!proceed) return
  }

  isSaving.value = true
  try {
    // Delete all existing zones for this project
    await api.delete(`/admin/projects/${selectedProjectId.value}/interactive-zones`, {
      params: { zone_type: 'building_block' },
    })

    // Create new zones
    for (const zone of zones.value) {
      await api.post(`/admin/projects/${selectedProjectId.value}/interactive-zones`, {
        zone_type: 'building_block',
        level_type: 'overview',
        entity_id: zone.entityId,
        entity_type: 'building',
        building_id: null,
        floor_number: null,
        svg_coordinates: zone.points,
        display_config: {
          label: zone.label,
          fill: zone.fillColor,
          stroke: zone.strokeColor,
          hover: zone.fillColor?.replace('80', 'cc'), // Increase opacity on hover
        },
      })
    }

    hasChanges.value = false
    clearDraft() // Clear auto-save draft after successful save
    success('ზონები წარმატებით შეინახა!')
  } catch (error) {
    console.error('Failed to save zones:', error)
    showError('ზონების შენახვა ვერ მოხერხდა')
  } finally {
    isSaving.value = false
  }
}

// Phase 2: Discard changes function
function handleDiscard() {
  if (confirm('დარწმუნებული ხართ რომ გსურთ ცვლილებების გაუქმება?')) {
    loadZones()
    hasChanges.value = false
    clearDraft()
    info('ცვლილებები გაუქმდა')
  }
}

function openImageUpload() {
  showImageModal.value = true
}

function closeImageModal() {
  showImageModal.value = false
  clearPreview()
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    handleFile(file)
  }
}

function handleFileDrop(event: DragEvent) {
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    handleFile(file)
  }
}

async function handleFile(file: File) {
  try {
    // Compress the image to ensure it's under the 2MB PHP upload limit
    const compressionResult = await compressImage(file, {
      imageType: 'sitePhoto', // Use sitePhoto preset for better compression
      smartCompression: true,
      maxWidth: 2400, // Limit dimensions to reduce file size
      maxHeight: 1800,
      quality: 0.85, // Lower quality for better compression
      forceDimensions: true, // Force dimension reduction to help meet size limit
    })

    // Use the compressed file
    const compressedFile = compressionResult.file
    previewImageFile.value = compressedFile

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      previewImageUrl.value = result

      // Auto-detect image dimensions
      const img = new Image()
      img.onload = () => {
        imageWidth.value = img.width
        imageHeight.value = img.height
        viewBox.value = `0 0 ${img.width} ${img.height}`
      }
      img.src = result
    }
    reader.readAsDataURL(compressedFile)
  } catch (error) {
    console.error('Failed to compress image:', error)
    // Fall back to original file if compression fails
    previewImageFile.value = file

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      previewImageUrl.value = result

      // Auto-detect image dimensions
      const img = new Image()
      img.onload = () => {
        imageWidth.value = img.width
        imageHeight.value = img.height
        viewBox.value = `0 0 ${img.width} ${img.height}`
      }
      img.src = result
    }
    reader.readAsDataURL(file)
  }
}

function clearPreview() {
  previewImageUrl.value = ''
  previewImageFile.value = null
  viewBox.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function uploadImage() {
  if (!previewImageFile.value || !selectedProjectId.value) return

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('image', previewImageFile.value)
    formData.append('project_id', String(selectedProjectId.value))
    formData.append('level_type', 'overview')
    formData.append('image_type', 'background')
    formData.append('viewbox', viewBox.value)
    formData.append('width', String(imageWidth.value))
    formData.append('height', String(imageHeight.value))

    const response = await api.post('/admin/zone-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // Extract image URL from response
    const zoneImage = response.data.data
    if (zoneImage.images && zoneImage.images.length > 0) {
      const imageData = zoneImage.images[0]
      
      // Use full_url from backend (includes proper storage path)
      backgroundImageUrl.value = imageData.full_url || imageData.url
    }

    closeImageModal()
    success('სურათი წარმატებით აიტვირთა!')
  } catch (err: unknown) {
    const error = err as { response?: { data?: { message?: string } } }
    const errorMessage = error.response?.data?.message || 'სურათის ატვირთვა ვერ მოხერხდა'
    showError(errorMessage)
  } finally {
    isUploading.value = false
  }
}

// Phase 4: Keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  // Ctrl+S or Cmd+S to save
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    if (hasChanges.value && !isSaving.value) {
      saveZones()
    }
  }
}

// Lifecycle
onMounted(async () => {
  await loadProjects()

  // Validate project ID exists (only if we have an ID from route)
  if (selectedProjectId.value) {
    // Now check if project exists in the loaded projects list
    const projectExists = projects.value.some(p => p.id == selectedProjectId.value)
    if (!projectExists) {
      showError(`პროექტი ID ${selectedProjectId.value} არ მოიძებნა`)
      router.push('/admin/projects')
      return
    }
    
    // Load buildings and zones for the selected project
    await loadBuildings()
    await loadZones()
  }

  // Phase 3: Check for draft on mount
  if (selectedProjectId.value && checkForDraft()) {
    const shouldRestore = confirm('აღმოჩენილია შეუნახავი დრაფტი. გსურთ მისი აღდგენა?')
    if (shouldRestore) {
      const draft = loadDraft()
      if (draft) {
        zones.value = draft
        hasChanges.value = true
        info('დრაფტი აღდგენილია')
      }
    } else {
      clearDraft()
    }
  }

  // Start auto-save
  startAutoSave()

  // Add keyboard shortcuts
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>
