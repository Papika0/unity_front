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
            <h1 class="text-2xl font-bold text-gray-900">ბინების ზონების რედაქტორი</h1>
            <p class="text-sm text-gray-500 mt-1">
              {{ (selectedBuilding?.name as any)?.ka || selectedBuilding?.name || 'შენობა' }} - სართული {{ floorNumber }} - ბინების ხატვა
            </p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <button
            @click="autoDetectPolygons"
            :disabled="!backgroundImageUrl || isDetecting"
            class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            title="ავტომატური გამოვლენა"
          >
            <svg v-if="!isDetecting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="hidden md:inline">{{ isDetecting ? 'გამოვლენა...' : 'ავტო-გამოვლენა' }}</span>
          </button>
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
      <!-- Apartments List Sidebar -->
      <div class="w-80 lg:w-72 xl:w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <!-- Building & Floor Info -->
        <div class="p-6 border-b border-gray-200 bg-gradient-to-br from-emerald-50 to-white">
          <div class="space-y-3">
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase mb-1">შენობა</h3>
              <div class="text-sm font-semibold text-gray-900 flex items-center">
                <svg class="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {{ (selectedBuilding?.name as any)?.ka || selectedBuilding?.name || 'N/A' }}
              </div>
            </div>
            <div>
              <h3 class="text-xs font-semibold text-gray-500 uppercase mb-1">სართული</h3>
              <div class="text-sm font-semibold text-gray-900 flex items-center">
                <svg class="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                {{ floorNumber }}
              </div>
            </div>
          </div>
        </div>

        <!-- Apartments List -->
        <div class="flex-1 overflow-y-auto p-4">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-gray-900 flex items-center">
              <svg class="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              ბინები
            </h3>
            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {{ apartments.length }}
            </span>
          </div>
          
          <div v-if="isLoadingApartments" class="text-center py-8">
            <svg class="animate-spin h-8 w-8 text-emerald-600 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-sm text-gray-500 mt-2">იტვირთება...</p>
          </div>
          
          <div v-else-if="apartments.length === 0" class="text-center py-8">
            <svg class="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <p class="text-sm text-gray-500">ბინები არ მოიძებნა</p>
            <p class="text-xs text-gray-400 mt-1">შექმენით ბინები ამ სართულისთვის</p>
          </div>
          
          <div v-else class="space-y-2">
            <div
              v-for="apartment in apartments"
              :key="apartment.id"
              class="p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 hover:from-emerald-50 hover:to-emerald-100 border border-gray-200 hover:border-emerald-300 transition-all duration-200 cursor-pointer group"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                    ბინა {{ apartment.apartment_number }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1 space-y-0.5">
                    <div v-if="apartment.area_total" class="flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      {{ apartment.area_total }} მ²
                    </div>
                    <div v-if="apartment.bedrooms" class="flex items-center">
                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      {{ apartment.bedrooms }} ოთახი
                    </div>
                    <div v-if="apartment.status" class="flex items-center">
                      <span class="inline-block w-2 h-2 rounded-full mr-1.5" 
                        :class="{
                          'bg-green-500': apartment.status === 'available',
                          'bg-yellow-500': apartment.status === 'reserved',
                          'bg-red-500': apartment.status === 'sold'
                        }">
                      </span>
                      <span class="text-xs">
                        {{ apartment.status === 'available' ? 'ხელმისაწვდომი' : 
                           apartment.status === 'reserved' ? 'დაჯავშნული' : 'გაყიდული' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <svg class="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ინსტრუქციები
          </h4>
          <ol class="text-xs text-gray-700 space-y-2">
            <li class="flex items-start">
              <span class="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">1</span>
              <span>ატვირთეთ სართულის გეგმა</span>
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">2</span>
              <span>დახატეთ ბინის ზონები</span>
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">3</span>
              <span>დააკავშირეთ ბინებთან</span>
            </li>
            <li class="flex items-start">
              <span class="flex-shrink-0 w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-semibold mr-2">4</span>
              <span>შეინახეთ ცვლილებები</span>
            </li>
          </ol>
        </div>
      </div>

      <!-- Polygon Editor -->
      <div class="flex-1">
        <PolygonEditor
          v-if="backgroundImageUrl"
          ref="editorRef"
          :background-image="backgroundImageUrl"
          :image-width="imageWidth"
          :image-height="imageHeight"
          :initial-polygons="zones"
          :entities="apartments"
          entity-label="ბინა"
          @change="handleZonesChange"
        />
        <div
          v-else
          class="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 via-white to-emerald-50"
        >
          <div class="text-center max-w-md px-6">
            <div class="relative inline-block">
              <div class="absolute inset-0 bg-emerald-100 rounded-full blur-2xl opacity-30"></div>
              <svg
                class="relative mx-auto h-32 w-32 text-emerald-300"
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
              სართულის გეგმა არ არის ატვირთული
            </h3>
            <p class="mt-3 text-sm text-gray-600 leading-relaxed">
              ასატვირთად სართულის გეგმა, რომელზეც დახატავთ ბინების ინტერაქტიულ ზონებს
            </p>
            <button
              @click="openImageUpload"
              class="mt-8 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 mx-auto"
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
        <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-emerald-100 rounded-lg">
                <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 class="text-xl font-semibold text-gray-900">სართულის გეგმის ატვირთვა</h2>
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
              <svg class="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              სურათის ფაილი
            </label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 cursor-pointer group"
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
                <div class="absolute inset-0 bg-emerald-100 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <svg
                  class="relative mx-auto h-16 w-16 text-emerald-400 group-hover:text-emerald-600 transition-colors"
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
                <span class="font-semibold text-emerald-600">დააჭირეთ ატვირთვისთვის</span>
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
            <div v-if="previewImageUrl" class="mt-4 p-4 bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl border border-gray-200">
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
            class="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PolygonEditor from '@/components/admin/PolygonEditor.vue'
import type { Polygon } from '@/utils/polygon'
import type { Building } from '@/types/apartments'
import api from '@/plugins/axios/api'
import { detectApartmentPolygons, type DetectionOptions } from '@/utils/polygonDetection'

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

interface Apartment {
  id: number
  apartment_number: string
  floor_number: number
  status: 'available' | 'reserved' | 'sold'
  price?: number | null
  area_total?: number | null
  area_living?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  has_balcony: boolean
  has_parking: boolean
}

// Router
const router = useRouter()
const route = useRoute()

// Route params
const projectId = ref<number | string>((Array.isArray(route.params.id) ? route.params.id[0] : route.params.id) || '')
const buildingId = ref<number | string>((Array.isArray(route.params.buildingId) ? route.params.buildingId[0] : route.params.buildingId) || '')
const floorNumber = ref<number>(parseInt((Array.isArray(route.params.floorNumber) ? route.params.floorNumber[0] : route.params.floorNumber) || '0'))

// State
const selectedBuilding = ref<Building | null>(null)
const apartments = ref<Apartment[]>([])
const zones = ref<Polygon[]>([])
const isLoadingApartments = ref(false)
const isSaving = ref(false)
const hasChanges = ref(false)
const backgroundImageUrl = ref('')
const imageWidth = ref(1200)
const imageHeight = ref(800)
const isDetecting = ref(false)

// Image upload
const showImageModal = ref(false)
const fileInput = ref<HTMLInputElement>()
const previewImageUrl = ref('')
const previewImageFile = ref<File | null>(null)
const uploadedImageFile = ref<File | null>(null) // Keep reference to uploaded file for detection
const viewBox = ref('')
const isUploading = ref(false)

// Editor ref
const editorRef = ref<InstanceType<typeof PolygonEditor>>()

// Methods
function goBack() {
  router.push({
    name: 'admin-zones-floor-strips',
    params: {
      id: projectId.value,
      buildingId: buildingId.value
    }
  })
}

async function loadBuilding() {
  try {
    const response = await api.get(`/admin/buildings/${buildingId.value}`)
    selectedBuilding.value = response.data.data || response.data
  } catch (error) {
    console.error('Failed to load building:', error)
  }
}

async function loadApartments() {
  if (!buildingId.value) {
    apartments.value = []
    return
  }

  isLoadingApartments.value = true
  try {
    const response = await api.get(`/admin/buildings/${buildingId.value}/apartments`, {
      params: { floor: floorNumber.value }
    })
    apartments.value = response.data.data || response.data
    
    console.log('Loaded apartments for floor', floorNumber.value, ':', apartments.value)
  } catch (error) {
    console.error('Failed to load apartments:', error)
    apartments.value = []
  } finally {
    isLoadingApartments.value = false
  }
}

async function loadZones() {
  if (!projectId.value || !buildingId.value) return

  try {
    // Load zone image first
    await loadZoneImage()

    // Then load interactive zones
    const response = await api.get(
      `/admin/projects/${projectId.value}/interactive-zones`,
      {
        params: {
          zone_type: 'apartment_unit',
          building_id: buildingId.value,
          floor_number: floorNumber.value
        },
      }
    )

    const data = response.data.data || response.data
    console.log('🎯 LoadZones - Raw API response:', data)
    
    zones.value = (data || []).map((zone: ZoneResponse) => ({
      id: `zone-${zone.id}`,
      points: zone.svg_coordinates.map((coord: number[]) => ({ x: coord[0], y: coord[1] })),
      entityId: zone.entity_id,
      label: zone.display_config.label || `Apartment ${zone.entity_id}`,
      fillColor: zone.display_config.fill || '#10b98180',
      strokeColor: zone.display_config.stroke || '#10b981',
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
  if (!projectId.value || !buildingId.value) return

  try {
    const response = await api.get('/admin/zone-images', {
      params: {
        project_id: projectId.value,
        building_id: buildingId.value,
        level_type: 'floor',
        floor_number: floorNumber.value,
        image_type: 'background',
      },
    })

    const images = response.data.data || response.data
    console.log('Zone images response:', images)
    
    if (images && images.length > 0) {
      const zoneImage = images[0]
      console.log('Selected zone image:', zoneImage)
      
      if (zoneImage.images && zoneImage.images.length > 0) {
        const imageData = zoneImage.images[0]
        backgroundImageUrl.value = imageData.full_url || imageData.url
        console.log('Image URL:', backgroundImageUrl.value)
      }

      if (zoneImage.viewbox) {
        const [, , w, h] = zoneImage.viewbox.split(' ').map(Number)
        imageWidth.value = w
        imageHeight.value = h
        console.log('Image dimensions:', w, 'x', h)
      }
    } else {
      console.log('No zone images found for floor', floorNumber.value)
    }
  } catch (error) {
    console.error('Failed to load zone image:', error)
  }
}

function handleZonesChange(updatedZones: Polygon[]) {
  zones.value = updatedZones
  hasChanges.value = true
}

async function saveZones() {
  if (!projectId.value || !buildingId.value || !hasChanges.value) return

  isSaving.value = true
  try {
    // Delete all existing zones for this floor
    await api.delete(`/admin/projects/${projectId.value}/interactive-zones`, {
      params: {
        zone_type: 'apartment_unit',
        building_id: buildingId.value,
        floor_number: floorNumber.value
      },
    })

    // Create new zones
    for (const zone of zones.value) {
      await api.post(`/admin/projects/${projectId.value}/interactive-zones`, {
        zone_type: 'apartment_unit',
        level_type: 'floor',
        entity_id: zone.entityId,
        entity_type: 'apartment',
        building_id: buildingId.value,
        floor_number: floorNumber.value,
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
    alert('ზონები წარმატებით შეინახა!')
  } catch (error) {
    console.error('Failed to save zones:', error)
    alert('ზონების შენახვა ვერ მოხერხდა')
  } finally {
    isSaving.value = false
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

function handleFile(file: File) {
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

function clearPreview() {
  previewImageUrl.value = ''
  previewImageFile.value = null
  viewBox.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function uploadImage() {
  if (!previewImageFile.value || !projectId.value || !buildingId.value) return

  isUploading.value = true
  try {
    const formData = new FormData()
    formData.append('image', previewImageFile.value)
    formData.append('project_id', String(projectId.value))
    formData.append('building_id', String(buildingId.value))
    formData.append('floor_number', String(floorNumber.value))
    formData.append('level_type', 'floor')
    formData.append('image_type', 'background')
    formData.append('viewbox', viewBox.value)
    formData.append('width', String(imageWidth.value))
    formData.append('height', String(imageHeight.value))

    // Store file reference for auto-detection
    uploadedImageFile.value = previewImageFile.value

    const response = await api.post('/admin/zone-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // Extract image URL from response
    const zoneImage = response.data.data
    if (zoneImage.images && zoneImage.images.length > 0) {
      const imageData = zoneImage.images[0]
      backgroundImageUrl.value = imageData.full_url || imageData.url
    }

    closeImageModal()
    alert('სურათი წარმატებით აიტვირთა!')
  } catch (error) {
    console.error('Failed to upload image:', error)
    alert('სურათის ატვირთვა ვერ მოხერხდა')
  } finally {
    isUploading.value = false
  }
}

// Auto-detect apartment polygons from floor plan
async function autoDetectPolygons() {
  if (!backgroundImageUrl.value) {
    alert('გთხოვთ ჯერ ატვირთოთ სართულის სურათი')
    return
  }

  if (!confirm('გნებავთ ავტომატური გამოვლენა? არსებული ზონები წაიშლება.')) {
    return
  }

  isDetecting.value = true

  try {
    // Use the uploaded file if available, otherwise convert from image element
    let file: File

    if (uploadedImageFile.value) {
      // Use the stored file reference
      file = uploadedImageFile.value
      console.log('Using stored uploaded file for detection')
    } else if (previewImageFile.value) {
      // Use the preview file (just selected but not uploaded yet)
      file = previewImageFile.value
      console.log('Using preview file for detection')
    } else {
      // Convert the background image from canvas (avoids CORS)
      console.log('Converting background image to file for detection')

      // Convert storage URL to proxy URL for CORS
      let imageUrl = backgroundImageUrl.value
      if (imageUrl.includes('/storage/')) {
        // Extract path after /storage/ and use proxy route
        const storagePath = imageUrl.split('/storage/')[1]
        imageUrl = imageUrl.replace('/storage/', '/api/storage-proxy/')
        console.log('Using proxy URL:', imageUrl)
      }

      // Load image via Image element with crossOrigin
      const img = new Image()
      img.crossOrigin = 'anonymous'

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('Failed to load image. Try re-uploading the image.'))
        img.src = imageUrl
      })

      // Draw to canvas and convert to blob
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png')
      })

      file = new File([blob], 'floor-plan.png', { type: 'image/png' })
      console.log('Successfully converted image to file')
    }

    // Detection options - tuned for pastel colored apartment floor plans
    const options: DetectionOptions = {
      minArea: 3000, // Higher to get ~10 main apartments (filter noise)
      colorTolerance: 20, // Tighter tolerance for distinct pastel colors
      simplifyTolerance: 3.0, // More simplification
    }

    // Detect polygons
    console.log('🎨 Starting polygon detection with options:', options)
    console.log('📐 Image dimensions:', file.size, 'bytes')

    const detectedPolygons = await detectApartmentPolygons(file, options)

    console.log(`✅ Detected ${detectedPolygons.length} apartment polygons`)

    if (detectedPolygons.length > 0) {
      console.log('Sample polygons (first 3):', detectedPolygons.slice(0, 3).map(p => ({
        area: p.area,
        points: p.points.length,
        centroid: p.centroid,
        color: p.color
      })))
      console.log('All polygon areas:', detectedPolygons.map(p => p.area).sort((a, b) => b - a))
    }

    if (detectedPolygons.length === 0) {
      alert('ბინები ვერ მოიძებნა.\n\nსცადეთ:\n- სურათის ხელახლა ატვირთვა\n- უფრო მაღალი გარჩევადობის სურათი\n- ან გამოიყენეთ ხელით დახატვა')
      return
    }

    // Filter: Keep only the largest polygons (main apartments, not noise/duplicates)
    const expectedApartments = apartments.value.length || 10
    const filteredPolygons = detectedPolygons
      .sort((a, b) => b.area - a.area)
      .slice(0, Math.min(expectedApartments + 2, 15)) // Take top N largest

    console.log(`🎯 Filtered to ${filteredPolygons.length} largest polygons (from ${detectedPolygons.length})`)

    // Match detected polygons with actual apartments
    const matchedZones: Polygon[] = []
    const unmatchedPolygons: typeof filteredPolygons = []
    const usedApartmentIds = new Set<number>()

    for (const detected of filteredPolygons) {
      // Try to find an apartment that hasn't been matched yet
      const apartment = apartments.value.find(apt => !usedApartmentIds.has(apt.id))

      if (apartment) {
        usedApartmentIds.add(apartment.id)
        matchedZones.push({
          id: `temp-${Date.now()}-${apartment.id}`,
          points: detected.points.map(([x, y]) => ({ x, y })),
          selected: false,
          entityId: apartment.id,
          label: `ბინა ${apartment.apartment_number}`,
          fillColor: '#93c5fd',
          strokeColor: '#60a5fa',
          hoverColor: '#60a5fa',
          visible: true,
        })
      } else {
        unmatchedPolygons.push(detected)
      }
    }

    // Add unmatched polygons as zones without apartment assignment
    for (const [index, detected] of unmatchedPolygons.entries()) {
      matchedZones.push({
        id: `temp-${Date.now()}-unmatched-${index}`,
        points: detected.points.map(([x, y]) => ({ x, y })),
        selected: false,
        entityId: null,
        label: `ახალი ${index + 1}`,
        fillColor: '#fca5a5',
        strokeColor: '#ef4444',
        hoverColor: '#ef4444',
        visible: true,
      })
    }

    // Replace existing zones
    zones.value = matchedZones
    hasChanges.value = true

    console.log('🎨 Created zones:', zones.value.length)
    console.log('Sample zone:', zones.value[0])

    const matchedCount = matchedZones.length - unmatchedPolygons.length
    const unmatchedCount = unmatchedPolygons.length

    if (unmatchedCount > 0) {
      alert(
        `${detectedPolygons.length} ბინა აღმოჩნდა!\n` +
        `${matchedCount} დაკავშირებულია ბინებთან\n` +
        `${unmatchedCount} უნდა დაუკავშიროთ ხელით (წითლით)\n\n` +
        `თუ ზონები არჩანს, სცადეთ გვერდის განახლება`
      )
    } else {
      alert(`${matchedCount} ბინა აღმოჩნდა და ავტომატურად დაკავშირდა!\n\nთუ ზონები არჩანს, სცადეთ გვერდის განახლება`)
    }
  } catch (error) {
    console.error('Auto-detection error:', error)
    alert('გამოვლენა ვერ მოხერხდა: ' + (error as Error).message)
  } finally {
    isDetecting.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await loadBuilding()
  await loadApartments()
  await loadZones()
})
</script>
