/**
 * CRM Type Definitions
 * Types for CRM system including deals, stages, activities, and payments
 */

// Currency types
export type DealCurrency = 'USD' | 'GEL' | 'EUR'

export const CURRENCY_SYMBOLS: Record<DealCurrency, string> = {
  USD: '$',
  GEL: '₾',
  EUR: '€',
}

// Stage types
export type StageType = 'open' | 'won' | 'lost'

export interface CrmStage {
  id: number
  name: string
  order: number
  type: StageType
  color: string
  days_until_stale: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Lost reasons
export interface CrmLostReason {
  id: number
  label: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Deal priority
export type DealPriority = 'low' | 'medium' | 'high'

// Deal
export interface CrmDeal {
  id: number
  customer_id: number
  stage_id: number
  assigned_to: number | null
  apartment_id: number | null
  lost_reason_id: number | null
  title: string
  budget: number | null
  agreed_price: number | null
  currency: DealCurrency
  priority: DealPriority
  expected_close_date: string | null
  actual_close_date: string | null
  notes: string | null
  last_activity_at: string | null
  created_at: string
  updated_at: string

  // Relationships
  customer?: {
    id: number
    name: string
    email: string | null
    phone: string | null
  }
  stage?: CrmStage
  assigned_user?: {
    id: number
    name: string
    email: string
  }
  apartment?: {
    id: number
    apartment_number: string
    area_total: number
    building?: {
      id: number
      identifier: string
      name?: string | Record<string, string> // Can be string or translations object
      name_ka?: string
      name_en?: string
      name_ru?: string
      project?: {
        id: number
        title?: string | Record<string, string>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        calculator_settings?: Record<string, any> // Calculator settings (flexible structure)
      }
    }
  }
  lost_reason?: CrmLostReason
  activities?: CrmActivity[]
  payments?: CrmPayment[]

  // Offers & Pricing (New fields)
  offered_price_per_sqm?: number
  offered_price_total?: number
  offered_at?: string
  
  reserved_price_per_sqm?: number
  reserved_price_total?: number
  reserved_at?: string
  
  final_price_per_sqm?: number
  final_price_total?: number
  final_at?: string
  
  selected_payment_alternative?: number
  payment_alternative_params?: PaymentAlternativeParams
  
  current_price?: number // Accessor from backend

  // Computed properties
  is_stale?: boolean
  days_in_stage?: number
  total_paid?: number
  payment_progress?: number
}

// Payment Calculator Params (Stored in JSON)
export interface PaymentAlternativeParams {
  internal_installment_months?: number
  bank_installment_months?: number
  initial_payment_percent?: number
  price_per_sqm?: number
}

// Deal form data
export interface DealFormData {
  customer_id: number
  stage_id?: number  // If not provided, will use first 'open' stage
  title: string
  budget?: number
  agreed_price?: number
  currency?: DealCurrency
  apartment_id?: number
  assigned_to?: number
  user_id?: number
  priority?: DealPriority
  expected_close_date?: string
  notes?: string
}

// Deal update data
export interface DealUpdateData {
  title?: string
  budget?: number
  agreed_price?: number
  currency?: DealCurrency
  apartment_id?: number
  assigned_to?: number
  user_id?: number
  priority?: DealPriority
  expected_close_date?: string
  notes?: string
}

// Pricing update data
export interface DealPricingFormData {
  stage: 'offered' | 'reserved' | 'final'
  price_per_sqm: number
  payment_alternative?: number // 1-6
  payment_params?: PaymentAlternativeParams
}

// Calculator result (frontend helper)
export interface DealCalculatorResult {
  total: number
  initialPercentage: number
  initialAmount: number
  internalMonths: number
  internalMonthly: number
  bankMonths: number
  bankMonthly: number
  discount: number
  finalPricePerSqm: number
}

// Stage change data
export interface StageChangeData {
  stage_id: number
  lost_reason_id?: number
  carry_forward_pricing?: boolean
}

// Activity types
export type ActivityType = 'note' | 'call' | 'email' | 'meeting' | 'status_change' | 'payment' | 'system'

export interface CrmActivity {
  id: number
  deal_id: number
  user_id: number | null
  type: ActivityType
  content: string  // Fixed: use 'content' to match backend schema
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string

  // Relationships
  user?: {
    id: number
    name: string
  }
}

// Activity form data
export interface ActivityFormData {
  deal_id: number
  type: ActivityType
  content: string  // Backend expects 'content' not 'description'
  scheduled_at?: string
}

// Payment status
export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'partially_paid' | 'cancelled'

export interface CrmPayment {
  id: number
  deal_id: number
  calculator_generated: boolean // NEW: flag for calculator vs manual payments
  title: string // Description of the payment
  installment_number: number | null // Month number in schedule (0 = down payment, 1+ = installments)
  amount_due: number // Original scheduled amount
  amount_paid: number // Actual amount paid (for partial payments)
  currency: DealCurrency
  due_date: string
  paid_date: string | null
  status: PaymentStatus
  payment_method: string | null
  transaction_reference: string | null // NEW: transaction ID
  notes: string | null
  created_at: string
  updated_at: string
}

// Payment form data
export interface PaymentFormData {
  deal_id: number
  amount: number
  currency: DealCurrency
  due_date: string
  notes?: string
}

// Payment update data
export interface PaymentUpdateData {
  status?: PaymentStatus
  paid_date?: string
  amount_paid?: number // For tracking partial/full payments
  payment_method?: string
  transaction_reference?: string
  notes?: string
}

// Payment schedule generation
export interface PaymentScheduleData {
  total_amount: number
  down_payment: number
  number_of_installments: number
  start_date: string
  interval_months: number
}

// Kanban column
export interface KanbanColumn {
  id: number
  name: string
  slug: string // Stage slug (e.g., 'new-lead', 'contract', 'won')
  type: StageType
  color: string
  deals: CrmDeal[]
  total_value: number
  deal_count: number
}

// Statistics
export interface CrmStatistics {
  total_deals: number
  total_value: number
  deals_by_stage: Record<number, number>
  conversion_rate: number
  average_deal_value: number
  total_won: number
  total_lost: number
  pipeline_velocity: number
}

// API Response types
export interface CrmPipelineResponse {
  pipeline: KanbanColumn[]
}

export interface CrmStagesResponse {
  data: CrmStage[]
}

export interface CrmLostReasonsResponse {
  data: CrmLostReason[]
}

export interface CrmDealResponse {
  data: CrmDeal
}

export interface CrmDealsResponse {
  data: CrmDeal[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface CrmActivitiesResponse {
  data: CrmActivity[]
}

export interface CrmPaymentSummary {
  total_due: number
  total_paid: number
  payment_progress: number
  remaining: number
}

export interface CrmPaymentsResponse {
  data: {
    payments: CrmPayment[]
    summary: CrmPaymentSummary
    pagination: {
      total: number
      per_page: number
      current_page: number
      last_page: number
    }
  }
}

export interface CrmStatisticsResponse {
  data: CrmStatistics
}

// ============================================================
// Financial Dashboard Types
// ============================================================

export interface FinancialDashboardMetrics {
  total_sold_value: number
  total_paid: number
  total_outstanding: number
  apartments_available: number
  apartments_reserved: number
  apartments_sold: number
  overdue_payments_count: number
  overdue_payments_value: number
  payment_collection_rate: number
}

export interface UpcomingPayment {
  id: number
  deal_id: number
  customer_name: string
  apartment_number: string
  project_title: string
  amount_due: number
  amount_paid: number
  remaining_amount: number
  currency: string
  due_date: string
  status: string
  days_until_due: number
  is_overdue: boolean
}

export interface FinancialDashboardData {
  metrics: FinancialDashboardMetrics
  upcoming_payments: UpcomingPayment[]
}

export interface FinancialDashboardResponse {
  data: FinancialDashboardData
}
