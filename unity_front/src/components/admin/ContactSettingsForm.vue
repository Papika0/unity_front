<template>
  <div class="bg-white rounded-xl shadow-lg overflow-hidden">
    <!-- Toast Notifications -->
    <Teleport to="body">
      <div v-if="toastMessage" class="fixed top-4 right-4 z-50">
        <div
          :class="[
            'flex items-center p-4 rounded-lg shadow-xl transform transition-all duration-300',
            toastType === 'success'
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200',
          ]"
        >
          <svg
            v-if="toastType === 'success'"
            class="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
          <svg v-else class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="font-medium">{{ toastMessage }}</span>
        </div>
      </div>
    </Teleport>

    <!-- Loading State -->
    <div v-if="store.isLoading" class="flex flex-col items-center justify-center py-16">
      <div
        class="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"
      ></div>
      <p class="text-gray-600">კონტაქტის პარამეტრების ჩატვირთვა...</p>
    </div>

    <!-- Main Form -->
    <div v-else-if="store.data">
      <!-- Tab Navigation - Stylish Grid Layout -->
      <div
        class="bg-gradient-to-r from-gray-50 via-blue-50 to-purple-50 p-6 border-b border-gray-200"
      >
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            v-for="tab in availableTabs"
            :key="tab.id"
            :class="[
              'group relative flex flex-col items-center p-4 rounded-xl transition-all duration-300 transform hover:scale-105',
              store.currentTab === tab.id
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:text-gray-800 hover:bg-white hover:shadow-md border border-gray-200/50',
            ]"
            @click="store.setCurrentTab(tab.id)"
          >
            <!-- Icon with gradient background -->
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-all duration-300',
                store.currentTab === tab.id
                  ? 'bg-white/20'
                  : 'bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200',
              ]"
            >
              <i
                :class="[
                  'material-icons text-lg transition-colors duration-300',
                  store.currentTab === tab.id
                    ? 'text-white'
                    : 'text-blue-600 group-hover:text-purple-600',
                ]"
              >
                {{ tab.icon }}
              </i>
            </div>

            <!-- Tab name -->
            <span
              :class="[
                'text-xs font-medium text-center leading-tight transition-colors duration-300',
                store.currentTab === tab.id
                  ? 'text-white'
                  : 'text-gray-700 group-hover:text-gray-800',
              ]"
            >
              {{ tab.nameGeorgian }}
            </span>

            <!-- Active indicator -->
            <div
              v-if="store.currentTab === tab.id"
              class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-lg"
            ></div>
          </button>
        </div>
      </div>

      <!-- Form Content -->
      <div class="p-6">
        <!-- Contact Information Tab -->
        <div v-if="store.currentTab === 'contact_info'">
          <div class="mb-8">
            <h3 class="text-3xl font-bold text-gray-800 mb-4">კონტაქტის ინფორმაცია</h3>
            <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </div>

          <div class="space-y-8">
            <!-- Address -->
            <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h4 class="text-lg font-semibold text-gray-700 mb-6">
                მისამართი <span class="text-red-500">*</span>
              </h4>

              <!-- Address Value -->
              <div class="mb-6">
                <h5 class="text-md font-semibold text-gray-700 mb-3">მისამართი</h5>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600"
                        >მისამართი ქართულად</label
                      >
                    </div>
                    <input
                      v-model="store.data.contact_info.address.value.ka"
                      type="text"
                      placeholder="კომპანიის მისამართი"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600"
                        >მისამართი ინგლისურად</label
                      >
                      <button
                        v-if="store.data.contact_info.address.value.ka && !translating"
                        @click="handleTranslate('address', 'ka', 'en')"
                        type="button"
                        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                        :disabled="translating"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          ></path>
                        </svg>
                        თარგმნა
                      </button>
                    </div>
                    <input
                      v-model="store.data.contact_info.address.value.en"
                      type="text"
                      placeholder="Company address"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600"
                        >მისამართი რუსულად</label
                      >
                      <button
                        v-if="store.data.contact_info.address.value.ka && !translating"
                        @click="handleTranslate('address', 'ka', 'ru')"
                        type="button"
                        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                        :disabled="translating"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          ></path>
                        </svg>
                        თარგმნა
                      </button>
                    </div>
                    <input
                      v-model="store.data.contact_info.address.value.ru"
                      type="text"
                      placeholder="Адрес компании"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <!-- Address Subtitle -->
              <div>
                <h5 class="text-md font-semibold text-gray-700 mb-3">ქვეწარწერა</h5>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600"
                        >ქვეწარწერა ქართულად</label
                      >
                    </div>
                    <input
                      v-model="store.data.contact_info.address.subtitle.ka"
                      type="text"
                      placeholder="მისამართის ქვეწარწერა"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600"
                        >ქვეწარწერა ინგლისურად</label
                      >
                      <button
                        v-if="store.data.contact_info.address.subtitle.ka && !translating"
                        @click="handleTranslate('address_subtitle', 'ka', 'en')"
                        type="button"
                        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                        :disabled="translating"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          ></path>
                        </svg>
                        თარგმნა
                      </button>
                    </div>
                    <input
                      v-model="store.data.contact_info.address.subtitle.en"
                      type="text"
                      placeholder="Address subtitle"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600"
                        >ქვეწარწერა რუსულად</label
                      >
                      <button
                        v-if="store.data.contact_info.address.subtitle.ka && !translating"
                        @click="handleTranslate('address_subtitle', 'ka', 'ru')"
                        type="button"
                        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                        :disabled="translating"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          ></path>
                        </svg>
                        თარგმნა
                      </button>
                    </div>
                    <input
                      v-model="store.data.contact_info.address.subtitle.ru"
                      type="text"
                      placeholder="Подзаголовок адреса"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Phone Numbers -->
            <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h4 class="text-lg font-semibold text-gray-700 mb-4">
                ტელეფონი <span class="text-red-500">*</span>
              </h4>
              <div class="space-y-4">
                <!-- Phone 1 -->
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-2"
                    >ძირითადი ნომერი</label
                  >
                  <input
                    v-model="store.data.contact_info.phone.value"
                    type="tel"
                    placeholder="+995 577 300 333"
                    @input="store.markDirty()"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  />
                </div>
                <!-- Phone 2 -->
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-2"
                    >დამატებითი ნომერი</label
                  >
                  <input
                    v-model="store.data.contact_info.phone2.value"
                    type="tel"
                    placeholder="+995 555 123 456"
                    @input="store.markDirty()"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  />
                </div>
                <!-- Phone Subtitles -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600"
                        >ქვეწარწერა ქართულად</label
                      >
                    </div>
                    <input
                      v-model="store.data.contact_info.phone.subtitle.ka"
                      type="text"
                      placeholder="ტელეფონის ქვეწარწერა"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600"
                        >ქვეწარწერა ინგლისურად</label
                      >
                      <button
                        v-if="store.data.contact_info.phone.subtitle.ka && !translating"
                        @click="handleTranslate('phone_subtitle', 'ka', 'en')"
                        type="button"
                        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
                        :disabled="translating"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          ></path>
                        </svg>
                        თარგმნა
                      </button>
                    </div>
                    <input
                      v-model="store.data.contact_info.phone.subtitle.en"
                      type="text"
                      placeholder="Phone subtitle"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600"
                        >ქვეწარწერა რუსულად</label
                      >
                      <button
                        v-if="store.data.contact_info.phone.subtitle.ka && !translating"
                        @click="handleTranslate('phone_subtitle', 'ka', 'ru')"
                        type="button"
                        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
                        :disabled="translating"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          ></path>
                        </svg>
                        თარგმნა
                      </button>
                    </div>
                    <input
                      v-model="store.data.contact_info.phone.subtitle.ru"
                      type="text"
                      placeholder="Подзаголовок телефона"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Email -->
            <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h4 class="text-lg font-semibold text-gray-700 mb-4">
                ელ. ფოსტა <span class="text-red-500">*</span>
              </h4>
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-600 mb-2"
                  >ელ. ფოსტის მისამართი</label
                >
                <input
                  v-model="store.data.contact_info.email.value"
                  type="email"
                  placeholder="info@company.com"
                  @input="store.markDirty()"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-600"
                      >ქვეწარწერა ქართულად</label
                    >
                  </div>
                  <input
                    v-model="store.data.contact_info.email.subtitle.ka"
                    type="text"
                    placeholder="ელ. ფოსტის ქვეწარწერა"
                    @input="store.markDirty()"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  />
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-600"
                      >ქვეწარწერა ინგლისურად</label
                    >
                    <button
                      v-if="store.data.contact_info.email.subtitle.ka && !translating"
                      @click="handleTranslate('email_subtitle', 'ka', 'en')"
                      type="button"
                      class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all"
                      :disabled="translating"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        ></path>
                      </svg>
                      თარგმნა
                    </button>
                  </div>
                  <input
                    v-model="store.data.contact_info.email.subtitle.en"
                    type="text"
                    placeholder="Email subtitle"
                    @input="store.markDirty()"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  />
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-600"
                      >ქვეწარწერა რუსულად</label
                    >
                    <button
                      v-if="store.data.contact_info.email.subtitle.ka && !translating"
                      @click="handleTranslate('email_subtitle', 'ka', 'ru')"
                      type="button"
                      class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-all"
                      :disabled="translating"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        ></path>
                      </svg>
                      თარგმნა
                    </button>
                  </div>
                  <input
                    v-model="store.data.contact_info.email.subtitle.ru"
                    type="text"
                    placeholder="Подзаголовок email"
                    @input="store.markDirty()"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  />
                </div>
              </div>
            </div>

            <!-- Hours -->
            <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h4 class="text-lg font-semibold text-gray-700 mb-6">სამუშაო საათები</h4>

              <!-- Hours Value -->
              <div class="mb-6">
                <h5 class="text-md font-semibold text-gray-700 mb-3">საათები</h5>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600"
                        >საათები ქართულად</label
                      >
                    </div>
                    <input
                      v-model="store.data.contact_info.hours.value.ka"
                      type="text"
                      placeholder="ორშ-პარ 9:00-18:00"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600"
                        >საათები ინგლისურად</label
                      >
                      <button
                        v-if="store.data.contact_info.hours.value.ka && !translating"
                        @click="handleTranslate('hours_value', 'ka', 'en')"
                        type="button"
                        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
                        :disabled="translating"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          ></path>
                        </svg>
                        თარგმნა
                      </button>
                    </div>
                    <input
                      v-model="store.data.contact_info.hours.value.en"
                      type="text"
                      placeholder="Mon-Fri 9:00-18:00"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600">საათები რუსულად</label>
                      <button
                        v-if="store.data.contact_info.hours.value.ka && !translating"
                        @click="handleTranslate('hours_value', 'ka', 'ru')"
                        type="button"
                        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
                        :disabled="translating"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          ></path>
                        </svg>
                        თარგმნა
                      </button>
                    </div>
                    <input
                      v-model="store.data.contact_info.hours.value.ru"
                      type="text"
                      placeholder="Пн-Пт 9:00-18:00"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <!-- Hours Subtitle -->
              <div>
                <h5 class="text-md font-semibold text-gray-700 mb-3">ქვეწარწერა</h5>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600"
                        >ქვეწარწერა ქართულად</label
                      >
                    </div>
                    <input
                      v-model="store.data.contact_info.hours.subtitle.ka"
                      type="text"
                      placeholder="საათების ქვეწარწერა"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600"
                        >ქვეწარწერა ინგლისურად</label
                      >
                      <button
                        v-if="store.data.contact_info.hours.subtitle.ka && !translating"
                        @click="handleTranslate('hours_subtitle', 'ka', 'en')"
                        type="button"
                        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
                        :disabled="translating"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          ></path>
                        </svg>
                        თარგმნა
                      </button>
                    </div>
                    <input
                      v-model="store.data.contact_info.hours.subtitle.en"
                      type="text"
                      placeholder="Hours subtitle"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600"
                        >ქვეწარწერა რუსულად</label
                      >
                      <button
                        v-if="store.data.contact_info.hours.subtitle.ka && !translating"
                        @click="handleTranslate('hours_subtitle', 'ka', 'ru')"
                        type="button"
                        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-all"
                        :disabled="translating"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 716.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          ></path>
                        </svg>
                        თარგმნა
                      </button>
                    </div>
                    <input
                      v-model="store.data.contact_info.hours.subtitle.ru"
                      type="text"
                      placeholder="Подзаголовок часов"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Social Links Tab -->
        <div v-if="store.currentTab === 'social_links'">
          <h3 class="text-3xl font-bold text-gray-800 mb-8 pb-4 relative">სოციალური ბმულები</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">Facebook URL</label>
              <input
                v-model="store.data.social_links.facebook"
                type="url"
                placeholder="https://facebook.com/company"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">Instagram URL</label>
              <input
                v-model="store.data.social_links.instagram"
                type="url"
                placeholder="https://instagram.com/company"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
          </div>
        </div>

        <!-- Map Settings Tab -->
        <div v-if="store.currentTab === 'map_settings'">
          <h3 class="text-3xl font-bold text-gray-800 mb-8 pb-4 relative">რუკის კონფიგურაცია</h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">
                განედი (Latitude) <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="store.data.map_settings.latitude"
                type="number"
                step="0.000001"
                placeholder="41.7151"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">
                გრძედი (Longitude) <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="store.data.map_settings.longitude"
                type="number"
                step="0.000001"
                placeholder="44.8271"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">ზუმის დონე</label>
              <input
                v-model.number="store.data.map_settings.zoom"
                type="number"
                min="1"
                max="20"
                placeholder="15"
                @input="store.markDirty()"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
              />
            </div>
          </div>
        </div>

        <!-- Form Subjects Tab -->
        <div v-if="store.currentTab === 'form_subjects'">
          <h3 class="text-3xl font-bold text-gray-800 mb-8 pb-4 relative">ფორმის თემები</h3>

          <div class="space-y-4">
            <div
              v-for="(subject, index) in store.data.form_subjects"
              :key="index"
              class="bg-gray-50 rounded-lg p-6 border border-gray-200"
            >
              <div class="flex justify-between items-center mb-4">
                <h4 class="text-lg font-semibold text-gray-700">თემა #{{ index + 1 }}</h4>
                <button
                  type="button"
                  @click="removeFormSubject(index)"
                  class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  წაშლა
                </button>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-600 mb-2"
                  >მნიშვნელობა (ღირებულება)</label
                >
                <input
                  v-model="subject.value"
                  type="text"
                  placeholder="contact_general"
                  @input="store.markDirty()"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-600">სახელი ქართულად</label>
                  </div>
                  <input
                    v-model="subject.label.ka"
                    type="text"
                    placeholder="ზოგადი კონტაქტი"
                    @input="store.markDirty()"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  />
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-600">სახელი ინგლისურად</label>
                    <button
                      v-if="subject.label.ka && !translating"
                      @click="handleTranslate('form_subject_label', 'ka', 'en', index)"
                      type="button"
                      class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                      :disabled="translating"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        ></path>
                      </svg>
                      თარგმნა
                    </button>
                  </div>
                  <input
                    v-model="subject.label.en"
                    type="text"
                    placeholder="General Contact"
                    @input="store.markDirty()"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  />
                </div>
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-sm font-medium text-gray-600">სახელი რუსულად</label>
                    <button
                      v-if="subject.label.ka && !translating"
                      @click="handleTranslate('form_subject_label', 'ka', 'ru', index)"
                      type="button"
                      class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-all"
                      :disabled="translating"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 716.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                        ></path>
                      </svg>
                      თარგმნა
                    </button>
                  </div>
                  <input
                    v-model="subject.label.ru"
                    type="text"
                    placeholder="Общий контакт"
                    @input="store.markDirty()"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              @click="addFormSubject"
              class="w-full px-6 py-3 bg-blue-50 text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
            >
              + ახალი თემის დამატება
            </button>
          </div>
        </div>

        <!-- FAQs Tab -->
        <div v-if="store.currentTab === 'faqs'">
          <h3 class="text-3xl font-bold text-gray-800 mb-8 pb-4 relative">ხშირი კითხვები</h3>

          <div class="space-y-4">
            <div
              v-for="(faq, index) in store.data.faqs"
              :key="index"
              class="bg-gray-50 rounded-lg p-6 border border-gray-200"
            >
              <div class="flex justify-between items-center mb-4">
                <h4 class="text-lg font-semibold text-gray-700">კითხვა #{{ index + 1 }}</h4>
                <button
                  type="button"
                  @click="removeFaq(index)"
                  class="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  წაშლა
                </button>
              </div>

              <!-- Question Fields -->
              <div class="mb-6">
                <h5 class="text-md font-semibold text-gray-700 mb-3">კითხვა</h5>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600">კითხვა ქართულად</label>
                    </div>
                    <input
                      v-model="faq.question.ka"
                      type="text"
                      placeholder="რა არის თქვენი სერვისი?"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600"
                        >კითხვა ინგლისურად</label
                      >
                      <button
                        v-if="faq.question.ka && !translating"
                        @click="handleTranslate('faq_question', 'ka', 'en', index)"
                        type="button"
                        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all"
                        :disabled="translating"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 716.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          ></path>
                        </svg>
                        თარგმნა
                      </button>
                    </div>
                    <input
                      v-model="faq.question.en"
                      type="text"
                      placeholder="What is your service?"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600">კითხვა რუსულად</label>
                      <button
                        v-if="faq.question.ka && !translating"
                        @click="handleTranslate('faq_question', 'ka', 'ru', index)"
                        type="button"
                        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all"
                        :disabled="translating"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 716.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          ></path>
                        </svg>
                        თარგმნა
                      </button>
                    </div>
                    <input
                      v-model="faq.question.ru"
                      type="text"
                      placeholder="Что такое ваш сервис?"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <!-- Answer Fields -->
              <div>
                <h5 class="text-md font-semibold text-gray-700 mb-3">პასუხი</h5>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600">პასუხი ქართულად</label>
                    </div>
                    <textarea
                      v-model="faq.answer.ka"
                      placeholder="დეტალური პასუხი კითხვაზე..."
                      rows="4"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-900"
                    ></textarea>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600"
                        >პასუხი ინგლისურად</label
                      >
                      <button
                        v-if="faq.answer.ka && !translating"
                        @click="handleTranslate('faq_answer', 'ka', 'en', index)"
                        type="button"
                        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all"
                        :disabled="translating"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 716.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          ></path>
                        </svg>
                        თარგმნა
                      </button>
                    </div>
                    <textarea
                      v-model="faq.answer.en"
                      placeholder="Detailed answer to the question..."
                      rows="4"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-900"
                    ></textarea>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-medium text-gray-600">პასუხი რუსულად</label>
                      <button
                        v-if="faq.answer.ka && !translating"
                        @click="handleTranslate('faq_answer', 'ka', 'ru', index)"
                        type="button"
                        class="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-all"
                        :disabled="translating"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 716.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                          ></path>
                        </svg>
                        თარგმნა
                      </button>
                    </div>
                    <textarea
                      v-model="faq.answer.ru"
                      placeholder="Подробный ответ на вопрос..."
                      rows="4"
                      @input="store.markDirty()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-900"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              @click="addFaq"
              class="w-full px-6 py-3 bg-blue-50 text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
            >
              + ახალი კითხვის დამატება
            </button>
          </div>
        </div>

        <!-- Office Days Tab -->
        <div v-if="store.currentTab === 'office_days'">
          <h3 class="text-3xl font-bold text-gray-800 mb-8 pb-4 relative">
            ოფისის მუშაობის განრიგი
          </h3>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 class="text-lg font-semibold text-gray-700 mb-4">სამუშაო დღეები</h4>
              <div class="space-y-3">
                <label
                  v-for="(day, index) in weekDays[currentLanguage]"
                  :key="`working-${index}`"
                  class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    :checked="store.data?.office_days?.working.includes(dayMapping[index])"
                    @change="toggleWorkingDay(dayMapping[index])"
                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="ml-3 font-medium text-gray-800">{{ day }}</span>
                </label>
              </div>
            </div>

            <div>
              <h4 class="text-lg font-semibold text-gray-700 mb-4">დასვენების დღეები</h4>
              <div class="space-y-3">
                <label
                  v-for="(day, index) in weekDays[currentLanguage]"
                  :key="`weekend-${index}`"
                  class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    :checked="store.data?.office_days?.weekend.includes(dayMapping[index])"
                    @change="toggleWeekendDay(dayMapping[index])"
                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="ml-3 font-medium text-gray-800">{{ day }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Language Selector for Days Display -->
          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <label class="block text-sm font-medium text-gray-600 mb-2">დღეების ჩვენების ენა</label>
            <select
              v-model="currentLanguage"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="ka">ქართული</option>
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-4">
        <button
          type="button"
          :disabled="!store.isDirty"
          @click="store.resetForm()"
          class="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          ცვლილებების გაუქმება
        </button>

        <button
          type="button"
          :disabled="!store.canSave"
          @click="handleSave"
          class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          <span v-if="store.isSaving">შენახვა...</span>
          <span v-else>ცვლილებების შენახვა</span>
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="text-center py-16">
      <p class="text-gray-600 mb-4">კონტაქტის პარამეტრების ჩატვირთვა ვერ მოხერხდა.</p>
      <button
        @click="store.loadSettings()"
        class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        ხელახლა ცდა
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useContactSettingsAdminStore } from '@/stores/admin/contactSettings'
import { Translator } from '@/utils/translator'

const store = useContactSettingsAdminStore()

// Toast notification state
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// Translation state
const translating = ref(false)

// Current language for day names display
const currentLanguage = ref<'ka' | 'en' | 'ru'>('ka')

// Multilingual week days
const weekDays = {
  ka: ['ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი', 'კვირა'],
  en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  ru: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
}

// Day name mapping (index to backend day codes)
const dayMapping = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const availableTabs = computed(() => [
  { id: 'contact_info', nameGeorgian: 'კონტაქტი', icon: 'contact_mail' },
  { id: 'social_links', nameGeorgian: 'სოც. ბმულები', icon: 'share' },
  { id: 'map_settings', nameGeorgian: 'რუკა', icon: 'map' },
  { id: 'form_subjects', nameGeorgian: 'ფორმა', icon: 'list' },
  { id: 'faqs', nameGeorgian: 'კითხვები', icon: 'help' },
  { id: 'office_days', nameGeorgian: 'განრიგი', icon: 'schedule' },
])

onMounted(() => {
  if (!store.data) {
    store.loadSettings()
  }
})

// Toast notification function
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

// Translation function
async function handleTranslate(
  fieldName: string,
  fromLang: string,
  toLang: string,
  index?: number,
) {
  if (translating.value || !store.data) return

  // Get the multilingual field from the nested structure
  let field: Record<string, string> | null = null

  // Handle different field paths in the contact info structure
  if (fieldName === 'address') {
    field = store.data.contact_info.address.value
  } else if (fieldName === 'address_subtitle') {
    field = store.data.contact_info.address.subtitle
  } else if (fieldName === 'phone_subtitle') {
    field = store.data.contact_info.phone.subtitle
  } else if (fieldName === 'email_subtitle') {
    field = store.data.contact_info.email.subtitle
  } else if (fieldName === 'hours_value') {
    field = store.data.contact_info.hours.value
  } else if (fieldName === 'hours_subtitle') {
    field = store.data.contact_info.hours.subtitle
  } else if (fieldName === 'form_subject_label' && typeof index === 'number') {
    field = store.data.form_subjects[index]?.label
  } else if (fieldName === 'faq_question' && typeof index === 'number') {
    field = store.data.faqs[index]?.question
  } else if (fieldName === 'faq_answer' && typeof index === 'number') {
    field = store.data.faqs[index]?.answer
  }

  if (!field) return

  const sourceText = field[fromLang]
  if (!sourceText) return

  try {
    translating.value = true
    const translatedText = await Translator.translate(sourceText, fromLang, toLang)
    field[toLang] = translatedText
    store.markDirty()
  } catch (error) {
    console.error('Translation failed:', error)
    showToast('თარგმნა ვერ მოხერხდა', 'error')
  } finally {
    translating.value = false
  }
}

// Validate required fields
const validateForm = (): boolean => {
  if (!store.data) return false

  const errors: string[] = []

  // Check required contact info fields
  if (!store.data.contact_info.address.value.ka) {
    errors.push('მისამართი (ქართული) აუცილებელია')
  }
  if (!store.data.contact_info.phone.value) {
    errors.push('ტელეფონის ნომერი აუცილებელია')
  }
  if (!store.data.contact_info.email.value) {
    errors.push('ელ. ფოსტა აუცილებელია')
  }

  // Check map settings
  if (!store.data.map_settings.latitude) {
    errors.push('რუკის განედი აუცილებელია')
  }
  if (!store.data.map_settings.longitude) {
    errors.push('რუკის გრძედი აუცილებელია')
  }

  if (errors.length > 0) {
    showToast(errors[0], 'error')
    return false
  }

  return true
}

const handleSave = async () => {
  if (!validateForm()) return

  const success = await store.saveSettings()
  if (success) {
    showToast('პარამეტრები წარმატებით შეინახა', 'success')
  } else {
    showToast('პარამეტრების შენახვა ვერ მოხერხდა', 'error')
  }
}

// Form Subjects functions
const addFormSubject = () => {
  if (!store.data) return
  store.data.form_subjects.push({ value: '', label: { ka: '', en: '', ru: '' } })
  store.markDirty()
}

const removeFormSubject = (index: number) => {
  if (!store.data) return
  store.data.form_subjects.splice(index, 1)
  store.markDirty()
}

// FAQ functions
const addFaq = () => {
  if (!store.data) return
  store.data.faqs.push({
    question: { ka: '', en: '', ru: '' },
    answer: { ka: '', en: '', ru: '' },
  })
  store.markDirty()
}

const removeFaq = (index: number) => {
  if (!store.data) return
  store.data.faqs.splice(index, 1)
  store.markDirty()
}

// Office Days functions
const toggleWorkingDay = (dayStr: string) => {
  if (!store.data?.office_days) return

  const index = store.data.office_days.working.indexOf(dayStr)
  if (index > -1) {
    store.data.office_days.working.splice(index, 1)
  } else {
    store.data.office_days.working.push(dayStr)
  }
  store.markDirty()
}

const toggleWeekendDay = (dayStr: string) => {
  if (!store.data?.office_days) return

  const index = store.data.office_days.weekend.indexOf(dayStr)
  if (index > -1) {
    store.data.office_days.weekend.splice(index, 1)
  } else {
    store.data.office_days.weekend.push(dayStr)
  }
  store.markDirty()
}
</script>

<style scoped>
/* Enhanced Tab Navigation Effects */
.group:hover .material-icons {
  transform: scale(1.1);
}

/* Smooth backdrop blur effect */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Custom gradient animations */
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.bg-gradient-to-br {
  background-size: 200% 200%;
  animation: gradientShift 6s ease infinite;
}

/* Enhanced shadow effects */
.shadow-blue-500\/25 {
  box-shadow:
    0 10px 25px -3px rgba(59, 130, 246, 0.25),
    0 4px 6px -2px rgba(59, 130, 246, 0.1);
}

/* Smooth scale transitions */
.transform {
  will-change: transform;
}

/* Icon container enhancement */
.group .material-icons {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Active tab pulse effect */
@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }
  50% {
    box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.3);
  }
}

.bg-gradient-to-br.text-white {
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Responsive text scaling */
@media (max-width: 768px) {
  .text-xs {
    font-size: 0.7rem;
    line-height: 0.9rem;
  }
}

/* Enhanced hover effects */
.group:hover {
  transform: translateY(-2px) scale(1.05);
}

.group:active {
  transform: translateY(0) scale(1.02);
}
</style>
