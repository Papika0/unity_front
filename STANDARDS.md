# STANDARDS.md - Unity Real Estate Platform

**Version:** 3.0.0
**Stack:** Vue 3.5 + TypeScript 5.8 + Pinia 3.0 + Tailwind CSS 3.4
**Build:** Vite 6.2

This document defines the architectural standards, coding conventions, and best practices for the Unity Real Estate Platform frontend. Following these guidelines ensures code consistency, maintainability, and successful PR reviews.

---

## Table of Contents

1. [Feature Documentation System](#1-feature-documentation-system)
2. [Project Overview](#2-project-overview)
3. [Project Structure](#3-project-structure)
4. [Component Architecture](#4-component-architecture)
5. [State Management (Pinia)](#5-state-management-pinia)
6. [Service Layer (API)](#6-service-layer-api)
7. [Composables](#7-composables)
8. [TypeScript & Types](#8-typescript--types)
9. [Styling (Tailwind)](#9-styling-tailwind)
10. [Internationalization](#10-internationalization)
11. [Error Handling](#11-error-handling)
12. [Performance](#12-performance)
13. [Testing](#13-testing)
14. [Accessibility](#14-accessibility)
15. [Code Review Checklist](#15-code-review-checklist)
16. [Anti-Patterns](#16-anti-patterns)
17. [Deprecated Patterns](#17-deprecated-patterns)
18. [Quick Reference](#18-quick-reference)

---

## 1. Feature Documentation System

**IMPORTANT:** This project contains detailed feature documentation. When working on features, proactively check if relevant documentation exists.

### When to Reference Feature Docs

**Automatically load feature documentation when:**
- Working on files listed in a feature's "Related Files" section
- Questions arise about features, workflows, or business logic
- Encountering complex logic that might be documented
- User mentions keywords/concepts related to a documented feature

### Available Feature Documentation

| Feature | Documentation | Key Files & Folders |
|---------|---------------|---------------------|
| **Polygon Editor** | `docs/features/polygon-editor.md` | `src/components/admin/PolygonEditor.vue`<br>`src/composables/useZoneValidation.ts`<br>`src/utils/polygon.ts`<br>`src/utils/polygonDetection.ts` |
| **Apartment Management** | `docs/features/apartments.md` | `src/views/admin/apartments/`<br>`src/stores/admin/apartments.ts`<br>`src/components/apartments/` |
| **Payment Calculator** | `docs/features/calculator.md` | `src/composables/usePaymentCalculator.ts`<br>`src/composables/useCalculatorPrint.ts`<br>`src/stores/admin/calculator.ts` |
| **Translations System** | `docs/features/translations.md` | `src/stores/ui/translations.ts`<br>`src/composables/useTranslations.ts`<br>`src/composables/useTranslationLoader.ts` |

### How to Use Feature Docs

1. **Proactive Detection**: When accessing files in "Key Files & Folders", load the relevant documentation
2. **Keyword Matching**: If mentions of polygon, zones, apartments, calculator, or translations arise, check corresponding docs
3. **Explicit Questions**: When asked "how does X work?", check documentation before exploring code

### Adding New Feature Documentation

When creating new feature docs in `docs/features/`:
1. Use the template: `docs/features/_template.md`
2. Update this table with feature name, path, and key files
3. Include: Overview, Related Files, Data Flow, Key Functions, Edge Cases

---

## 2. Project Overview

### Tech Stack

| Package | Version | Purpose |
|---------|---------|---------|
| **Vue** | 3.5.13 | UI framework (Composition API) |
| **TypeScript** | 5.8 | Type safety |
| **Vite** | 6.2.4 | Build tool |
| **Vue Router** | 4.5.1 | Client-side routing |
| **Pinia** | 3.0.3 | State management |
| **Tailwind CSS** | 3.4.17 | Utility-first styling |
| **Axios** | 1.10.0 | HTTP client |
| **Chart.js** | 4.5.0 | Data visualization |
| **jsPDF** | 3.0.3 | PDF generation |

### Path Aliases

```typescript
// Available import paths
import { ... } from '@/components/...'    // src/components
import { ... } from '@/composables/...'   // src/composables
import { ... } from '@/stores/...'        // src/stores
import { ... } from '@/services/...'      // src/services
import { ... } from '@/types'             // src/types
import { ... } from '@/utils/...'         // src/utils
```

---

## 3. Project Structure

### Directory Layout

```
src/
├── assets/                 # Static assets (images, global CSS)
├── components/
│   ├── ui/                 # Generic UI primitives (Button, Modal, Toast)
│   │   ├── BaseButton.vue
│   │   ├── FormField.vue
│   │   ├── index.ts        # Barrel export (REQUIRED)
│   │   └── constants/      # UI constants
│   ├── admin/              # Admin-specific components
│   │   ├── forms/          # Form components with validation
│   │   ├── PolygonEditor.vue
│   │   └── index.ts
│   ├── apartments/         # Apartment selection/display
│   │   ├── ApartmentGrid.vue
│   │   ├── ApartmentCard.vue
│   │   ├── hooks/          # Component-specific composables
│   │   ├── constants/      # Feature constants
│   │   └── index.ts
│   ├── home/               # Homepage-specific
│   └── icons/              # SVG icon components
├── composables/            # Shared composition functions
│   ├── api/                # API-related composables
│   ├── ui/                 # UI utility composables
│   └── index.ts
├── layouts/                # Page shells
│   ├── PublicLayout.vue
│   └── AdminRootLayout.vue
├── plugins/
│   └── axios/              # Axios instance & interceptors
├── router/
│   ├── index.ts            # Route definitions
│   └── guards.ts           # Auth & role guards
├── services/               # API service layer
│   ├── apartmentService.ts
│   ├── projectsApi.ts
│   └── index.ts
├── stores/
│   ├── admin/              # Admin feature stores
│   ├── auth/               # Authentication state
│   ├── public/             # Public-facing stores
│   └── ui/                 # UI state (toast, locale)
├── types/
│   ├── index.ts            # Core domain types
│   ├── apartments.ts       # Feature-specific types
│   └── api.ts              # API response types
├── utils/                  # Pure utility functions
│   ├── polygon.ts
│   ├── imageCompression.ts
│   └── index.ts
└── views/
    ├── admin/              # Admin pages (by feature)
    │   ├── apartments/
    │   │   ├── ApartmentList.vue
    │   │   ├── ApartmentEditor.vue
    │   │   ├── components/     # View-specific components
    │   │   └── index.ts
    │   └── projects/
    └── [public pages]
```

### Key Principles

1. **Feature-First Organization:** Group related files by feature, not file type
2. **Colocation:** Feature-specific components live in the feature folder
3. **Flat When Possible:** Avoid deep nesting; 3 levels max
4. **Barrel Exports:** Every folder MUST have an `index.ts`

### Barrel Exports (Required)

**Every folder MUST have an `index.ts` file:**

```typescript
// components/apartments/index.ts
export { default as ApartmentGrid } from './ApartmentGrid.vue'
export { default as ApartmentCard } from './ApartmentCard.vue'
export * from './constants'
export type * from './types'

// Usage - clean imports
import { ApartmentGrid, ApartmentCard } from '@/components/apartments'
```

---

## 4. Component Architecture

### 4.1 Script Setup (Required)

All components MUST use `<script setup lang="ts">`:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Apartment } from '@/types'

// Props with TypeScript
const props = defineProps<{
  apartment: Apartment
  isActive?: boolean
}>()

// Defaults with withDefaults
const props = withDefaults(defineProps<Props>(), {
  isActive: false
})

// Typed emits
const emit = defineEmits<{
  select: [id: number]
  'update:modelValue': [value: string]
}>()
</script>
```

### 4.2 Component Types

| Type | Location | Responsibility |
|------|----------|----------------|
| **UI Components** | `components/ui/` | Purely presentational, prop-driven, NO store access |
| **Feature Components** | `components/[feature]/` | Domain logic, may use composables |
| **View Components** | `views/` | Page-level, orchestrates stores and services |
| **Layout Components** | `layouts/` | Page structure, navigation, auth checks |
| **State Components** | `components/[feature]/` | Loading, Error, Empty states (see below) |

### 4.3 State Components Pattern

**Create separate components for different UI states:**

```vue
<!-- components/apartments/ApartmentListLoading.vue -->
<template>
  <div class="grid grid-cols-3 gap-4">
    <div v-for="i in 6" :key="i" class="animate-pulse bg-gray-200 h-48 rounded-lg" />
  </div>
</template>

<!-- components/apartments/ApartmentListError.vue -->
<script setup lang="ts">
defineProps<{ error: Error }>()
</script>
<template>
  <div class="p-4 bg-red-50 text-red-700 rounded-lg">
    {{ error.message }}
  </div>
</template>

<!-- components/apartments/ApartmentListEmpty.vue -->
<template>
  <div class="text-center py-12 text-gray-500">
    No apartments found
  </div>
</template>

<!-- Main component uses state components -->
<script setup lang="ts">
import { ApartmentListLoading, ApartmentListError, ApartmentListEmpty } from './index'
import { useApartmentListState } from './hooks/useApartmentListState'

const { apartments, loading, error } = useApartmentListState()
</script>

<template>
  <ApartmentListLoading v-if="loading" />
  <ApartmentListError v-else-if="error" :error="error" />
  <ApartmentListEmpty v-else-if="!apartments.length" />
  <div v-else class="grid grid-cols-3 gap-4">
    <ApartmentCard v-for="apt in apartments" :key="apt.id" :apartment="apt" />
  </div>
</template>
```

### 4.4 Component Size Limits

| Metric | Target | Maximum |
|--------|--------|---------|
| **Lines** | < 150 | 300 |
| **Props** | < 8 | 12 |
| **Emits** | < 5 | 8 |

**When exceeding limits:**
1. Extract logic into composables
2. Break into sub-components
3. Create state components for Loading/Error/Empty

### 4.5 Constants Extraction

**Extract all magic numbers to constants files:**

```typescript
// components/apartments/constants/apartment-grid.constants.ts

/**
 * Apartment Grid Component Constants
 * All configuration values in one place
 */
export const APARTMENT_GRID_CONSTANTS = {
  /** Number of columns on desktop */
  DESKTOP_COLUMNS: 4,

  /** Number of columns on tablet */
  TABLET_COLUMNS: 2,

  /** Number of columns on mobile */
  MOBILE_COLUMNS: 1,

  /** Gap between items (Tailwind spacing unit) */
  GAP: 4,

  /** Number of skeleton items to show while loading */
  SKELETON_COUNT: 8,

  /** Debounce delay for search input (ms) */
  SEARCH_DEBOUNCE: 300,
} as const

export const STATUS_COLORS = {
  available: 'bg-green-100 text-green-800',
  reserved: 'bg-amber-100 text-amber-800',
  sold: 'bg-red-100 text-red-800',
} as const
```

### 4.6 Don'ts

```typescript
// ❌ Options API
export default {
  data() { return { ... } }
}

// ❌ API calls in UI components
// components/ui/ApartmentCard.vue
const data = await axios.get('/apartments')

// ❌ Direct store access in UI components
// components/ui/Button.vue
const store = useAuthStore()

// ❌ Magic numbers in components
<div class="grid grid-cols-4 gap-6"> // Use constants!
```

---

## 5. State Management (Pinia)

### 5.1 Setup Store Pattern (Required)

Use composition function syntax exclusively:

```typescript
// src/stores/admin/apartments.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Apartment, ApartmentStatus } from '@/types'
import { apartmentService } from '@/services/apartmentService'

export const useApartmentsStore = defineStore('apartments', () => {
  // ============================================
  // STATE
  // ============================================
  const apartments = ref<Apartment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ============================================
  // GETTERS (computed)
  // ============================================
  const availableApartments = computed(() =>
    apartments.value.filter(a => a.status === 'available')
  )

  const byStatus = computed(() => (status: ApartmentStatus) =>
    apartments.value.filter(a => a.status === status)
  )

  const totalCount = computed(() => apartments.value.length)

  // ============================================
  // ACTIONS (functions)
  // ============================================
  async function fetchAll(buildingId: number) {
    loading.value = true
    error.value = null
    try {
      apartments.value = await apartmentService.getByBuilding(buildingId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch apartments'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(id: number, status: ApartmentStatus) {
    const apartment = apartments.value.find(a => a.id === id)
    if (!apartment) return

    const previousStatus = apartment.status
    apartment.status = status // Optimistic update

    try {
      await apartmentService.update(id, { status })
    } catch (e) {
      apartment.status = previousStatus // Rollback
      throw e
    }
  }

  function $reset() {
    apartments.value = []
    loading.value = false
    error.value = null
  }

  // ============================================
  // RETURN
  // ============================================
  return {
    // State
    apartments,
    loading,
    error,
    // Getters
    availableApartments,
    byStatus,
    totalCount,
    // Actions
    fetchAll,
    updateStatus,
    $reset
  }
})
```

### 5.2 Store Organization

```
stores/
├── auth/
│   └── auth.ts           # User authentication, tokens
├── admin/
│   ├── apartments.ts     # Apartment CRUD
│   ├── projects.ts       # Project management
│   ├── buildings.ts      # Building management
│   └── zoneEditor.ts     # Polygon editor state
├── public/
│   ├── homepage.ts       # Homepage data
│   └── projects.ts       # Public project list
└── ui/
    ├── toast.ts          # Notifications (SINGLE SOURCE)
    ├── locale.ts         # Language preference
    └── translations.ts   # i18n content
```

### 5.3 Store Rules

1. **One source of truth:** Don't duplicate state between stores
2. **Minimal persistence:** Only persist to localStorage:
   - Auth tokens
   - User preferences (locale, theme)
   - Form drafts (with expiry via `useAutoSave`)
3. **Include loading/error state:** Every async store needs `loading` and `error` refs
4. **Provide `$reset()`:** For cleanup on logout or navigation
5. **Section comments:** Use clear section separators (STATE, GETTERS, ACTIONS)

### 5.4 Toast Store (Canonical)

Use ONLY `useToastStore` for notifications:

```typescript
// ✅ Correct
import { useToastStore } from '@/stores/ui/toast'
const toast = useToastStore()
toast.success('Apartment saved')
toast.error('Failed to save')
toast.warning('Unsaved changes')
toast.info('Processing...')

// ❌ Wrong - Don't use the composable directly
import { useToast } from '@/composables/useToast'
```

---

## 6. Service Layer (API)

### 6.1 Service Structure

Location: `src/services/`

All API calls MUST go through services. Components and stores never import axios directly.

```typescript
// src/services/apartmentService.ts
import api from '@/plugins/axios'
import type {
  Apartment,
  CreateApartmentDTO,
  UpdateApartmentDTO,
  ApiResponse,
  PaginatedResponse
} from '@/types'

/**
 * Apartment Service
 * Handles all apartment-related API operations
 */
export const apartmentService = {
  /**
   * Get all apartments with optional filtering
   */
  async getAll(params?: {
    page?: number
    status?: string
    buildingId?: number
  }): Promise<PaginatedResponse<Apartment>> {
    const { data } = await api.get('/apartments', { params })
    return data
  },

  /**
   * Get apartments by building
   */
  async getByBuilding(buildingId: number): Promise<Apartment[]> {
    const { data } = await api.get<ApiResponse<Apartment[]>>(
      `/buildings/${buildingId}/apartments`
    )
    return data.data
  },

  /**
   * Get single apartment by ID
   */
  async getById(id: number): Promise<Apartment> {
    const { data } = await api.get<ApiResponse<Apartment>>(`/apartments/${id}`)
    return data.data
  },

  /**
   * Create new apartment
   */
  async create(payload: CreateApartmentDTO): Promise<Apartment> {
    const { data } = await api.post<ApiResponse<Apartment>>('/apartments', payload)
    return data.data
  },

  /**
   * Update existing apartment
   */
  async update(id: number, payload: UpdateApartmentDTO): Promise<Apartment> {
    const { data } = await api.put<ApiResponse<Apartment>>(`/apartments/${id}`, payload)
    return data.data
  },

  /**
   * Delete apartment
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/apartments/${id}`)
  },

  /**
   * Bulk update apartment statuses
   */
  async bulkUpdateStatus(ids: number[], status: string): Promise<void> {
    await api.post('/apartments/bulk-update', { ids, status })
  }
}
```

### 6.2 Service Naming

| Pattern | Example | Use Case |
|---------|---------|----------|
| `[feature]Service` | `apartmentService.ts` | Full CRUD operations |
| `[feature]Api` | `projectsApi.ts` | Simpler read operations |
| `admin[Feature]Api` | `adminCustomerApi.ts` | Admin-only endpoints |

### 6.3 API Response Types

```typescript
// src/types/api.ts

/** Standard API response wrapper */
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

/** Paginated response with meta information */
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  links?: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

/** API error response */
export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status: number
}

/** Validation error from Laravel */
export interface ValidationError {
  message: string
  errors: Record<string, string[]>
}
```

---

## 7. Composables

### 7.1 Three Categories of Composables

```
composables/
├── api/                    # API-related (data fetching wrappers)
│   ├── useApartments.ts
│   └── useProjects.ts
├── ui/                     # UI utilities
│   ├── useToast.ts         # DEPRECATED - use store
│   ├── useScrollAnimation.ts
│   └── usePageTitle.ts
├── [feature]/              # Feature-specific
│   ├── useAutoSave.ts
│   ├── useUnsavedChanges.ts
│   └── useZoneValidation.ts
└── index.ts
```

### 7.2 Component-Specific Composables

**Location:** Co-located in `components/[feature]/hooks/`

```typescript
// components/apartments/hooks/useApartmentListState.ts
import { ref, computed, onMounted } from 'vue'
import { useApartmentsStore } from '@/stores/admin/apartments'
import { useToastStore } from '@/stores/ui/toast'

/**
 * Custom composable for ApartmentList component state
 * Consolidates all state management and derived values
 */
export function useApartmentListState(buildingId: number) {
  // ============================================
  // STORES
  // ============================================
  const store = useApartmentsStore()
  const toast = useToastStore()

  // ============================================
  // LOCAL STATE
  // ============================================
  const searchQuery = ref('')
  const statusFilter = ref<string | null>(null)
  const selectedIds = ref<number[]>([])

  // ============================================
  // COMPUTED / DERIVED
  // ============================================
  const filteredApartments = computed(() => {
    let result = store.apartments

    if (statusFilter.value) {
      result = result.filter(a => a.status === statusFilter.value)
    }

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(a =>
        a.apartment_number.toLowerCase().includes(query)
      )
    }

    return result
  })

  const hasSelection = computed(() => selectedIds.value.length > 0)

  // ============================================
  // ACTIONS
  // ============================================
  async function loadApartments() {
    try {
      await store.fetchAll(buildingId)
    } catch (e) {
      toast.error('Failed to load apartments')
    }
  }

  function toggleSelection(id: number) {
    const index = selectedIds.value.indexOf(id)
    if (index === -1) {
      selectedIds.value.push(id)
    } else {
      selectedIds.value.splice(index, 1)
    }
  }

  function clearSelection() {
    selectedIds.value = []
  }

  async function bulkUpdateStatus(status: string) {
    if (!hasSelection.value) return

    try {
      await store.bulkUpdateStatus(selectedIds.value, status)
      toast.success(`Updated ${selectedIds.value.length} apartments`)
      clearSelection()
    } catch (e) {
      toast.error('Failed to update apartments')
    }
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(() => {
    loadApartments()
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // Store state
    apartments: store.apartments,
    loading: store.loading,
    error: store.error,

    // Local state
    searchQuery,
    statusFilter,
    selectedIds,

    // Computed
    filteredApartments,
    hasSelection,

    // Actions
    loadApartments,
    toggleSelection,
    clearSelection,
    bulkUpdateStatus,
  }
}
```

### 7.3 Shared Composables

| Composable | Purpose | Location |
|------------|---------|----------|
| `useAutoSave` | Draft persistence with expiry | `composables/useAutoSave.ts` |
| `useUnsavedChanges` | Warn before navigation | `composables/useUnsavedChanges.ts` |
| `usePaymentCalculator` | Mortgage calculations | `composables/usePaymentCalculator.ts` |
| `useZoneValidation` | Polygon zone validation | `composables/useZoneValidation.ts` |
| `useTranslations` | i18n wrapper | `composables/useTranslations.ts` |
| `useScrollAnimation` | Intersection observer | `composables/useScrollAnimation.ts` |
| `usePageTitle` | Dynamic document title | `composables/usePageTitle.ts` |

### 7.4 Composable Rules

1. **Prefix with `use`:** `useFeatureName`
2. **Return object:** Always return an object, not array (for clarity)
3. **Section comments:** Use clear separators (STORES, STATE, COMPUTED, ACTIONS, LIFECYCLE)
4. **Handle cleanup:** Use `onUnmounted` for timers, subscriptions
5. **Document with JSDoc:** Describe purpose and parameters

---

## 8. TypeScript & Types

### 8.1 Type Locations

```
types/
├── index.ts           # Core domain types (User, Project, etc.)
├── apartments.ts      # Apartment domain types
├── api.ts             # API response wrappers
└── admin/
    └── index.ts       # Admin-specific types
```

### 8.2 Type Patterns

```typescript
// ============================================
// ENUMS AS UNION TYPES (Preferred)
// ============================================
export type ApartmentStatus = 'available' | 'reserved' | 'sold'
export type ZoneType = 'building_block' | 'floor_strip' | 'apartment_unit'
export type UserRole = 'admin' | 'marketing' | 'user'

// ============================================
// DOMAIN MODELS
// ============================================
export interface Apartment {
  id: number
  floor_number: number
  apartment_number: string
  status: ApartmentStatus
  price: number | null
  area_total: number | null
  area_balcony: number | null
  building_id: number
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  created_at: string
  updated_at: string
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================
export interface CreateApartmentDTO {
  floor_number: number
  apartment_number: string
  status?: ApartmentStatus
  price?: number
  area_total?: number
  building_id: number
}

export interface UpdateApartmentDTO extends Partial<CreateApartmentDTO> {
  id?: never // Prevent ID in update payload
}

// ============================================
// COMPONENT PROPS
// ============================================
export interface ApartmentCardProps {
  apartment: Apartment
  isSelected?: boolean
  onSelect?: (id: number) => void
}

// ============================================
// BRANDED TYPES (Optional, extra safety)
// ============================================
export type ApartmentId = number & { readonly __brand: 'ApartmentId' }
export type BuildingId = number & { readonly __brand: 'BuildingId' }
```

### 8.3 Type Rules

| Rule | Do | Don't |
|------|-----|-------|
| **No `any`** | `unknown`, proper types | `any` |
| **Interfaces for objects** | `interface User { }` | `type User = { }` |
| **Types for unions** | `type Status = 'a' \| 'b'` | `enum Status { }` |
| **Null vs undefined** | `null` = intentional absence | Mix randomly |
| **Separate DTOs** | `CreateDTO`, `UpdateDTO` | Reuse domain model |

---

## 9. Styling (Tailwind)

### 9.1 Utility-First Approach

```vue
<template>
  <!-- ✅ Good: Utility classes -->
  <button class="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600
    text-white font-medium hover:shadow-lg transition-all duration-300">
    Save
  </button>
</template>
```

### 9.2 Dynamic Classes

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { STATUS_COLORS } from './constants'

const props = defineProps<{
  variant: 'primary' | 'secondary'
  status: ApartmentStatus
  disabled?: boolean
}>()

const buttonClass = computed(() => [
  'px-4 py-2 rounded-lg font-medium transition-all duration-300',
  props.variant === 'primary'
    ? 'bg-amber-500 text-white hover:bg-amber-600'
    : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
  props.disabled && 'opacity-50 cursor-not-allowed'
])

const statusClass = computed(() => STATUS_COLORS[props.status])
</script>

<template>
  <button :class="buttonClass" :disabled="disabled">
    <slot />
  </button>
</template>
```

### 9.3 Design Tokens (Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          // ... full palette
          900: '#581c87',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    }
  }
}
```

### 9.4 Styling Rules

| Do | Don't |
|-----|-------|
| Use utility classes | Inline styles (`style="..."`) |
| Use Tailwind config values | Hardcode colors (`#FF0000`) |
| Extract to constants | Magic numbers in templates |
| `@apply` for global patterns only | `@apply` for one-off styles |

---

## 10. Internationalization

### 10.1 Translation Store

```typescript
// Use the translations store for all i18n operations
import { useTranslationsStore } from '@/stores/ui/translations'
import { useLocaleStore } from '@/stores/ui/locale'

const translations = useTranslationsStore()
const locale = useLocaleStore()

// Get translation
const title = translations.get('projects.title')

// Change locale
locale.setLocale('en')
```

### 10.2 Supported Locales

| Language | Code | Status |
|----------|------|--------|
| Georgian | `ka` | Default |
| English | `en` | Supported |
| Russian | `ru` | Supported |

### 10.3 Translation Usage

```vue
<script setup lang="ts">
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()
</script>

<template>
  <!-- ✅ Use translations for all user-facing text -->
  <h1>{{ t('projects.title') }}</h1>
  <button>{{ t('common.save') }}</button>

  <!-- ❌ Never hardcode text -->
  <h1>Projects</h1>
</template>
```

---

## 11. Error Handling

### 11.1 API Error Handling (Axios Interceptor)

```typescript
// src/plugins/axios/api.ts
import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth/auth'
import { useToastStore } from '@/stores/ui/toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
})

// Request interceptor - add auth token
api.interceptors.request.use(config => {
  const auth = useAuthStore()
  if (auth.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

// Response interceptor - handle errors
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status
    const toast = useToastStore()

    switch (status) {
      case 401:
        const auth = useAuthStore()
        auth.logout()
        router.push('/login')
        break

      case 403:
        toast.error('You do not have permission to perform this action')
        break

      case 422:
        // Validation errors - let caller handle
        return Promise.reject(error.response.data)

      case 500:
      case 502:
      case 503:
        toast.error('Server error. Please try again later.')
        break

      default:
        if (!error.response) {
          toast.error('Network error. Please check your connection.')
        }
    }

    return Promise.reject(error)
  }
)

export default api
```

### 11.2 Store Error Handling

```typescript
// Always include loading and error state
async function saveApartment(data: CreateApartmentDTO) {
  loading.value = true
  error.value = null

  try {
    const result = await apartmentService.create(data)
    apartments.value.push(result)
    return result
  } catch (e) {
    // Check if validation error (422)
    if (e && typeof e === 'object' && 'errors' in e) {
      throw e // Rethrow for form handling
    }

    // Generic error
    error.value = e instanceof Error ? e.message : 'Failed to save apartment'
    throw e
  } finally {
    loading.value = false
  }
}
```

### 11.3 Component Error Handling

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useToastStore } from '@/stores/ui/toast'
import type { ValidationError } from '@/types'

const toast = useToastStore()
const validationErrors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

async function handleSubmit() {
  validationErrors.value = {}
  isSubmitting.value = true

  try {
    await store.saveApartment(formData.value)
    toast.success('Apartment saved successfully')
    emit('saved')
  } catch (e) {
    if (isValidationError(e)) {
      validationErrors.value = e.errors
    } else {
      toast.error('Failed to save apartment')
    }
  } finally {
    isSubmitting.value = false
  }
}

function isValidationError(e: unknown): e is ValidationError {
  return e !== null && typeof e === 'object' && 'errors' in e
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <FormField
      v-model="formData.apartment_number"
      label="Apartment Number"
      :error="validationErrors.apartment_number?.[0]"
    />

    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Saving...' : 'Save' }}
    </button>
  </form>
</template>
```

---

## 12. Performance

### 12.1 Code Splitting (Lazy Loading)

```typescript
// src/router/index.ts
const routes = [
  {
    path: '/admin',
    component: () => import('@/layouts/AdminRootLayout.vue'),
    children: [
      {
        path: 'apartments',
        name: 'admin-apartments',
        component: () => import('@/views/admin/apartments/ApartmentList.vue'),
        meta: { requiresAuth: true, role: 'admin' }
      }
    ]
  }
]
```

### 12.2 Image Optimization

```typescript
import { compressImage } from '@/utils/imageCompression'

// Before upload
const compressed = await compressImage(file, {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8
})
```

### 12.3 Reactive Data Optimization

```typescript
// ✅ Use shallowRef for large arrays that replace entirely
import { shallowRef } from 'vue'
const apartments = shallowRef<Apartment[]>([])

// ✅ Use computed for derived state (cached)
const filtered = computed(() =>
  apartments.value.filter(a => a.status === 'available')
)

// ✅ Use v-once for static content
<template>
  <header v-once>
    <Logo />
    <h1>Unity Real Estate</h1>
  </header>
</template>

// ❌ Don't create computed inside loops
items.forEach(item => {
  const derived = computed(() => ...) // Bad!
})
```

### 12.4 List Virtualization

For lists with 100+ items:

```vue
<script setup lang="ts">
import { useVirtualList } from '@vueuse/core'

const { list, containerProps, wrapperProps } = useVirtualList(
  apartments,
  { itemHeight: 80 }
)
</script>

<template>
  <div v-bind="containerProps" class="h-96 overflow-auto">
    <div v-bind="wrapperProps">
      <ApartmentCard
        v-for="{ data, index } in list"
        :key="data.id"
        :apartment="data"
      />
    </div>
  </div>
</template>
```

---

## 13. Testing

### 13.1 Test Structure

```
tests/
├── unit/
│   ├── composables/
│   │   └── useAutoSave.spec.ts
│   ├── stores/
│   │   └── apartments.spec.ts
│   └── utils/
│       └── polygon.spec.ts
├── component/
│   └── components/
│       └── ApartmentCard.spec.ts
└── e2e/
    └── flows/
        └── apartment-management.spec.ts
```

### 13.2 Unit Test Example

```typescript
// tests/unit/composables/useAutoSave.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useAutoSave } from '@/composables/useAutoSave'

describe('useAutoSave', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  it('saves data after delay', async () => {
    const data = ref({ name: 'Test' })
    const { lastSaved } = useAutoSave({ key: 'test', data, delay: 1000 })

    expect(lastSaved.value).toBeNull()

    data.value.name = 'Updated'
    vi.advanceTimersByTime(1000)

    expect(lastSaved.value).not.toBeNull()
    expect(localStorage.getItem('draft_test')).toContain('Updated')
  })

  it('restores data from localStorage', () => {
    const saved = {
      data: { name: 'Saved' },
      savedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600000).toISOString()
    }
    localStorage.setItem('draft_test', JSON.stringify(saved))

    const data = ref({ name: '' })
    const { restore } = useAutoSave({ key: 'test', data })

    const restored = restore()
    expect(restored).toEqual({ name: 'Saved' })
  })

  it('clears expired data', () => {
    const saved = {
      data: { name: 'Expired' },
      savedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() - 1000).toISOString() // Expired
    }
    localStorage.setItem('draft_test', JSON.stringify(saved))

    const data = ref({ name: '' })
    const { restore } = useAutoSave({ key: 'test', data })

    const restored = restore()
    expect(restored).toBeNull()
    expect(localStorage.getItem('draft_test')).toBeNull()
  })
})
```

### 13.3 Component Test Example

```typescript
// tests/component/ApartmentCard.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ApartmentCard from '@/components/apartments/ApartmentCard.vue'

describe('ApartmentCard', () => {
  const mockApartment = {
    id: 1,
    status: 'available',
    apartment_number: '101',
    floor_number: 1,
    price: 100000,
    area_total: 75
  }

  it('renders apartment number', () => {
    const wrapper = mount(ApartmentCard, {
      props: { apartment: mockApartment }
    })

    expect(wrapper.text()).toContain('101')
  })

  it('emits select event on click', async () => {
    const wrapper = mount(ApartmentCard, {
      props: { apartment: mockApartment }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('select')).toEqual([[1]])
  })

  it('shows correct status color', () => {
    const wrapper = mount(ApartmentCard, {
      props: { apartment: { ...mockApartment, status: 'sold' } }
    })

    expect(wrapper.find('.status-badge').classes()).toContain('bg-red-100')
  })

  it('displays formatted price', () => {
    const wrapper = mount(ApartmentCard, {
      props: { apartment: mockApartment }
    })

    expect(wrapper.text()).toContain('100,000')
  })
})
```

### 13.4 Store Test Example

```typescript
// tests/unit/stores/apartments.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useApartmentsStore } from '@/stores/admin/apartments'
import { apartmentService } from '@/services/apartmentService'

vi.mock('@/services/apartmentService')

describe('useApartmentsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('fetches apartments', async () => {
    const mockApartments = [
      { id: 1, status: 'available' },
      { id: 2, status: 'sold' }
    ]
    vi.mocked(apartmentService.getByBuilding).mockResolvedValue(mockApartments)

    const store = useApartmentsStore()
    await store.fetchAll(1)

    expect(store.apartments).toEqual(mockApartments)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('handles fetch error', async () => {
    vi.mocked(apartmentService.getByBuilding).mockRejectedValue(
      new Error('Network error')
    )

    const store = useApartmentsStore()

    await expect(store.fetchAll(1)).rejects.toThrow()
    expect(store.error).toBe('Network error')
    expect(store.loading).toBe(false)
  })

  it('filters available apartments', async () => {
    const store = useApartmentsStore()
    store.apartments = [
      { id: 1, status: 'available' },
      { id: 2, status: 'sold' },
      { id: 3, status: 'available' }
    ]

    expect(store.availableApartments).toHaveLength(2)
  })
})
```

### 13.5 Test Commands

```bash
npm run test              # Run all tests
npm run test:unit         # Run unit tests only
npm run test:component    # Run component tests only
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
npm run test:e2e          # End-to-end tests
```

---

## 14. Accessibility

### 14.1 Semantic HTML

```vue
<!-- ✅ Good -->
<button @click="save">Save</button>
<nav aria-label="Main navigation">...</nav>
<main>...</main>
<article>...</article>

<!-- ❌ Bad -->
<div @click="save">Save</div>
<div class="nav">...</div>
```

### 14.2 ARIA Attributes

```vue
<template>
  <!-- Dropdown example -->
  <div class="relative">
    <button
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="toggle"
    >
      {{ selected?.label || 'Select option' }}
    </button>

    <ul
      v-show="isOpen"
      role="listbox"
      :aria-label="label"
      :aria-activedescendant="activeId"
    >
      <li
        v-for="option in options"
        :key="option.id"
        role="option"
        :aria-selected="option.id === selectedId"
        :id="`option-${option.id}`"
        @click="select(option)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>
```

### 14.3 Keyboard Navigation

```vue
<script setup lang="ts">
function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusNext()
      break
    case 'ArrowUp':
      event.preventDefault()
      focusPrevious()
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      selectFocused()
      break
    case 'Escape':
      close()
      break
  }
}
</script>

<template>
  <div @keydown="handleKeydown" tabindex="0">
    <!-- Interactive content -->
  </div>
</template>
```

### 14.4 Focus Management

```typescript
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

const modalRef = ref<HTMLElement | null>(null)
const { activate, deactivate } = useFocusTrap(modalRef)

watch(isOpen, (open) => {
  if (open) {
    activate()
  } else {
    deactivate()
  }
})
```

### 14.5 Color & Contrast

- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 contrast ratio for large text (18px+)
- Never rely solely on color to convey information
- Provide text labels alongside color indicators

---

## 15. Code Review Checklist

Before submitting a PR, verify all items:

### Components

- [ ] Uses `<script setup lang="ts">`
- [ ] Component is under 150 lines (max 300)
- [ ] Business logic extracted to composables
- [ ] State components for Loading/Error/Empty states
- [ ] Props and emits are properly typed
- [ ] No direct store access in UI components
- [ ] No API calls in components (use services)

### Composables & Stores

- [ ] Composable prefixed with `use`
- [ ] Returns object (not array)
- [ ] Section comments (STATE, GETTERS, ACTIONS)
- [ ] Loading and error state included
- [ ] `$reset()` method provided
- [ ] Cleanup in `onUnmounted` if needed

### Styling

- [ ] Uses Tailwind utility classes
- [ ] No hardcoded colors or sizes
- [ ] Dynamic classes use computed
- [ ] Constants extracted from templates
- [ ] Responsive breakpoints handled

### TypeScript

- [ ] No `any` types
- [ ] Using `interface` for objects
- [ ] Using `type` for unions
- [ ] DTOs separate from domain models
- [ ] Proper null vs undefined usage

### File Organization

- [ ] Every folder has `index.ts` barrel export
- [ ] Feature-first organization
- [ ] Constants in dedicated files
- [ ] Types in `types/` directory

### Internationalization

- [ ] No hardcoded user-facing text
- [ ] All text uses translation system
- [ ] Translation keys exist for all locales

### Error Handling

- [ ] API errors handled appropriately
- [ ] Validation errors displayed to user
- [ ] Loading states shown during async operations
- [ ] Toast notifications for success/error

### Performance

- [ ] Routes use lazy loading
- [ ] Large lists use virtualization
- [ ] Images compressed before upload
- [ ] `shallowRef` for large arrays

### Accessibility

- [ ] Semantic HTML elements used
- [ ] ARIA attributes where needed
- [ ] Keyboard navigation works
- [ ] Color contrast meets standards

---

## 16. Anti-Patterns

### ❌ Options API

```typescript
// ❌ BAD - Options API
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}

// ✅ GOOD - Composition API with script setup
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++
</script>
```

### ❌ Direct Axios in Components

```typescript
// ❌ BAD - Direct API call in component
<script setup lang="ts">
import axios from 'axios'

const apartments = ref([])
onMounted(async () => {
  const { data } = await axios.get('/apartments')
  apartments.value = data
})
</script>

// ✅ GOOD - Use service layer
<script setup lang="ts">
import { useApartmentsStore } from '@/stores/admin/apartments'

const store = useApartmentsStore()
onMounted(() => store.fetchAll())
</script>
```

### ❌ Store Access in UI Components

```vue
<!-- ❌ BAD - UI component accessing store -->
<!-- components/ui/ApartmentBadge.vue -->
<script setup lang="ts">
import { useApartmentsStore } from '@/stores/admin/apartments'
const store = useApartmentsStore()
const status = store.getStatus(props.id)
</script>

<!-- ✅ GOOD - Pass data via props -->
<!-- components/ui/StatusBadge.vue -->
<script setup lang="ts">
const props = defineProps<{ status: ApartmentStatus }>()
</script>
```

### ❌ Magic Numbers

```vue
<!-- ❌ BAD - Magic numbers everywhere -->
<template>
  <div class="grid grid-cols-4 gap-6 p-8">
    <div v-for="i in 8" :key="i">...</div>
  </div>
</template>

<!-- ✅ GOOD - Use constants -->
<script setup lang="ts">
import { GRID_CONSTANTS } from './constants'
</script>
<template>
  <div :class="`grid grid-cols-${GRID_CONSTANTS.COLUMNS} gap-${GRID_CONSTANTS.GAP}`">
    <div v-for="i in GRID_CONSTANTS.SKELETON_COUNT" :key="i">...</div>
  </div>
</template>
```

### ❌ Large Components with Mixed Logic

```vue
<!-- ❌ BAD - 500+ line component -->
<script setup lang="ts">
// 50 lines of state
// 100 lines of computed
// 200 lines of methods
// Business logic mixed with UI logic
</script>

<!-- ✅ GOOD - Extract to composable -->
<script setup lang="ts">
import { useApartmentEditorState } from './hooks/useApartmentEditorState'

const {
  apartment,
  loading,
  error,
  handleSave,
  handleDelete
} = useApartmentEditorState(props.id)
</script>
```

### ❌ Any Types

```typescript
// ❌ BAD - any type
const handleData = (data: any) => {
  return data.someProperty
}

// ✅ GOOD - Proper types
const handleData = (data: Apartment) => {
  return data.apartment_number
}

// ✅ GOOD - unknown with type guard
const handleData = (data: unknown) => {
  if (isApartment(data)) {
    return data.apartment_number
  }
  throw new Error('Invalid data')
}
```

### ❌ Missing Barrel Exports

```typescript
// ❌ BAD - Deep import paths
import ApartmentGrid from '@/components/apartments/ApartmentGrid.vue'
import ApartmentCard from '@/components/apartments/ApartmentCard.vue'
import { STATUS_COLORS } from '@/components/apartments/constants/colors'

// ✅ GOOD - Barrel exports
import { ApartmentGrid, ApartmentCard, STATUS_COLORS } from '@/components/apartments'
```

### ❌ Hardcoded Text

```vue
<!-- ❌ BAD - Hardcoded English -->
<template>
  <h1>Welcome to Unity</h1>
  <button>Save Changes</button>
  <p>No apartments found</p>
</template>

<!-- ✅ GOOD - Translations -->
<template>
  <h1>{{ t('home.welcome') }}</h1>
  <button>{{ t('common.save') }}</button>
  <p>{{ t('apartments.empty') }}</p>
</template>
```

---

## 17. Deprecated Patterns

| Deprecated | Use Instead | Reason |
|------------|-------------|--------|
| Options API | `<script setup>` | Modern, better TypeScript support |
| `useToast` composable | `useToastStore` | Single source of truth |
| Direct axios imports | Service layer | Centralized API handling |
| `export default {}` | Named exports | Better tree-shaking |
| `type` for objects | `interface` | Extendable, better errors |
| `any` type | `unknown` or proper type | Type safety |
| Inline styles | Tailwind classes | Consistency |
| Magic numbers | Constants files | Maintainability |
| Deep folder nesting | Flat structure | Simplicity |
| Hardcoded text | Translation system | i18n support |

---

## 18. Quick Reference

### Common Tailwind Patterns

```vue
<!-- Card -->
<div class="bg-white rounded-xl shadow-md p-6">

<!-- Button Primary -->
<button class="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600
  transition-colors duration-300 font-medium">

<!-- Button Secondary -->
<button class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200
  transition-colors duration-300 font-medium">

<!-- Input -->
<input class="w-full px-4 py-3 border border-gray-300 rounded-lg
  focus:ring-2 focus:ring-amber-500 focus:border-transparent">

<!-- Status Badges -->
<span class="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
<span class="px-3 py-1 text-sm font-medium rounded-full bg-amber-100 text-amber-800">
<span class="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
```

### Import Order

```typescript
// 1. Vue/framework imports
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 2. Third-party libraries
import { format } from 'date-fns'

// 3. Stores
import { useApartmentsStore } from '@/stores/admin/apartments'
import { useToastStore } from '@/stores/ui/toast'

// 4. Services
import { apartmentService } from '@/services/apartmentService'

// 5. Composables
import { useAutoSave } from '@/composables/useAutoSave'

// 6. Components
import ApartmentCard from '@/components/apartments/ApartmentCard.vue'
import { BaseButton, FormField } from '@/components/ui'

// 7. Constants
import { APARTMENT_CONSTANTS } from './constants'

// 8. Types (always last, with 'type' keyword)
import type { Apartment, CreateApartmentDTO } from '@/types'
```

### File Size Limits

| File Type | Target | Maximum |
|-----------|--------|---------|
| Component | 150 lines | 300 lines |
| Composable | 100 lines | 200 lines |
| Store | 150 lines | 300 lines |
| Service | 80 lines | 150 lines |
| Utility | 50 lines | 100 lines |

### Naming Conventions

| Concept | Convention | Example |
|---------|------------|---------|
| Vue Components | PascalCase | `ApartmentCard.vue` |
| Composables | camelCase + `use` | `useAutoSave.ts` |
| Stores | camelCase + `use` | `useApartmentsStore` |
| Services | camelCase + suffix | `apartmentService.ts` |
| Types/Interfaces | PascalCase | `interface Apartment` |
| Constants | SCREAMING_SNAKE | `const MAX_FILE_SIZE` |
| Props | camelCase | `:isActive="true"` |
| Events | kebab-case | `@update:model-value` |
| Route Names | kebab-case | `admin-apartment-list` |
| Files (non-Vue) | kebab-case | `use-auto-save.ts` |

### Git Commit Format

```
<type>(<scope>): <description>

feat(apartments): add bulk status update
fix(auth): resolve token refresh race condition
refactor(stores): extract common CRUD logic
docs(readme): update setup instructions
test(apartments): add store unit tests
chore(deps): update Vue to 3.5.13
style(ui): fix button hover states
perf(lists): add virtualization for large lists
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`

---

## Summary

This guide ensures:

- **Consistent architecture** with clear separation of concerns
- **Type safety** with proper TypeScript patterns
- **Maintainability** with proper file organization and barrel exports
- **Performance** with code splitting and optimization patterns
- **Accessibility** with semantic HTML and ARIA support
- **Internationalization** with translation system
- **Quality** with comprehensive testing patterns

**When in doubt:**
1. Check existing patterns in the codebase
2. Reference the anti-patterns section
3. Run the code review checklist
4. Ask for clarification

---

**Last Updated:** December 2024
**Version:** 3.0.0
**Maintainers:** Unity Development Team
