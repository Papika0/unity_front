/**
 * CRM Deal Composable
 * Handles deal form logic and validation
 */

import { ref, computed } from 'vue'
import type { DealFormData, DealUpdateData, DealCurrency, DealPriority } from '@/types/crm'

interface DealForm {
  customer_id: number | null
  title: string
  value: number
  currency: DealCurrency
  apartment_id: number | null
  assigned_to: number | null
  priority: DealPriority
  expected_close_date: string | null
  notes: string
}

export function useCrmDeal() {
  const form = ref<DealForm>({
    customer_id: null,
    title: '',
    value: 0,
    currency: 'USD',
    apartment_id: null,
    assigned_to: null,
    priority: 'medium',
    expected_close_date: null,
    notes: '',
  })

  const errors = ref<Record<string, string>>({})

  /**
   * Validation
   */
  const isValid = computed(() => {
    return form.value.customer_id !== null && form.value.title.trim() !== '' && form.value.value > 0
  })

  /**
   * Validate form
   */
  function validate(): boolean {
    errors.value = {}

    if (!form.value.customer_id) {
      errors.value.customer_id = 'კლიენტი სავალდებულოა'
    }

    if (!form.value.title.trim()) {
      errors.value.title = 'სათაური სავალდებულოა'
    }

    if (form.value.value <= 0) {
      errors.value.value = 'ღირებულება უნდა იყოს დადებითი'
    }

    return Object.keys(errors.value).length === 0
  }

  /**
   * Reset form
   */
  function resetForm(): void {
    form.value = {
      customer_id: null,
      title: '',
      value: 0,
      currency: 'USD',
      apartment_id: null,
      assigned_to: null,
      priority: 'medium',
      expected_close_date: null,
      notes: '',
    }
    errors.value = {}
  }

  /**
   * Set form data (for editing)
   */
  function setFormData(data: Partial<DealForm>): void {
    form.value = {
      ...form.value,
      ...data,
    }
  }

  /**
   * Get form data for create
   */
  function getFormData(): DealFormData {
    return {
      customer_id: form.value.customer_id!,
      title: form.value.title,
      value: form.value.value,
      currency: form.value.currency,
      apartment_id: form.value.apartment_id ?? undefined,
      assigned_to: form.value.assigned_to ?? undefined,
      priority: form.value.priority,
      expected_close_date: form.value.expected_close_date ?? undefined,
      notes: form.value.notes || undefined,
    }
  }

  /**
   * Get update data (only changed fields)
   */
  function getUpdateData(): DealUpdateData {
    const data: DealUpdateData = {}

    if (form.value.title) data.title = form.value.title
    if (form.value.value > 0) data.value = form.value.value
    if (form.value.currency) data.currency = form.value.currency
    if (form.value.apartment_id !== null) data.apartment_id = form.value.apartment_id
    if (form.value.assigned_to !== null) data.assigned_to = form.value.assigned_to
    if (form.value.priority) data.priority = form.value.priority
    if (form.value.expected_close_date) data.expected_close_date = form.value.expected_close_date
    if (form.value.notes) data.notes = form.value.notes

    return data
  }

  return {
    form,
    errors,
    isValid,
    validate,
    resetForm,
    setFormData,
    getFormData,
    getUpdateData,
  }
}
