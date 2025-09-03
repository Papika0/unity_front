<template>
  <div class="min-h-screen bg-white">
    <!-- Admin Header Section -->
    <section class="relative bg-white border-b border-slate-100 py-16 lg:py-20">
      <div class="absolute inset-0 bg-gradient-to-br from-amber-50/30 to-slate-50/30"></div>

      <div class="relative max-w-7xl mx-auto px-4 md:px-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div class="flex-1">
            <div class="mb-4">
              <div
                class="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-6"
              ></div>
            </div>
            <h1
              class="text-4xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent break-words leading-tight py-1"
            >
              სიახლეები
            </h1>
            <p class="mt-2 text-slate-600 text-lg">
              სიახლეების მართვა, შექმნა, რედაქტირება და წაშლა.
            </p>
            <div
              class="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-6"
            ></div>
          </div>

          <div class="flex-shrink-0 flex flex-col sm:flex-row gap-3 sm:gap-0">
            <button
              @click="goToAddNews"
              class="group bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 w-full sm:w-auto"
            >
              <svg
                class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              ახალი სიახლის დამატება
            </button>

            <button
              @click="openFeaturedModal"
              class="group sm:ml-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 w-full sm:w-auto"
            >
              <svg
                class="w-5 h-5 group-hover:scale-110 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <span class="sm:inline">რჩეული სიახლეები</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 md:px-8 py-16">
      <!-- Search and Filter Section -->
      <div class="mb-16 relative">
        <div
          class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-8 overflow-visible"
          style="overflow: visible !important"
        >
          <div class="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
            <!-- Search Input -->
            <div class="flex-1 max-w-2xl">
              <div class="relative group">
                <input
                  v-model="adminNewsStore.searchQuery"
                  @input="handleSearch"
                  type="text"
                  placeholder="ძებნა სიახლეებში..."
                  class="w-full px-6 py-4 pl-14 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-300 text-slate-800 placeholder-slate-500 shadow-sm hover:shadow-md"
                />
                <svg
                  class="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <!-- Filter and Info Section -->
            <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <!-- Category Filter -->
              <div class="flex items-center gap-2 relative z-10">
                <label
                  for="category-filter"
                  class="text-slate-600 font-medium text-sm whitespace-nowrap"
                >
                  კატეგორია:
                </label>
                <div class="relative custom-dropdown-container">
                  <!-- Custom Dropdown Button -->
                  <button
                    @click="toggleCategoryDropdown"
                    @blur="handleDropdownBlur"
                    class="appearance-none px-4 py-2.5 pr-10 bg-white/90 backdrop-blur-sm border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-300 text-slate-800 text-sm min-w-[160px] font-medium shadow-sm hover:shadow-md hover:border-slate-300 cursor-pointer text-left flex items-center justify-between"
                    :class="{ 'border-amber-400 ring-4 ring-amber-500/20': showCategoryDropdown }"
                  >
                    <span>{{ getCategoryDisplayText(adminNewsStore.selectedCategory) }}</span>
                    <!-- Custom dropdown arrow -->
                    <svg
                      class="w-4 h-4 text-slate-400 transition-all duration-200 ml-2"
                      :class="{
                        'text-amber-500': adminNewsStore.selectedCategory,
                        'rotate-180': showCategoryDropdown,
                      }"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <!-- Custom Dropdown Options Portal -->
                  <Teleport to="body">
                    <div
                      v-if="showCategoryDropdown"
                      ref="dropdownOptions"
                      class="fixed bg-white/95 backdrop-blur-sm border-2 border-slate-200 rounded-xl shadow-2xl z-[99999] min-w-[160px] overflow-hidden"
                      :style="dropdownPosition"
                    >
                      <div class="py-2">
                        <button
                          v-for="option in categoryOptions"
                          :key="option.value"
                          @click="selectCategory(option.value)"
                          class="w-full px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2"
                          :class="{
                            'text-slate-600': option.value === '',
                            'text-slate-800': option.value !== '',
                            'bg-amber-100 text-amber-800':
                              adminNewsStore.selectedCategory === option.value,
                          }"
                        >
                          <span class="flex-1">{{ option.label }}</span>
                          <svg
                            v-if="adminNewsStore.selectedCategory === option.value"
                            class="w-4 h-4 text-amber-600"
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
                        </button>
                      </div>
                    </div>
                  </Teleport>
                </div>
              </div>

              <!-- Filter Tags -->
              <div class="flex flex-wrap gap-3">
                <div
                  class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 rounded-xl border border-slate-200"
                >
                  <svg
                    class="w-4 h-4 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
                    />
                  </svg>
                  <span class="text-slate-600 font-medium text-sm"
                    >სულ: {{ articlesCount }} სიახლე</span
                  >
                </div>

                <!-- Active Filter Indicator -->
                <div
                  v-if="adminNewsStore.selectedCategory"
                  class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-50 rounded-xl border border-amber-200"
                >
                  <svg
                    class="w-4 h-4 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  <span class="text-amber-700 font-medium text-sm">
                    {{ getCategoryLabel(adminNewsStore.selectedCategory) }}
                  </span>
                  <button
                    @click="clearCategoryFilter"
                    class="ml-1 text-amber-600 hover:text-amber-800 transition-colors"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-32">
        <div class="relative">
          <div class="animate-spin rounded-full h-20 w-20 border-4 border-slate-200"></div>
          <div
            class="animate-spin rounded-full h-20 w-20 border-4 border-amber-400 border-t-transparent absolute top-0 left-0"
          ></div>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-3xl p-12 text-center shadow-lg"
      >
        <div class="text-red-300 mb-6">
          <svg class="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 class="text-2xl font-light text-red-800 mb-4">სიახლეების ჩატვირთვის შეცდომა</h3>
        <p class="text-red-600 text-lg mb-8">{{ error }}</p>
        <button
          @click="adminNewsStore.loadArticles()"
          class="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          ხელახლა ცდა
        </button>
      </div>

      <div v-else>
        <!-- Articles Header -->
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-light text-slate-800 mb-4">
            {{ adminNewsStore.searchQuery ? 'ძებნის შედეგები' : 'ყველა სიახლე' }}
          </h2>
          <div
            class="w-16 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto mb-6"
          ></div>
        </div>

        <!-- Empty State -->
        <div v-if="articles.length === 0" class="text-center py-20">
          <div class="text-slate-300 mb-8">
            <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
              />
            </svg>
          </div>
          <h3 class="text-2xl font-light text-slate-700 mb-4">სიახლეები ვერ მოიძებნა</h3>
          <p class="text-slate-500 text-lg mb-8">
            {{
              adminNewsStore.searchQuery
                ? 'სცადეთ სხვა საძიებო სიტყვები'
                : 'ჯერ არცერთი სიახლე არ არის დამატებული'
            }}
          </p>
          <button
            v-if="!adminNewsStore.searchQuery"
            @click="goToAddNews"
            class="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-8 py-4 rounded-2xl font-medium shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          >
            პირველი სიახლის დამატება
          </button>
        </div>

        <!-- News Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <article
            v-for="article in articles"
            :key="article.id"
            class="group bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-200/50 hover:border-amber-200 transform hover:-translate-y-1 flex flex-col h-full"
          >
            <!-- Article Image -->
            <div class="relative overflow-hidden">
              <img
                v-if="article.main_image"
                :src="
                  article.main_image.startsWith('http')
                    ? article.main_image
                    : backendUrl + article.main_image
                "
                :alt="article.title.ka"
                class="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div
                v-else
                class="w-full h-40 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50 flex items-center justify-center"
              >
                <svg
                  class="h-16 w-16 text-amber-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>

              <!-- Overlay gradient -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              ></div>

              <!-- Status badges -->
              <div class="absolute top-4 left-4 flex gap-2">
                <span
                  v-if="article.is_featured"
                  class="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-medium rounded-full shadow-lg"
                >
                  ⭐ რჩეული
                </span>
                <span
                  v-if="!article.is_active"
                  class="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium rounded-full shadow-lg"
                >
                  🚫 არააქტიური
                </span>
              </div>

              <!-- Category badge -->
              <div class="absolute top-4 right-4">
                <span
                  class="px-3 py-1 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-medium rounded-full border border-slate-200 shadow-sm"
                >
                  {{ getCategoryLabel(article.category) }}
                </span>
              </div>
            </div>

            <!-- Article Info -->
            <div class="p-4 flex flex-col h-full">
              <!-- Meta info -->
              <div class="flex items-center justify-between text-sm text-slate-500 mb-2">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span class="font-medium">{{ formatDate(article.publish_date) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span class="font-medium">{{ article.views }} ნახვა</span>
                </div>
              </div>

              <!-- Title -->
              <h3
                class="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors duration-300 leading-snug"
              >
                {{ article.title.ka }}
              </h3>

              <!-- Excerpt -->
              <p class="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                {{ article.excerpt.ka }}
              </p>

              <!-- Tags -->
              <div v-if="article.tags && article.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
                <span
                  v-for="tag in article.tags.slice(0, 3)"
                  :key="tag"
                  class="px-3 py-1 bg-gradient-to-r from-slate-100 to-slate-50 text-slate-600 text-xs font-medium rounded-full border border-slate-200"
                >
                  {{ tag }}
                </span>
                <span
                  v-if="article.tags.length > 3"
                  class="px-3 py-1 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200"
                >
                  +{{ article.tags.length - 3 }}
                </span>
              </div>

              <!-- Action buttons -->
              <div class="flex flex-col gap-3 mt-auto">
                <!-- Primary Actions Row -->
                <div class="grid grid-cols-2 gap-3">
                  <button
                    @click="goToView(article.id)"
                    class="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-3 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 font-medium text-sm border border-blue-200 flex items-center justify-center gap-2 group/btn"
                  >
                    <svg
                      class="w-4 h-4 group-hover/btn:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <span class="hidden sm:inline">ნახვა</span>
                    <span class="sm:hidden">👁</span>
                  </button>
                  <button
                    @click="goToEdit(article.id)"
                    class="bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 px-4 py-3 rounded-xl hover:from-amber-100 hover:to-amber-200 transition-all duration-300 font-medium text-sm border border-amber-200 flex items-center justify-center gap-2 group/btn"
                  >
                    <svg
                      class="w-4 h-4 group-hover/btn:rotate-12 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span class="hidden sm:inline">რედაქტირება</span>
                    <span class="sm:hidden">✏️</span>
                  </button>
                </div>

                <!-- Secondary Action Row -->
                <button
                  @click="confirmDelete(article)"
                  class="w-full bg-gradient-to-r from-red-50 to-red-100 text-red-700 px-4 py-3 rounded-xl hover:from-red-100 hover:to-red-200 transition-all duration-300 font-medium text-sm border border-red-200 flex items-center justify-center gap-2 group/btn"
                >
                  <svg
                    class="w-4 h-4 group-hover/btn:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  <span>წაშლა</span>
                  <span class="text-xs opacity-75">(საშიში)</span>
                </button>
              </div>
            </div>
          </article>
        </div>

        <!-- Pagination Controls -->
        <div v-if="paginationInfo.totalPages > 1" class="mt-16">
          <div class="flex flex-col items-center space-y-6">
            <!-- Pagination Info -->
            <div class="text-center">
              <p class="text-slate-600 text-sm">
                ნაჩვენებია {{ paginationInfo.from }}-{{ paginationInfo.to }} სიახლე
                {{ paginationInfo.totalItems }}-დან
              </p>
            </div>

            <!-- Pagination Navigation -->
            <div class="flex items-center space-x-2">
              <!-- Previous Button -->
              <button
                @click="adminNewsStore.prevPage()"
                :disabled="!paginationInfo.hasPrev || loading"
                class="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-slate-700 font-medium"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                წინა
              </button>

              <!-- Page Numbers -->
              <div class="flex space-x-1">
                <!-- First page -->
                <button
                  v-if="paginationInfo.currentPage > 3"
                  @click="adminNewsStore.goToPage(1)"
                  :disabled="loading"
                  class="px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 text-slate-700 font-medium"
                >
                  1
                </button>

                <!-- Ellipsis -->
                <span v-if="paginationInfo.currentPage > 4" class="px-3 py-2 text-slate-400">
                  ...
                </span>

                <!-- Page range around current page -->
                <button
                  v-for="page in getPageRange()"
                  :key="page"
                  @click="adminNewsStore.goToPage(page)"
                  :disabled="loading"
                  :class="[
                    'px-3 py-2 rounded-lg font-medium transition-all duration-200',
                    page === paginationInfo.currentPage
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
                  ]"
                >
                  {{ page }}
                </button>

                <!-- Ellipsis -->
                <span
                  v-if="paginationInfo.currentPage < paginationInfo.totalPages - 3"
                  class="px-3 py-2 text-slate-400"
                >
                  ...
                </span>

                <!-- Last page -->
                <button
                  v-if="paginationInfo.currentPage < paginationInfo.totalPages - 2"
                  @click="adminNewsStore.goToPage(paginationInfo.totalPages)"
                  :disabled="loading"
                  class="px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 text-slate-700 font-medium"
                >
                  {{ paginationInfo.totalPages }}
                </button>
              </div>

              <!-- Next Button -->
              <button
                @click="adminNewsStore.nextPage()"
                :disabled="!paginationInfo.hasNext || loading"
                class="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-slate-700 font-medium"
              >
                შემდეგი
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="cancelDelete"
    >
      <div
        class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg w-full mx-4 border border-slate-200/50"
      >
        <div class="p-8">
          <div class="flex items-center mb-6">
            <div
              class="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-red-100 to-red-50 rounded-2xl flex items-center justify-center border border-red-200"
            >
              <svg
                class="w-7 h-7 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <h3 class="text-xl font-semibold text-slate-900">სიახლის წაშლა</h3>
              <p class="text-slate-600 text-sm mt-1">შეუქცევადი მოქმედება</p>
            </div>
          </div>

          <div class="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200">
            <p class="text-slate-700 leading-relaxed">
              დარწმუნებული ხართ, რომ გსურთ
              <strong class="text-slate-900">"{{ articleToDelete?.title.ka }}"</strong>
              სიახლის წაშლა?
            </p>
          </div>

          <div class="flex gap-4">
            <button
              @click="cancelDelete"
              :disabled="saving"
              class="flex-1 bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 px-6 py-3 rounded-2xl hover:from-slate-200 hover:to-slate-100 transition-all duration-300 font-medium disabled:opacity-50 border border-slate-200"
            >
              გაუქმება
            </button>
            <button
              @click="deleteNews"
              :disabled="saving"
              class="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <svg v-if="saving" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ saving ? 'იშლება...' : 'წაშლა' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured News Selection Modal -->
    <div
      v-if="showFeaturedModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="cancelFeaturedSelection"
    >
      <div
        class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-4xl w-full mx-4 border border-slate-200/50 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <!-- Modal Header -->
        <div class="p-8 border-b border-slate-200/50">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div
                class="flex-shrink-0 w-14 h-14 bg-gradient-to-r from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center border border-purple-200"
              >
                <svg
                  class="w-7 h-7 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-2xl font-semibold text-slate-900">რჩეული სიახლეების მართვა</h3>
                <p class="text-slate-600 text-sm mt-1">
                  აირჩიეთ მაქსიმუმ 2 სიახლე როგორც რჩეული ({{ selectedNewsIds.length }}/2)
                </p>
              </div>
            </div>
            <button
              @click="cancelFeaturedSelection"
              class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto p-8">
          <!-- Current Featured News Info -->
          <div v-if="featuredArticles.length > 0" class="mb-8">
            <h4 class="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              მიმდინარე რჩეული სიახლეები
            </h4>
            <div class="grid gap-3">
              <div
                v-for="article in featuredArticles"
                :key="article.id"
                class="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl"
              >
                <img
                  v-if="article.main_image"
                  :src="
                    article.main_image.startsWith('http')
                      ? article.main_image
                      : `${backendUrl}/${article.main_image}`
                  "
                  :alt="article.title.ka"
                  class="w-16 h-16 object-cover rounded-xl"
                />
                <div class="flex-1">
                  <h5 class="font-semibold text-slate-900">{{ article.title.ka }}</h5>
                  <p class="text-sm text-slate-600">{{ formatDate(article.publish_date) }}</p>
                </div>
                <div class="text-amber-500">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Available News List -->
          <div>
            <h4 class="text-lg font-semibold text-slate-900 mb-4">ყველა სიახლე</h4>
            <div class="grid gap-3 max-h-96 overflow-y-auto">
              <div
                v-for="article in allArticles"
                :key="article.id"
                @click="toggleNewsSelection(article.id)"
                class="flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md"
                :class="[
                  selectedNewsIds.includes(article.id)
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-slate-200 bg-white hover:border-slate-300',
                  !canSelectMore && !selectedNewsIds.includes(article.id)
                    ? 'opacity-50 cursor-not-allowed'
                    : '',
                ]"
              >
                <!-- Selection Checkbox -->
                <div class="flex-shrink-0">
                  <div
                    class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors"
                    :class="
                      selectedNewsIds.includes(article.id)
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-slate-300'
                    "
                  >
                    <svg
                      v-if="selectedNewsIds.includes(article.id)"
                      class="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                <!-- Article Image -->
                <img
                  v-if="article.main_image"
                  :src="`${backendUrl}${article.main_image}`"
                  :alt="article.title.ka"
                  class="w-16 h-16 object-cover rounded-xl"
                />
                <div
                  v-else
                  class="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center"
                >
                  <svg
                    class="w-8 h-8 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <!-- Article Info -->
                <div class="flex-1">
                  <h5 class="font-semibold text-slate-900 line-clamp-1">{{ article.title.ka }}</h5>
                  <p class="text-sm text-slate-600 mt-1">{{ formatDate(article.publish_date) }}</p>
                  <div class="flex items-center gap-2 mt-2">
                    <span
                      class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium"
                      :class="
                        article.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      "
                    >
                      {{ article.is_active ? 'აქტიური' : 'არააქტიური' }}
                    </span>
                    <span
                      v-if="article.is_featured"
                      class="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-amber-100 text-amber-800"
                    >
                      ⭐ რჩეული
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-8 border-t border-slate-200/50">
          <div class="flex gap-4">
            <button
              @click="cancelFeaturedSelection"
              :disabled="savingFeatured"
              class="flex-1 bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 px-6 py-3 rounded-2xl hover:from-slate-200 hover:to-slate-100 transition-all duration-300 font-medium disabled:opacity-50 border border-slate-200"
            >
              გაუქმება
            </button>
            <button
              @click="saveFeaturedNews"
              :disabled="savingFeatured || selectedNewsIds.length === 0"
              class="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <svg
                v-if="savingFeatured"
                class="animate-spin w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              {{ savingFeatured ? 'ინახება...' : `რჩეულად მონიშვნა (${selectedNewsIds.length})` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminNewsStore } from '@/stores/admin/news'
import { useToastStore } from '@/stores/ui/toast'
import type { AdminNewsArticle } from '@/types/index'

const router = useRouter()
const adminNewsStore = useAdminNewsStore()
const toastStore = useToastStore()
const backendUrl = import.meta.env.VITE_BACKEND_URL

// Local state
const showDeleteModal = ref(false)
const articleToDelete = ref<AdminNewsArticle | null>(null)
const searchTimeout = ref<number | null>(null)

// Custom dropdown state
const showCategoryDropdown = ref(false)
const dropdownOptions = ref<HTMLElement | null>(null)
const dropdownPosition = ref({})

// Category dropdown options
const categoryOptions = [
  { value: '', label: 'ყველა კატეგორია' },
  { value: 'company', label: 'კომპანია' },
  { value: 'project', label: 'პროექტი' },
  { value: 'industry', label: 'ინდუსტრია' },
  { value: 'event', label: 'ღონისძიება' },
]

// Featured news modal state
const showFeaturedModal = ref(false)
const selectedNewsIds = ref<number[]>([])
const savingFeatured = ref(false)

// Computed
const articles = computed(() => adminNewsStore.articles)
const allArticles = computed(() => adminNewsStore.modalArticles)
const articlesCount = computed(() => adminNewsStore.articlesCount)
const featuredArticles = computed(() => adminNewsStore.featuredArticles)
const loading = computed(() => adminNewsStore.loading)
const saving = computed(() => adminNewsStore.saving)
const error = computed(() => adminNewsStore.error)
const paginationInfo = computed(() => adminNewsStore.paginationInfo)

// Featured news computed properties
const canSelectMore = computed(() => selectedNewsIds.value.length < 2)

// Methods
const goToAddNews = () => {
  // Clear any existing validation errors before navigating
  adminNewsStore.clearValidationErrors()
  adminNewsStore.clearError()
  router.push('/admin/news/add')
}

const handleSearch = () => {
  // Clear existing timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  // Set new timeout for debounced search
  searchTimeout.value = setTimeout(() => {
    adminNewsStore.searchArticles(adminNewsStore.searchQuery)
  }, 500)
}

const clearCategoryFilter = () => {
  adminNewsStore.selectedCategory = ''
  adminNewsStore.filterByCategory('')
}

// Custom dropdown methods
const toggleCategoryDropdown = (event: Event) => {
  event.preventDefault()
  showCategoryDropdown.value = !showCategoryDropdown.value

  if (showCategoryDropdown.value) {
    // Calculate position for the dropdown
    const target = event.target as HTMLElement
    const rect = target.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = 200 // Approximate height

    // Determine if dropdown should appear above or below
    const spaceBelow = viewportHeight - rect.bottom
    const shouldShowAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight

    dropdownPosition.value = {
      left: `${rect.left}px`,
      top: shouldShowAbove ? `${rect.top - dropdownHeight}px` : `${rect.bottom + 4}px`,
      width: `${rect.width}px`,
      maxHeight: shouldShowAbove ? `${rect.top - 10}px` : `${spaceBelow - 10}px`,
    }

    // Add click outside listener
    setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
}

const selectCategory = (value: string) => {
  adminNewsStore.selectedCategory = value
  adminNewsStore.filterByCategory(value)
  showCategoryDropdown.value = false
  document.removeEventListener('click', handleClickOutside)
}

const handleDropdownBlur = () => {
  // Only close if focus is not moving to dropdown options
  setTimeout(() => {
    if (dropdownOptions.value && !dropdownOptions.value.contains(document.activeElement)) {
      showCategoryDropdown.value = false
      document.removeEventListener('click', handleClickOutside)
    }
  }, 100)
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (dropdownOptions.value && !dropdownOptions.value.contains(target)) {
    showCategoryDropdown.value = false
    document.removeEventListener('click', handleClickOutside)
  }
}

const getCategoryDisplayText = (value: string) => {
  const option = categoryOptions.find((opt) => opt.value === value)
  return option ? option.label : 'ყველა კატეგორია'
}

const goToView = (id: number) => {
  // Add error handling for non-existent articles
  if (!id || id < 1) {
    console.error('Invalid article ID:', id)
    return
  }

  // Check if article exists in current loaded articles
  const articleExists = adminNewsStore.articles.some((article) => article.id === id)
  if (!articleExists) {
    console.warn(`Article with ID ${id} not found in current articles list`)
    // Still try to navigate - the detail view will handle the error gracefully
  }

  router.push(`/admin/news/${id}`)
}

const goToEdit = (id: number) => {
  // Clear any existing validation errors before navigating
  adminNewsStore.clearValidationErrors()
  adminNewsStore.clearError()
  router.push(`/admin/news/${id}/edit`)
}

const confirmDelete = (article: AdminNewsArticle) => {
  articleToDelete.value = article
  showDeleteModal.value = true
}

const cancelDelete = () => {
  articleToDelete.value = null
  showDeleteModal.value = false
}

const deleteNews = async () => {
  if (!articleToDelete.value) return

  try {
    const result = await adminNewsStore.removeArticle(articleToDelete.value.id)
    if (result.success) {
      toastStore.success(
        'სიახლე წაშლილია',
        `"${articleToDelete.value.title.ka}" წარმატებით წაიშალა`,
      )
      showDeleteModal.value = false
      articleToDelete.value = null
    } else {
      toastStore.error('შეცდომა', result.error || 'სიახლის წაშლა ვერ მოხერხდა')
    }
  } catch (err) {
    console.error('Error deleting news article:', err)
    toastStore.error('შეცდომა', 'სიახლის წაშლა ვერ მოხერხდა')
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    company: 'კომპანია',
    project: 'პროექტი',
    industry: 'ინდუსტრია',
    event: 'ღონისძიება',
  }
  return labels[category] || category
}

const getPageRange = () => {
  const current = paginationInfo.value.currentPage
  const total = paginationInfo.value.totalPages
  const range = []

  // Show 2 pages before and after current page
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)

  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  return range
}

// Featured news methods
const openFeaturedModal = async () => {
  showFeaturedModal.value = true

  // Load articles for the modal if not already loaded
  if (allArticles.value.length === 0) {
    await adminNewsStore.loadArticlesForFeaturedModal()
  }

  // Pre-select currently featured news from the modal articles
  const modalFeatured = allArticles.value.filter((article) => article.is_featured)
  selectedNewsIds.value = modalFeatured.map((article) => article.id)
}

const cancelFeaturedSelection = () => {
  selectedNewsIds.value = []
  showFeaturedModal.value = false
}

const toggleNewsSelection = (articleId: number) => {
  const index = selectedNewsIds.value.indexOf(articleId)

  if (index > -1) {
    // Remove if already selected
    selectedNewsIds.value.splice(index, 1)
  } else {
    // Add if not selected and we can select more
    if (canSelectMore.value) {
      selectedNewsIds.value.push(articleId)
    }
  }
}

const saveFeaturedNews = async () => {
  if (selectedNewsIds.value.length === 0) return

  savingFeatured.value = true

  try {
    const result = await adminNewsStore.setFeaturedNews(selectedNewsIds.value)

    if (result.success) {
      toastStore.success(
        'რჩეული სიახლეები განახლდა',
        `წარმატებით განახლდა ${selectedNewsIds.value.length} რჩეული სიახლე`,
      )
      showFeaturedModal.value = false
      selectedNewsIds.value = []

      // Reload articles to get updated featured status
      await adminNewsStore.loadArticles()
    } else {
      toastStore.error('შეცდომა', result.error || 'რჩეული სიახლეების განახლება ვერ მოხერხდა')
    }
  } catch (err) {
    console.error('Error setting featured news:', err)
    toastStore.error('შეცდომა', 'რჩეული სიახლეების განახლება ვერ მოხერხდა')
  } finally {
    savingFeatured.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Clear any existing validation errors when loading the main view
  adminNewsStore.clearValidationErrors()
  adminNewsStore.clearError()

  adminNewsStore.loadArticles()
})

// Cleanup event listeners
onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom dropdown container styling */
.custom-dropdown-container {
  position: relative;
  z-index: 10;
}

/* Custom dropdown smooth animations */
.custom-dropdown-container button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-dropdown-container button:hover {
  transform: translateY(-1px);
  box-shadow:
    0 8px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

/* Dropdown options styling with enhanced animations */
.custom-dropdown-container div[class*='fixed'] {
  animation: dropdownFadeIn 0.2s ease-out;
  transform-origin: top;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Enhanced option hover effects */
.custom-dropdown-container button[class*='hover:bg-amber-50']:hover {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  transform: translateX(4px);
}

/* Mobile responsiveness for custom dropdown */
@media (max-width: 640px) {
  .custom-dropdown-container {
    width: 100%;
    min-width: 160px;
  }

  .custom-dropdown-container button {
    width: 100%;
    min-width: 160px;
  }
}
</style>
