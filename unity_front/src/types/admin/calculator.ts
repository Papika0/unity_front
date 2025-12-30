// Calculator Types

export interface ProjectCalculatorSettings {
  alternatives: {
    alt1: {
      enabled: boolean
      deadline: string // ISO date string
    }
    alt2: {
      enabled: boolean
      surcharge_percent: number
      deadline: string // ISO date string
    }
    alt3: {
      enabled: boolean
      discount_percent: number
      deadline: string // ISO date string - construction completion
    }
    alt4: {
      enabled: boolean
      discount_percent: number
      deadline: string // ISO date string - construction completion
    }
    alt5: {
      enabled: boolean
      deadline: string // ISO date string
      price_increase_per_sqm: number
    }
    alt6: {
      enabled: boolean
      deadline: string // ISO date string
      price_increase_per_sqm: number
    }
  }
  payment_terms: {
    min_down_payment_percent: number
    max_down_payment_percent: number
    min_monthly_payment: number
    min_monthly_payment_alt6: number
  }
}

export interface CalculationInput {
  basePrice: number // Per sqm
  area: number // Square meters
  alternative: 1 | 2 | 3 | 4 | 5 | 6
  projectSettings: ProjectCalculatorSettings
  downPaymentPercent?: number
  monthlyPayment?: number
  startDate?: Date // Start date for the schedule (defaults to now)
  customPaymentDate?: string // Optional custom date for Alt 3 & 4 (deprecated, use customPayments)
  customPaymentAmount?: number // Optional custom amount for Alt 3 & 4 (deprecated, use customPayments)
  customPayments?: Array<{ date: string, amount: number }> // Multiple custom scheduled payments for Alt 3 & 4
}

export interface CalculationResult {
  totalPrice: number
  downPayment: number
  monthlyPayment: number
  numberOfMonths: number
  finalBalloonPayment: number
  remainingAfterDown: number
  priceModifier: string // "+12%", "-10%", etc.
  priceModifierValue: number // Actual $ amount added/subtracted
  paymentSchedule: PaymentScheduleItem[]
}

export interface PaymentScheduleItem {
  month: number
  date: Date
  amount: number
  remainingBalance: number
  description: string
}

export interface BankLoanInput {
  basePrice: number
  area: number
  selectedBank: BankRate
  downPaymentPercent: number
  loanTermYears: number
}

export interface BankLoanResult {
  baseTotal: number
  downPayment: number
  loanAmount: number
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
  effectiveAPR: number
  paymentSchedule: BankPaymentItem[]
}

export interface BankPaymentItem {
  month: number
  date: Date
  payment: number
  principal: number
  interest: number
  remainingBalance: number
}

export interface BankRate {
  id: number
  bank_name: string
  bank_name_ka: string
  bank_name_en: string
  bank_name_ru: string
  interest_rate: number
  min_loan_term_years: number
  max_loan_term_years: number
  min_down_payment_percent: number
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface BankRateFormData {
  bank_name: string
  bank_name_ka: string
  bank_name_en: string
  bank_name_ru: string
  interest_rate: number
  min_loan_term_years: number
  max_loan_term_years: number
  min_down_payment_percent: number
  is_active: boolean
}

export interface BankRatesResponse {
  success: boolean
  data: BankRate[]
}

export interface BankRateResponse {
  success: boolean
  data?: BankRate
  message?: string
}

export interface ActiveProject {
  id: number
  title: string
  title_ka: string
  title_en: string
  title_ru: string
  status: string
  base_price_per_sqm: number | null
  construction_completion_date: string | null
  calculator_settings: ProjectCalculatorSettings | null
}

export interface ActiveProjectsResponse {
  success: boolean
  data: ActiveProject[]
}

export interface ProjectCalculatorSettingsResponse {
  success: boolean
  data: {
    base_price_per_sqm: number
    construction_completion_date: string
    calculator_settings: ProjectCalculatorSettings
  }
}
