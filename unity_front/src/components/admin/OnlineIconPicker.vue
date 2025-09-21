<template>
  <div class="online-icon-picker">
    <!-- Search Input with Icon Preview -->
    <div class="relative">
      <div
        class="flex items-center gap-3 p-3 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white"
      >
        <!-- Selected Icon Preview -->
        <div v-if="selectedIcon" class="flex items-center gap-2">
          <div
            class="w-8 h-8 rounded-md flex items-center justify-center text-white text-sm font-medium"
            :class="selectedIcon.color || 'bg-gradient-to-r from-blue-500 to-cyan-500'"
          >
            <span class="emoji-icon">{{ selectedIcon.emoji }}</span>
          </div>
          <span class="text-sm text-gray-700 font-medium">{{ selectedIcon.name }}</span>
          <button
            @click="clearSelection"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            title="წაშლა"
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

        <!-- Search Input -->
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="selectedIcon ? 'ძებნა სხვა ხატულისთვის...' : placeholder"
          class="flex-1 border-0 outline-none text-gray-900 placeholder-gray-400"
          @input="searchIcons"
          @focus="showPicker = true"
        />

        <!-- Search Icon -->
        <div class="text-gray-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4"
    >
      <div class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        <span class="ml-2 text-gray-600">ძებნა ხატულების...</span>
      </div>
    </div>

    <!-- Icon Picker Dropdown -->
    <div
      v-if="showPicker && !isLoading"
      class="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
    >
      <!-- Header -->
      <div class="p-3 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium text-gray-900">აირჩიეთ ხატულა</h3>
          <button @click="showPicker = false" class="text-gray-400 hover:text-gray-600">
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
        <p class="text-xs text-gray-500 mt-1">ძებნა ხატულების ონლაინ ბიბლიოთეკებში</p>
      </div>

      <!-- Search Results -->
      <div class="p-3">
        <!-- Popular Icons (when no search) -->
        <div v-if="!searchQuery.trim()" class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 mb-2">პოპულარული ხატულები</h4>
          <div class="grid grid-cols-8 gap-2">
            <button
              v-for="icon in popularIcons"
              :key="icon.name"
              @click="selectIcon(icon)"
              class="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all hover:scale-110 bg-gradient-to-br from-gray-50 to-gray-100"
              :title="icon.name"
            >
              <span class="emoji-icon large">{{ icon.emoji }}</span>
            </button>
          </div>
        </div>

        <!-- Search Results -->
        <div v-else>
          <h4 class="text-sm font-medium text-gray-700 mb-2">
            შედეგები "{{ searchQuery }}"-ისთვის
          </h4>

          <!-- Icons Grid -->
          <div v-if="searchResults.length > 0" class="grid grid-cols-8 gap-2">
            <button
              v-for="icon in searchResults"
              :key="icon.name"
              @click="selectIcon(icon)"
              :class="[
                'w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-all hover:scale-110',
                selectedIcon?.name === icon.name
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100',
              ]"
              :title="icon.name"
            >
              <span class="emoji-icon large">{{ icon.emoji }}</span>
            </button>
          </div>

          <!-- No Results -->
          <div v-else class="text-center py-8 text-gray-500">
            <svg
              class="w-12 h-12 mx-auto mb-2 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.57M15 6.75a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p>ხატულა ვერ მოიძებნა</p>
            <p class="text-xs mt-1">სცადეთ სხვა საძიებო სიტყვა</p>
          </div>
        </div>

        <!-- Icon Sources -->
        <div class="mt-4 pt-3 border-t border-gray-100">
          <p class="text-xs text-gray-500 text-center">
            ხატულები მოწოდებულია
            <a href="https://emojipedia.org" target="_blank" class="text-blue-500 hover:underline"
              >Emojipedia</a
            >
            -ის მიერ
          </p>
        </div>
      </div>
    </div>

    <!-- Overlay -->
    <div v-if="showPicker" @click="showPicker = false" class="fixed inset-0 z-40"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Icon {
  name: string
  emoji: string
  category: string
  keywords: string[]
  color?: string
}

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'icon-selected': [icon: Icon]
}>()

const showPicker = ref(false)
const searchQuery = ref('')
const isLoading = ref(false)
const searchResults = ref<Icon[]>([])
const selectedIcon = ref<Icon | null>(null)

// Popular icons for quick access
const popularIcons: Icon[] = [
  {
    name: 'location',
    emoji: '📍',
    category: 'მდებარეობა',
    keywords: ['location', 'place', 'pin'],
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  },
  {
    name: 'building',
    emoji: '🏢',
    category: 'მდებარეობა',
    keywords: ['building', 'office', 'structure'],
    color: 'bg-gradient-to-r from-slate-500 to-gray-600',
  },
  {
    name: 'security',
    emoji: '🔒',
    category: 'უსაფრთხოება',
    keywords: ['security', 'lock', 'safety'],
    color: 'bg-gradient-to-r from-red-500 to-rose-500',
  },
  {
    name: 'quality',
    emoji: '⭐',
    category: 'ხარისხი',
    keywords: ['quality', 'star', 'excellent'],
    color: 'bg-gradient-to-r from-amber-500 to-orange-500',
  },
  {
    name: 'parking',
    emoji: '🅿️',
    category: 'ტრანსპორტი',
    keywords: ['parking', 'car', 'vehicle'],
    color: 'bg-gradient-to-r from-gray-500 to-slate-500',
  },
  {
    name: 'wifi',
    emoji: '📶',
    category: 'ტექნოლოგია',
    keywords: ['wifi', 'internet', 'connection'],
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
  },
  {
    name: 'money',
    emoji: '💰',
    category: 'კომერცია',
    keywords: ['money', 'finance', 'business'],
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
  },
  {
    name: 'heart',
    emoji: '❤️',
    category: 'ხარისხი',
    keywords: ['heart', 'love', 'quality'],
    color: 'bg-gradient-to-r from-red-500 to-pink-500',
  },
  {
    name: 'fire',
    emoji: '🔥',
    category: 'ხარისხი',
    keywords: ['fire', 'hot', 'trending'],
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
  },
  {
    name: 'diamond',
    emoji: '💎',
    category: 'ხარისხი',
    keywords: ['diamond', 'luxury', 'premium'],
    color: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  },
  {
    name: 'crown',
    emoji: '👑',
    category: 'ხარისხი',
    keywords: ['crown', 'royal', 'luxury'],
    color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
  },
  {
    name: 'trophy',
    emoji: '🏆',
    category: 'ხარისხი',
    keywords: ['trophy', 'award', 'achievement'],
    color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
  },
  {
    name: 'shield',
    emoji: '🛡️',
    category: 'უსაფრთხოება',
    keywords: ['shield', 'protection', 'security'],
    color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
  },
  {
    name: 'camera',
    emoji: '📹',
    category: 'უსაფრთხოება',
    keywords: ['camera', 'surveillance', 'monitoring'],
    color: 'bg-gradient-to-r from-gray-600 to-slate-700',
  },
  {
    name: 'alarm',
    emoji: '🚨',
    category: 'უსაფრთხოება',
    keywords: ['alarm', 'alert', 'warning'],
    color: 'bg-gradient-to-r from-red-500 to-red-600',
  },
  {
    name: 'car',
    emoji: '🚗',
    category: 'ტრანსპორტი',
    keywords: ['car', 'vehicle', 'transport'],
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  },
  {
    name: 'bus',
    emoji: '🚌',
    category: 'ტრანსპორტი',
    keywords: ['bus', 'public', 'transport'],
    color: 'bg-gradient-to-r from-green-500 to-teal-500',
  },
  {
    name: 'metro',
    emoji: '🚇',
    category: 'ტრანსპორტი',
    keywords: ['metro', 'subway', 'underground'],
    color: 'bg-gradient-to-r from-slate-600 to-gray-700',
  },
  {
    name: 'bike',
    emoji: '🚲',
    category: 'ტრანსპორტი',
    keywords: ['bike', 'bicycle', 'cycling'],
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
  },
  {
    name: 'hospital',
    emoji: '🏥',
    category: 'ინფრასტრუქტურა',
    keywords: ['hospital', 'medical', 'health'],
    color: 'bg-gradient-to-r from-red-500 to-pink-500',
  },
  {
    name: 'school',
    emoji: '🏫',
    category: 'ინფრასტრუქტურა',
    keywords: ['school', 'education', 'learning'],
    color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
  },
  {
    name: 'bank',
    emoji: '🏦',
    category: 'ინფრასტრუქტურა',
    keywords: ['bank', 'finance', 'money'],
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
  },
  {
    name: 'shopping',
    emoji: '🛒',
    category: 'ინფრასტრუქტურა',
    keywords: ['shopping', 'store', 'retail'],
    color: 'bg-gradient-to-r from-orange-500 to-amber-500',
  },
  {
    name: 'restaurant',
    emoji: '🍽️',
    category: 'ინფრასტრუქტურა',
    keywords: ['restaurant', 'food', 'dining'],
    color: 'bg-gradient-to-r from-amber-500 to-orange-500',
  },
]

// Comprehensive emoji database for search
const emojiDatabase: Icon[] = [
  // Location & Navigation
  {
    name: 'location',
    emoji: '📍',
    category: 'მდებარეობა',
    keywords: ['location', 'place', 'pin', 'map', 'address', 'მდებარეობა'],
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  },
  {
    name: 'map',
    emoji: '🗺️',
    category: 'მდებარეობა',
    keywords: ['map', 'navigation', 'route', 'direction', 'რუკა'],
    color: 'bg-gradient-to-r from-green-500 to-teal-500',
  },
  {
    name: 'compass',
    emoji: '🧭',
    category: 'მდებარეობა',
    keywords: ['compass', 'direction', 'navigation', 'bearing', 'კომპასი'],
    color: 'bg-gradient-to-r from-amber-500 to-orange-500',
  },
  {
    name: 'globe',
    emoji: '🌍',
    category: 'მდებარეობა',
    keywords: ['globe', 'world', 'global', 'earth', 'მსოფლიო'],
    color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
  },
  {
    name: 'building',
    emoji: '🏢',
    category: 'მდებარეობა',
    keywords: ['building', 'office', 'structure', 'architecture', 'შენობა'],
    color: 'bg-gradient-to-r from-slate-500 to-gray-600',
  },
  {
    name: 'home',
    emoji: '🏠',
    category: 'მდებარეობა',
    keywords: ['home', 'house', 'residence', 'dwelling', 'სახლი'],
    color: 'bg-gradient-to-r from-amber-500 to-orange-500',
  },
  {
    name: 'city',
    emoji: '🏙️',
    category: 'მდებარეობა',
    keywords: ['city', 'urban', 'metropolis', 'skyline', 'ქალაქი'],
    color: 'bg-gradient-to-r from-slate-600 to-gray-700',
  },
  {
    name: 'mountain',
    emoji: '🏔️',
    category: 'მდებარეობა',
    keywords: ['mountain', 'hill', 'peak', 'altitude', 'მთა'],
    color: 'bg-gradient-to-r from-gray-500 to-slate-600',
  },
  {
    name: 'beach',
    emoji: '🏖️',
    category: 'მდებარეობა',
    keywords: ['beach', 'coast', 'shore', 'sea', 'ზღვა'],
    color: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  },

  // Security & Safety
  {
    name: 'security',
    emoji: '🔒',
    category: 'უსაფრთხოება',
    keywords: ['security', 'lock', 'safety', 'protection', 'უსაფრთხოება'],
  },
  {
    name: 'shield',
    emoji: '🛡️',
    category: 'უსაფრთხოება',
    keywords: ['shield', 'protection', 'defense', 'security', 'დაცვა'],
  },
  {
    name: 'camera',
    emoji: '📹',
    category: 'უსაფრთხოება',
    keywords: ['camera', 'surveillance', 'monitoring', 'security', 'კამერა'],
  },
  {
    name: 'alarm',
    emoji: '🚨',
    category: 'უსაფრთხოება',
    keywords: ['alarm', 'alert', 'warning', 'emergency', 'განგაში'],
  },
  {
    name: 'fire',
    emoji: '🔥',
    category: 'უსაფრთხოება',
    keywords: ['fire', 'safety', 'emergency', 'protection', 'ცეცხლი'],
  },
  {
    name: 'police',
    emoji: '👮',
    category: 'უსაფრთხოება',
    keywords: ['police', 'law', 'enforcement', 'security', 'პოლიცია'],
  },
  {
    name: 'key',
    emoji: '🗝️',
    category: 'უსაფრთხოება',
    keywords: ['key', 'access', 'security', 'lock', 'გასაღები'],
  },
  {
    name: 'guard',
    emoji: '🛡️',
    category: 'უსაფრთხოება',
    keywords: ['guard', 'security', 'protection', 'watch', 'დაცვა'],
  },

  // Quality & Luxury
  {
    name: 'quality',
    emoji: '⭐',
    category: 'ხარისხი',
    keywords: ['quality', 'star', 'excellent', 'premium', 'ხარისხი'],
  },
  {
    name: 'diamond',
    emoji: '💎',
    category: 'ხარისხი',
    keywords: ['diamond', 'luxury', 'premium', 'quality', 'ბრილიანტი'],
  },
  {
    name: 'crown',
    emoji: '👑',
    category: 'ხარისხი',
    keywords: ['crown', 'royal', 'luxury', 'premium', 'გვირგვინი'],
  },
  {
    name: 'trophy',
    emoji: '🏆',
    category: 'ხარისხი',
    keywords: ['trophy', 'award', 'achievement', 'excellence', 'ტროფეი'],
  },
  {
    name: 'medal',
    emoji: '🏅',
    category: 'ხარისხი',
    keywords: ['medal', 'award', 'recognition', 'achievement', 'მედალი'],
  },
  {
    name: 'gem',
    emoji: '💠',
    category: 'ხარისხი',
    keywords: ['gem', 'jewel', 'precious', 'luxury', 'ძვირფასი'],
  },
  {
    name: 'heart',
    emoji: '❤️',
    category: 'ხარისხი',
    keywords: ['heart', 'love', 'quality', 'care', 'სიყვარული'],
  },
  {
    name: 'sparkles',
    emoji: '✨',
    category: 'ხარისხი',
    keywords: ['sparkles', 'shine', 'quality', 'excellent', 'ბრწყინვალება'],
  },

  // Transportation
  {
    name: 'parking',
    emoji: '🅿️',
    category: 'ტრანსპორტი',
    keywords: ['parking', 'car', 'vehicle', 'space', 'პარკინგი'],
  },
  {
    name: 'car',
    emoji: '🚗',
    category: 'ტრანსპორტი',
    keywords: ['car', 'vehicle', 'automobile', 'transport', 'მანქანა'],
  },
  {
    name: 'bus',
    emoji: '🚌',
    category: 'ტრანსპორტი',
    keywords: ['bus', 'public', 'transport', 'transit', 'ავტობუსი'],
  },
  {
    name: 'metro',
    emoji: '🚇',
    category: 'ტრანსპორტი',
    keywords: ['metro', 'subway', 'underground', 'train', 'მეტრო', 'მეტროპოლიტენი'],
    color: 'bg-gradient-to-r from-slate-600 to-gray-700',
  },
  {
    name: 'train',
    emoji: '🚆',
    category: 'ტრანსპორტი',
    keywords: ['train', 'railway', 'metro', 'subway', 'მატარებელი', 'მეტრო'],
    color: 'bg-gradient-to-r from-blue-600 to-indigo-600',
  },
  {
    name: 'railway',
    emoji: '🚊',
    category: 'ტრანსპორტი',
    keywords: ['railway', 'tram', 'metro', 'transport', 'რელსები', 'მეტრო'],
    color: 'bg-gradient-to-r from-green-600 to-emerald-600',
  },
  {
    name: 'bike',
    emoji: '🚲',
    category: 'ტრანსპორტი',
    keywords: ['bike', 'bicycle', 'cycling', 'transport', 'ველოსიპედი'],
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
  },
  {
    name: 'walking',
    emoji: '🚶',
    category: 'ტრანსპორტი',
    keywords: ['walking', 'pedestrian', 'foot', 'walk', 'ფეხით'],
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  },
  {
    name: 'taxi',
    emoji: '🚕',
    category: 'ტრანსპორტი',
    keywords: ['taxi', 'cab', 'transport', 'ride', 'ტაქსი'],
    color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
  },
  {
    name: 'airplane',
    emoji: '✈️',
    category: 'ტრანსპორტი',
    keywords: ['airplane', 'flight', 'travel', 'airport', 'თვითმფრინავი'],
    color: 'bg-gradient-to-r from-sky-500 to-blue-500',
  },

  // Infrastructure
  {
    name: 'infrastructure',
    emoji: '🏗️',
    category: 'ინფრასტრუქტურა',
    keywords: ['infrastructure', 'construction', 'development', 'building', 'ინფრასტრუქტურა'],
  },
  {
    name: 'hospital',
    emoji: '🏥',
    category: 'ინფრასტრუქტურა',
    keywords: ['hospital', 'medical', 'health', 'clinic', 'საავადმყოფო'],
  },
  {
    name: 'school',
    emoji: '🏫',
    category: 'ინფრასტრუქტურა',
    keywords: ['school', 'education', 'learning', 'academy', 'სკოლა'],
  },
  {
    name: 'bank',
    emoji: '🏦',
    category: 'ინფრასტრუქტურა',
    keywords: ['bank', 'finance', 'money', 'financial', 'ბანკი'],
  },
  {
    name: 'shopping',
    emoji: '🛒',
    category: 'ინფრასტრუქტურა',
    keywords: ['shopping', 'store', 'retail', 'commerce', 'შოპინგი'],
  },
  {
    name: 'restaurant',
    emoji: '🍽️',
    category: 'ინფრასტრუქტურა',
    keywords: ['restaurant', 'food', 'dining', 'cafe', 'რესტორანი'],
  },
  {
    name: 'gas_station',
    emoji: '⛽',
    category: 'ინფრასტრუქტურა',
    keywords: ['gas', 'fuel', 'station', 'energy', 'ბენზინგასამართი'],
  },
  {
    name: 'wifi',
    emoji: '📶',
    category: 'ინფრასტრუქტურა',
    keywords: ['wifi', 'internet', 'connection', 'network', 'ვაიფაი'],
  },

  // Commercial & Business
  {
    name: 'commercial',
    emoji: '🏪',
    category: 'კომერცია',
    keywords: ['commercial', 'shop', 'store', 'business', 'კომერცია'],
  },
  {
    name: 'office',
    emoji: '💼',
    category: 'კომერცია',
    keywords: ['office', 'business', 'work', 'professional', 'ოფისი'],
  },
  {
    name: 'briefcase',
    emoji: '💼',
    category: 'კომერცია',
    keywords: ['briefcase', 'business', 'work', 'office', 'პორტფელი'],
  },
  {
    name: 'money',
    emoji: '💰',
    category: 'კომერცია',
    keywords: ['money', 'finance', 'wealth', 'business', 'ფული'],
  },
  {
    name: 'chart',
    emoji: '📊',
    category: 'კომერცია',
    keywords: ['chart', 'graph', 'analytics', 'business', 'დიაგრამა'],
  },
  {
    name: 'handshake',
    emoji: '🤝',
    category: 'კომერცია',
    keywords: ['handshake', 'deal', 'agreement', 'business', 'ხელის ჩამორთმევა'],
  },

  // Technology
  {
    name: 'technology',
    emoji: '💻',
    category: 'ტექნოლოგია',
    keywords: ['technology', 'computer', 'digital', 'modern', 'ტექნოლოგია'],
  },
  {
    name: 'smartphone',
    emoji: '📱',
    category: 'ტექნოლოგია',
    keywords: ['smartphone', 'phone', 'mobile', 'device', 'ტელეფონი'],
  },
  {
    name: 'robot',
    emoji: '🤖',
    category: 'ტექნოლოგია',
    keywords: ['robot', 'ai', 'automation', 'technology', 'რობოტი'],
  },
  {
    name: 'satellite',
    emoji: '🛰️',
    category: 'ტექნოლოგია',
    keywords: ['satellite', 'space', 'technology', 'communication', 'თანამგზავრი'],
  },
  {
    name: 'chip',
    emoji: '🔧',
    category: 'ტექნოლოგია',
    keywords: ['chip', 'processor', 'technology', 'hardware', 'ჩიპი'],
  },

  // Environment
  {
    name: 'environment',
    emoji: '🌱',
    category: 'გარემო',
    keywords: ['environment', 'green', 'eco', 'nature', 'გარემო'],
  },
  {
    name: 'tree',
    emoji: '🌳',
    category: 'გარემო',
    keywords: ['tree', 'nature', 'green', 'environment', 'ხე'],
  },
  {
    name: 'leaf',
    emoji: '🍃',
    category: 'გარემო',
    keywords: ['leaf', 'nature', 'green', 'eco', 'ფოთოლი'],
  },
  {
    name: 'sun',
    emoji: '☀️',
    category: 'გარემო',
    keywords: ['sun', 'solar', 'energy', 'bright', 'მზე'],
  },
  {
    name: 'water',
    emoji: '💧',
    category: 'გარემო',
    keywords: ['water', 'liquid', 'clean', 'resource', 'წყალი'],
  },
  {
    name: 'recycle',
    emoji: '♻️',
    category: 'გარემო',
    keywords: ['recycle', 'eco', 'green', 'sustainable', 'რეციკლინგი'],
  },

  // Recreation
  {
    name: 'recreation',
    emoji: '🎯',
    category: 'დასვენება',
    keywords: ['recreation', 'leisure', 'fun', 'entertainment', 'დასვენება'],
  },
  {
    name: 'gym',
    emoji: '🏋️',
    category: 'დასვენება',
    keywords: ['gym', 'fitness', 'exercise', 'health', 'სპორტდარბაზი'],
  },
  {
    name: 'pool',
    emoji: '🏊',
    category: 'დასვენება',
    keywords: ['pool', 'swimming', 'water', 'recreation', 'აუზი'],
  },
  {
    name: 'garden',
    emoji: '🌻',
    category: 'დასვენება',
    keywords: ['garden', 'park', 'nature', 'green', 'ბაღი'],
  },
  {
    name: 'playground',
    emoji: '🎪',
    category: 'დასვენება',
    keywords: ['playground', 'kids', 'children', 'fun', 'სათამაშო'],
  },
  {
    name: 'theater',
    emoji: '🎭',
    category: 'დასვენება',
    keywords: ['theater', 'entertainment', 'culture', 'arts', 'თეატრი'],
  },

  // Utilities
  {
    name: 'utilities',
    emoji: '⚡',
    category: 'კომუნალური',
    keywords: ['utilities', 'electricity', 'power', 'energy', 'კომუნალური'],
  },
  {
    name: 'water_drop',
    emoji: '💧',
    category: 'კომუნალური',
    keywords: ['water', 'utility', 'service', 'resource', 'წყალი'],
  },
  {
    name: 'trash',
    emoji: '🗑️',
    category: 'კომუნალური',
    keywords: ['trash', 'waste', 'garbage', 'disposal', 'ნაგავი'],
  },
  {
    name: 'wrench',
    emoji: '🔧',
    category: 'კომუნალური',
    keywords: ['wrench', 'maintenance', 'repair', 'service', 'საკრავი'],
  },
  {
    name: 'tools',
    emoji: '🛠️',
    category: 'კომუნალური',
    keywords: ['tools', 'maintenance', 'repair', 'service', 'ხელსაწყოები'],
  },

  // Communication
  {
    name: 'communication',
    emoji: '📞',
    category: 'კომუნიკაცია',
    keywords: ['communication', 'phone', 'contact', 'connect', 'კომუნიკაცია'],
  },
  {
    name: 'mail',
    emoji: '📧',
    category: 'კომუნიკაცია',
    keywords: ['mail', 'email', 'message', 'communication', 'ელფოსტა'],
  },
  {
    name: 'chat',
    emoji: '💬',
    category: 'კომუნიკაცია',
    keywords: ['chat', 'message', 'communication', 'talk', 'ჩეთი'],
  },
  {
    name: 'megaphone',
    emoji: '📢',
    category: 'კომუნიკაცია',
    keywords: ['megaphone', 'announcement', 'broadcast', 'communication', 'მეგაფონი'],
  },

  // Time
  {
    name: 'time',
    emoji: '⏰',
    category: 'დრო',
    keywords: ['time', 'clock', 'schedule', 'timing', 'დრო'],
  },
  {
    name: 'calendar',
    emoji: '📅',
    category: 'დრო',
    keywords: ['calendar', 'date', 'schedule', 'planning', 'კალენდარი'],
  },
  {
    name: 'clock',
    emoji: '🕐',
    category: 'დრო',
    keywords: ['clock', 'time', 'hour', 'schedule', 'საათი'],
  },
  {
    name: 'stopwatch',
    emoji: '⏱️',
    category: 'დრო',
    keywords: ['stopwatch', 'timer', 'time', 'measurement', 'ქრონომეტრი'],
  },
]

const searchIcons = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isLoading.value = true

  // Simulate API delay for better UX
  setTimeout(() => {
    const query = searchQuery.value.toLowerCase()

    searchResults.value = emojiDatabase.filter(
      (icon) =>
        icon.name.toLowerCase().includes(query) ||
        icon.keywords.some((keyword) => keyword.toLowerCase().includes(query)) ||
        icon.category.toLowerCase().includes(query) ||
        icon.emoji.includes(query),
    )

    isLoading.value = false
  }, 300)
}

const selectIcon = (icon: Icon) => {
  selectedIcon.value = icon
  emit('update:modelValue', icon.emoji)
  emit('icon-selected', icon)
  showPicker.value = false
  searchQuery.value = icon.name
}

const clearSelection = () => {
  selectedIcon.value = null
  emit('update:modelValue', '')
  searchQuery.value = ''
}

// Initialize selected icon if modelValue is provided
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      const icon = emojiDatabase.find((i) => i.emoji === newValue)
      if (icon) {
        selectedIcon.value = icon
        searchQuery.value = icon.name
      }
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.online-icon-picker {
  position: relative;
}

/* Custom scrollbar for the dropdown */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Emoji display improvements */
.emoji-icon {
  font-family:
    'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Android Emoji', 'EmojiSymbols',
    sans-serif;
  font-size: 1.25rem;
  line-height: 1;
  display: inline-block;
  vertical-align: middle;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Ensure consistent emoji sizing */
.emoji-icon.large {
  font-size: 1.5rem;
}

.emoji-icon.small {
  font-size: 1rem;
}
</style>
