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
  reason: string
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
    full_name: string
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
    number: string
    building?: {
      identifier: string
    }
  }
  lost_reason?: CrmLostReason
  activities?: CrmActivity[]
  payments?: CrmPayment[]

  // Computed properties
  is_stale?: boolean
  days_in_stage?: number
  total_paid?: number
  payment_progress?: number
}

// Deal form data
export interface DealFormData {
  customer_id: number
  stage_id?: number  // If not provided, will use first 'open' stage
  title: string
  value?: number
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
  value?: number
  currency?: DealCurrency
  apartment_id?: number
  assigned_to?: number
  priority?: DealPriority
  expected_close_date?: string
  notes?: string
}

// Stage change data
export interface StageChangeData {
  stage_id: number
  lost_reason_id?: number
}

// Activity types
export type ActivityType = 'note' | 'call' | 'email' | 'meeting' | 'status_change' | 'payment' | 'system'

export interface CrmActivity {
  id: number
  deal_id: number
  user_id: number | null
  type: ActivityType
  description: string
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
  amount: number
  currency: DealCurrency
  due_date: string
  paid_date: string | null
  status: PaymentStatus
  payment_method: string | null
  transaction_reference: string | null
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

export interface CrmPaymentsResponse {
  data: CrmPayment[]
}

export interface CrmStatisticsResponse {
  data: CrmStatistics
}
