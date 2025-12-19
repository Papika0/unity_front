# STANDARDS.md - Unity Real Estate Platform

**Version:** 2.0.0
**Stack:** Vue 3.5 + TypeScript 5.8 + Pinia 3.0 + Tailwind CSS 3.4
**Build:** Vite 6.2

This document defines the architectural standards, coding conventions, and best practices for the Unity Real Estate Platform frontend.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Component Architecture](#2-component-architecture)
3. [State Management (Pinia)](#3-state-management-pinia)
4. [Service Layer (API)](#4-service-layer-api)
5. [Composables](#5-composables)
6. [TypeScript & Types](#6-typescript--types)
7. [Styling (Tailwind)](#7-styling-tailwind)
8. [Error Handling](#8-error-handling)
9. [Performance](#9-performance)
10. [Testing](#10-testing)
11. [Accessibility](#11-accessibility)
12. [Naming Conventions](#12-naming-conventions)
13. [Common Workflows](#13-common-workflows)

---

## 1. Project Structure

### Directory Layout

```
src/
├── assets/              # Static assets (images, global CSS)
├── components/
│   ├── ui/              # Generic UI primitives (Button, Modal, Toast)
│   ├── admin/           # Admin-specific components
│   │   ├── forms/       # Form components with validation
│   │   └── [feature]/   # Feature-specific admin components
│   ├── apartments/      # Apartment selection/display components
│   ├── home/            # Homepage-specific components
│   └── icons/           # SVG icon components
├── composables/         # Reusable composition functions (useXxx)
├── layouts/             # Page shells (PublicLayout, AdminRootLayout)
├── plugins/
│   └── axios/           # Axios instance & interceptors
├── router/
│   ├── index.ts         # Route definitions
│   └── guards.ts        # Auth & role guards
├── services/            # API service layer (one file per domain)
├── stores/
│   ├── admin/           # Admin feature stores
│   ├── auth/            # Authentication state
│   ├── public/          # Public-facing stores
│   └── ui/              # UI state (toast, locale, translations)
├── types/
│   ├── index.ts         # Core domain types
│   ├── apartments.ts    # Apartment-specific types
│   └── admin/           # Admin-specific types
├── utils/               # Pure utility functions
└── views/
    ├── admin/           # Admin pages (organized by feature)
    └── [public pages]   # Public pages
```

### Key Principles

- **Feature-First Organization:** Group related files by feature, not file type
- **Colocation:** Feature-specific components live in the feature folder
- **Flat When Possible:** Avoid deep nesting; 3 levels max

---

## 2. Component Architecture

### 2.1 Script Setup (Required)

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

### 2.2 Component Types

| Type | Location | Responsibility |
|------|----------|----------------|
| **UI Components** | `components/ui/` | Purely presentational, prop-driven, no store access |
| **Feature Components** | `components/[feature]/` | Domain logic, may use composables |
| **View Components** | `views/` | Page-level, orchestrates stores and services |
| **Layout Components** | `layouts/` | Page structure, navigation, auth checks |

### 2.3 Component Size Limits

**Target:** < 300 lines per component
**Max:** 500 lines (requires justification)

When a component exceeds limits:
1. Extract logic into composables
2. Break into sub-components
3. Move complex computed properties to utils

```typescript
// ❌ Bad: 500+ line component with inline logic
// ✅ Good: Extract to composable
export function usePolygonEditor(zones: Ref<Zone[]>) {
  // All the complex logic lives here
  return { /* exposed API */ }
}
```

### 2.4 Don'ts

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
```

---

## 3. State Management (Pinia)

### 3.1 Setup Store Pattern (Required)

Use composition function syntax exclusively:

```typescript
// src/stores/admin/apartments.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Apartment, ApartmentStatus } from '@/types'
import { apartmentService } from '@/services/apartmentService'

export const useApartmentsStore = defineStore('apartments', () => {
  // State
  const apartments = ref<Apartment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters (computed)
  const availableApartments = computed(() =>
    apartments.value.filter(a => a.status === 'available')
  )

  const byStatus = computed(() => (status: ApartmentStatus) =>
    apartments.value.filter(a => a.status === status)
  )

  // Actions (functions)
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

  function $reset() {
    apartments.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    apartments,
    loading,
    error,
    // Getters
    availableApartments,
    byStatus,
    // Actions
    fetchAll,
    $reset
  }
})
```

### 3.2 Store Organization

```
stores/
├── auth/
│   └── auth.ts           # User authentication, tokens
├── admin/
│   ├── projects.ts       # CRUD operations
│   ├── apartments.ts
│   ├── buildings.ts
│   └── zoneEditor.ts     # Complex editor state
├── public/
│   ├── homepage.ts
│   └── projects.ts       # Read-only public data
└── ui/
    ├── toast.ts          # Notifications (SINGLE SOURCE)
    ├── locale.ts         # Language preference
    └── translations.ts   # i18n content
```

### 3.3 Store Rules

1. **One source of truth:** Don't duplicate state between stores
2. **Minimal persistence:** Only persist to localStorage:
   - Auth tokens
   - User preferences (locale, theme)
   - Form drafts (with expiry via `useAutoSave`)
3. **Include loading/error state:** Every async store needs `loading` and `error` refs
4. **Provide `$reset()`:** For cleanup on logout or navigation

### 3.4 Toast Store (Canonical)

Use ONLY `useToastStore` for notifications:

```typescript
// ✅ Correct
import { useToastStore } from '@/stores/ui/toast'
const toast = useToastStore()
toast.success('Apartment saved')
toast.error('Failed to save')

// ❌ Wrong - Don't use the composable directly
import { useToast } from '@/composables/useToast'
```

---

## 4. Service Layer (API)

### 4.1 Service Structure

Location: `src/services/`

All API calls MUST go through services. Components and stores never import axios directly.

```typescript
// src/services/apartmentService.ts
import api from '@/plugins/axios'
import type { Apartment, CreateApartmentDTO, UpdateApartmentDTO } from '@/types'
import type { ApiResponse, PaginatedResponse } from '@/types'

export const apartmentService = {
  // List with pagination
  async getAll(params?: { page?: number; status?: string }): Promise<PaginatedResponse<Apartment>> {
    const { data } = await api.get('/apartments', { params })
    return data
  },

  // Single resource
  async getById(id: number): Promise<Apartment> {
    const { data } = await api.get<ApiResponse<Apartment>>(`/apartments/${id}`)
    return data.data
  },

  // Create
  async create(payload: CreateApartmentDTO): Promise<Apartment> {
    const { data } = await api.post<ApiResponse<Apartment>>('/apartments', payload)
    return data.data
  },

  // Update
  async update(id: number, payload: UpdateApartmentDTO): Promise<Apartment> {
    const { data } = await api.put<ApiResponse<Apartment>>(`/apartments/${id}`, payload)
    return data.data
  },

  // Delete
  async delete(id: number): Promise<void> {
    await api.delete(`/apartments/${id}`)
  },

  // Bulk operations
  async bulkUpdateStatus(ids: number[], status: string): Promise<void> {
    await api.post('/apartments/bulk-update', { ids, status })
  }
}
```

### 4.2 Service Naming

| Pattern | Example |
|---------|---------|
| Public API | `projectsApi.ts`, `newsApi.ts` |
| Admin API | `adminProjectsApi.ts`, `adminCustomerApi.ts` |
| Feature Service | `apartmentService.ts`, `authService.ts` |

### 4.3 API Response Types

```typescript
// src/types/index.ts
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status: number
}
```

---

## 5. Composables

### 5.1 Composable Patterns

Location: `src/composables/`

Composables extract reusable logic from components:

```typescript
// src/composables/useAutoSave.ts
import { ref, watch, onUnmounted } from 'vue'

interface AutoSaveOptions<T> {
  key: string
  data: Ref<T>
  delay?: number
  expiryMinutes?: number
}

export function useAutoSave<T>({ key, data, delay = 2000, expiryMinutes = 60 }: AutoSaveOptions<T>) {
  const lastSaved = ref<Date | null>(null)
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const storageKey = `draft_${key}`

  function save() {
    const payload = {
      data: data.value,
      savedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString()
    }
    localStorage.setItem(storageKey, JSON.stringify(payload))
    lastSaved.value = new Date()
  }

  function restore(): T | null {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return null

    const { data, expiresAt } = JSON.parse(stored)
    if (new Date(expiresAt) < new Date()) {
      localStorage.removeItem(storageKey)
      return null
    }
    return data
  }

  function clear() {
    localStorage.removeItem(storageKey)
    lastSaved.value = null
  }

  // Auto-save on changes
  watch(data, () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(save, delay)
  }, { deep: true })

  onUnmounted(() => {
    if (timeoutId) clearTimeout(timeoutId)
  })

  return { lastSaved, save, restore, clear }
}
```

### 5.2 Available Composables

| Composable | Purpose |
|------------|---------|
| `useAutoSave` | Draft persistence with expiry |
| `useUnsavedChanges` | Warn before navigation |
| `useProjectForm` | Project form logic & validation |
| `usePaymentCalculator` | Mortgage calculations |
| `useZoneValidation` | Polygon zone validation |
| `useTranslations` | i18n wrapper |
| `useScrollAnimation` | Intersection observer animations |
| `usePageTitle` | Dynamic document title |

### 5.3 Composable Rules

1. **Prefix with `use`:** `useFeatureName`
2. **Return object:** Always return an object, not array
3. **Handle cleanup:** Use `onUnmounted` for timers, subscriptions
4. **Document params:** Use TypeScript interfaces for options

---

## 6. TypeScript & Types

### 6.1 Type Locations

```
types/
├── index.ts           # Core domain types (User, Project, etc.)
├── apartments.ts      # Apartment domain types
├── admin/
│   └── index.ts       # Admin-specific types
└── api.ts             # API response wrappers
```

### 6.2 Type Patterns

```typescript
// Enums as union types (preferred over TS enum)
export type ApartmentStatus = 'available' | 'reserved' | 'sold'
export type ZoneType = 'building_block' | 'floor_strip' | 'apartment_unit'

// Domain models
export interface Apartment {
  id: number
  floor_number: number
  apartment_number: string
  status: ApartmentStatus
  price: number | null
  area_total: number | null
  building_id: number
  created_at: string
  updated_at: string
}

// DTOs for API operations
export interface CreateApartmentDTO {
  floor_number: number
  apartment_number: string
  status?: ApartmentStatus
  price?: number
  area_total?: number
  building_id: number
}

export interface UpdateApartmentDTO extends Partial<CreateApartmentDTO> {}

// Branded types for IDs (optional, for extra safety)
export type ApartmentId = number & { readonly __brand: 'ApartmentId' }
```

### 6.3 Type Rules

1. **No `any`:** Use `unknown` if type is truly unknown
2. **Prefer interfaces:** Use `interface` for objects, `type` for unions
3. **Separate DTOs:** Create/Update DTOs distinct from domain models
4. **Null vs undefined:** Use `null` for intentional absence, `undefined` for optional

---

## 7. Styling (Tailwind)

### 7.1 Utility-First Approach

```vue
<template>
  <!-- ✅ Good: Utility classes -->
  <button class="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600
    text-white font-medium hover:shadow-lg transition-all duration-300">
    Save
  </button>
</template>
```

### 7.2 Dynamic Classes

```vue
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ variant: 'primary' | 'secondary'; disabled?: boolean }>()

const buttonClass = computed(() => [
  'px-4 py-2 rounded-lg font-medium transition-all duration-300',
  props.variant === 'primary'
    ? 'bg-amber-500 text-white hover:bg-amber-600'
    : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
  props.disabled && 'opacity-50 cursor-not-allowed'
])
</script>

<template>
  <button :class="buttonClass" :disabled="disabled">
    <slot />
  </button>
</template>
```

### 7.3 Design Tokens

Use the extended Tailwind config for consistency:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: { /* Purple palette 50-900 */ },
      gold: { 400: '#...', 500: '#...', 600: '#...' }
    }
  }
}
```

### 7.4 Styling Don'ts

```css
/* ❌ Avoid @apply for one-off styles */
.my-button {
  @apply px-4 py-2 rounded bg-blue-500;
}

/* ✅ Only use @apply for truly global, reusable patterns */
.prose-content h1 {
  @apply text-3xl font-bold mb-4;
}
```

---

## 8. Error Handling

### 8.1 API Error Handling

```typescript
// src/plugins/axios/api.ts
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status

    if (status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
    }

    if (status === 422) {
      // Validation errors - let caller handle
      return Promise.reject(error.response.data)
    }

    if (status >= 500) {
      const toast = useToastStore()
      toast.error('Server error. Please try again later.')
    }

    return Promise.reject(error)
  }
)
```

### 8.2 Store Error Handling

```typescript
// In store actions
async function saveApartment(data: CreateApartmentDTO) {
  loading.value = true
  error.value = null

  try {
    const result = await apartmentService.create(data)
    apartments.value.push(result)
    return result
  } catch (e) {
    if (e && typeof e === 'object' && 'errors' in e) {
      // Validation error - rethrow for form handling
      throw e
    }
    error.value = e instanceof Error ? e.message : 'Failed to save apartment'
    throw e
  } finally {
    loading.value = false
  }
}
```

### 8.3 Component Error Handling

```vue
<script setup lang="ts">
const toast = useToastStore()
const validationErrors = ref<Record<string, string[]>>({})

async function handleSubmit() {
  try {
    await store.saveApartment(formData.value)
    toast.success('Apartment saved successfully')
  } catch (e) {
    if (e && typeof e === 'object' && 'errors' in e) {
      validationErrors.value = (e as { errors: Record<string, string[]> }).errors
    } else {
      toast.error('Failed to save apartment')
    }
  }
}
</script>
```

---

## 9. Performance

### 9.1 Code Splitting

```typescript
// src/router/index.ts
const routes = [
  {
    path: '/admin',
    component: () => import('@/layouts/AdminRootLayout.vue'),
    children: [
      {
        path: 'apartments',
        component: () => import('@/views/admin/apartments/ApartmentList.vue')
      }
    ]
  }
]
```

### 9.2 Image Optimization

Use the existing `imageCompression` utility:

```typescript
import { compressImage } from '@/utils/imageCompression'

const compressed = await compressImage(file, {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8
})
```

### 9.3 List Virtualization

For large lists (100+ items), use virtual scrolling:

```vue
<script setup lang="ts">
// Consider using @vueuse/core useVirtualList or vue-virtual-scroller
</script>
```

### 9.4 Reactive Data

```typescript
// ✅ Use shallowRef for large arrays that replace entirely
const apartments = shallowRef<Apartment[]>([])

// ✅ Use computed for derived state
const filtered = computed(() => apartments.value.filter(...))

// ❌ Don't create computed inside loops
items.forEach(item => {
  const derived = computed(() => ...) // Bad!
})
```

---

## 10. Testing

### 10.1 Test Structure

```
tests/
├── unit/
│   ├── composables/
│   ├── stores/
│   └── utils/
├── component/
│   └── components/
└── e2e/
    └── flows/
```

### 10.2 Unit Test Example

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
})
```

### 10.3 Component Test Example

```typescript
// tests/component/ApartmentCard.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ApartmentCard from '@/components/apartments/ApartmentCard.vue'

describe('ApartmentCard', () => {
  it('emits select event on click', async () => {
    const wrapper = mount(ApartmentCard, {
      props: {
        apartment: { id: 1, status: 'available', apartment_number: '101' }
      }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('select')).toEqual([[1]])
  })
})
```

### 10.4 Test Commands

```bash
npm run test           # Run unit tests
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report
```

---

## 11. Accessibility

### 11.1 Semantic HTML

```vue
<!-- ✅ Good -->
<button @click="save">Save</button>
<nav aria-label="Main navigation">...</nav>
<main>...</main>

<!-- ❌ Bad -->
<div @click="save">Save</div>
<div class="nav">...</div>
```

### 11.2 ARIA Attributes

```vue
<template>
  <div
    role="listbox"
    :aria-label="label"
    :aria-activedescendant="activeId"
  >
    <div
      v-for="option in options"
      :key="option.id"
      role="option"
      :aria-selected="option.id === selectedId"
      :id="`option-${option.id}`"
    >
      {{ option.label }}
    </div>
  </div>
</template>
```

### 11.3 Focus Management

```typescript
// Focus trap for modals
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

const { activate, deactivate } = useFocusTrap(modalRef)

watch(isOpen, (open) => {
  open ? activate() : deactivate()
})
```

### 11.4 Color Contrast

- Ensure 4.5:1 contrast ratio for normal text
- Ensure 3:1 contrast ratio for large text
- Don't rely solely on color to convey information

---

## 12. Naming Conventions

| Concept | Convention | Example |
|---------|------------|---------|
| Vue Components | PascalCase | `ApartmentCard.vue` |
| Composables | camelCase + `use` prefix | `useAutoSave.ts` |
| Stores | camelCase + `use` prefix | `useApartmentsStore` |
| Services | camelCase + suffix | `apartmentService.ts` |
| Types/Interfaces | PascalCase | `interface Apartment` |
| Type Aliases | PascalCase | `type ApartmentStatus` |
| Constants | SCREAMING_SNAKE | `const MAX_FILE_SIZE` |
| Props | camelCase | `:isActive="true"` |
| Events | kebab-case | `@update:model-value` |
| CSS Classes | kebab-case | `apartment-card` |
| Route Names | kebab-case | `admin-apartment-list` |
| API Endpoints | kebab-case | `/apartments/bulk-update` |

---

## 13. Common Workflows

### 13.1 Adding a New Feature

```bash
# 1. Create types
touch src/types/reviews.ts

# 2. Create service
touch src/services/reviewService.ts

# 3. Create store (if needed)
touch src/stores/admin/reviews.ts

# 4. Create components
mkdir src/components/reviews
touch src/components/reviews/ReviewList.vue
touch src/components/reviews/ReviewCard.vue

# 5. Create view
mkdir src/views/admin/reviews
touch src/views/admin/reviews/ReviewsPage.vue

# 6. Add route
# Edit src/router/index.ts

# 7. Add tests
mkdir tests/unit/stores
touch tests/unit/stores/reviews.spec.ts
```

### 13.2 Adding an API Endpoint

```typescript
// 1. Add types (src/types/index.ts)
export interface Review {
  id: number
  content: string
  rating: number
  created_at: string
}

// 2. Add service method (src/services/reviewService.ts)
export const reviewService = {
  async getAll() {
    const { data } = await api.get<ApiResponse<Review[]>>('/reviews')
    return data.data
  }
}

// 3. Use in store or component
const reviews = await reviewService.getAll()
```

### 13.3 Creating a Reusable Component

```vue
<!-- src/components/ui/Badge.vue -->
<script setup lang="ts">
type Variant = 'success' | 'warning' | 'error' | 'info'

const props = withDefaults(defineProps<{
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
}>(), {
  variant: 'info',
  size: 'md'
})

const classes = computed(() => {
  const base = 'inline-flex items-center font-medium rounded-full'
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-3 py-1 text-sm', lg: 'px-4 py-1.5 text-base' }
  const variants = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  }
  return [base, sizes[props.size], variants[props.variant]]
})
</script>

<template>
  <span :class="classes"><slot /></span>
</template>
```

---

## Appendix: Quick Reference

### File Size Limits

| File Type | Target | Max |
|-----------|--------|-----|
| Component | 300 lines | 500 lines |
| Composable | 150 lines | 300 lines |
| Store | 200 lines | 400 lines |
| Service | 100 lines | 200 lines |

### Import Order

```typescript
// 1. Vue/framework imports
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

// 2. Third-party libraries
import { format } from 'date-fns'

// 3. Internal - stores
import { useApartmentsStore } from '@/stores/admin/apartments'

// 4. Internal - services
import { apartmentService } from '@/services/apartmentService'

// 5. Internal - composables
import { useAutoSave } from '@/composables/useAutoSave'

// 6. Internal - components
import ApartmentCard from '@/components/apartments/ApartmentCard.vue'

// 7. Internal - types
import type { Apartment } from '@/types'
```

### Git Commit Message Format

```
<type>(<scope>): <description>

feat(apartments): add bulk status update functionality
fix(auth): resolve token refresh race condition
refactor(stores): extract common CRUD logic to base store
docs(readme): update development setup instructions
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`

---

**Last Updated:** December 2024
**Maintainers:** Unity Development Team
