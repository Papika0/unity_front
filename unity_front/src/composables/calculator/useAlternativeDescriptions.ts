/**
 * Alternative Descriptions Composable
 * Provides metadata for all 6 payment alternatives including titles, descriptions, and constraints
 *
 * NOW DYNAMIC: Reads constraint values from project's calculator_settings instead of hardcoding them
 */

import type { ProjectCalculatorSettings } from '@/types/admin/calculator'

export interface AlternativeInfo {
  id: 1 | 2 | 3 | 4 | 5 | 6
  title: { ka: string; en: string; ru: string }
  description: { ka: string; en: string; ru: string }
  downPaymentRange: { min: number; max: number } | null
  minMonthlyPayment: number | null
}

export const useAlternativeDescriptions = (
  calculatorSettings: ProjectCalculatorSettings | null
): AlternativeInfo[] => {
  // Extract dynamic values from payment_terms with fallback defaults
  const paymentTerms = calculatorSettings?.payment_terms
  const minDown = paymentTerms?.min_down_payment_percent ?? 20
  const maxDown = paymentTerms?.max_down_payment_percent ?? 30
  const minMonthly = paymentTerms?.min_monthly_payment ?? 800
  const minMonthlyAlt6 = paymentTerms?.min_monthly_payment_alt6 ?? 1500

  // Get dynamic surcharge/discount percentages for descriptions
  const alt2Surcharge = calculatorSettings?.alternatives.alt2.surcharge_percent ?? 12
  const alt3Discount = calculatorSettings?.alternatives.alt3.discount_percent ?? 10
  const alt4Discount = calculatorSettings?.alternatives.alt4.discount_percent ?? 5
  const alt5PriceIncrease = calculatorSettings?.alternatives.alt5.price_increase_per_sqm ?? 250
  const alt6PriceIncrease = calculatorSettings?.alternatives.alt6.price_increase_per_sqm ?? 180

  return [
    {
      id: 1,
      title: {
        ka: 'ალტერნატივა 1: სტანდარტული',
        en: 'Alternative 1: Standard',
        ru: 'Альтернатива 1: Стандарт'
      },
      description: {
        ka: `${minDown}-${maxDown}% შენატანი, პროპორციული განვადება`,
        en: `${minDown}-${maxDown}% down, proportional installments`,
        ru: `${minDown}-${maxDown}% первоначальный взнос, пропорциональные платежи`
      },
      downPaymentRange: { min: minDown, max: maxDown },
      minMonthlyPayment: null
    },
    {
      id: 2,
      title: {
        ka: 'ალტერნატივა 2: შიდა განვადება',
        en: 'Alternative 2: Internal Installment',
        ru: 'Альтернатива 2: Внутренняя рассрочка'
      },
      description: {
        ka: `${minDown}-${maxDown}% შენატანი, $${minMonthly}/თვე, +${alt2Surcharge}% მოსაკრებელი`,
        en: `${minDown}-${maxDown}% down, $${minMonthly}/month, +${alt2Surcharge}% surcharge`,
        ru: `${minDown}-${maxDown}% первоначальный взнос, $${minMonthly}/месяц, +${alt2Surcharge}% надбавка`
      },
      downPaymentRange: { min: minDown, max: maxDown },
      minMonthlyPayment: minMonthly
    },
    {
      id: 3,
      title: {
        ka: 'ალტერნატივა 3: სრული წინასწარ გადახდა',
        en: 'Alternative 3: Full Upfront',
        ru: 'Альтернатива 3: Полная предоплата'
      },
      description: {
        ka: `80-100% წინასწარ გადახდა, -${alt3Discount}% ფასდაკლება`,
        en: `80-100% upfront, -${alt3Discount}% discount`,
        ru: `80-100% предоплата, -${alt3Discount}% скидка`
      },
      downPaymentRange: { min: 80, max: 100 }, // Business rule, not configurable
      minMonthlyPayment: null
    },
    {
      id: 4,
      title: {
        ka: 'ალტერნატივა 4: დიდი წინასწარ გადახდა',
        en: 'Alternative 4: Large Upfront',
        ru: 'Альтернатива 4: Большая предоплата'
      },
      description: {
        ka: `50-80% წინასწარ გადახდა, -${alt4Discount}% ფასდაკლება`,
        en: `50-80% upfront, -${alt4Discount}% discount`,
        ru: `50-80% предоплата, -${alt4Discount}% скидка`
      },
      downPaymentRange: { min: 50, max: 80 }, // Business rule, not configurable
      minMonthlyPayment: null
    },
    {
      id: 5,
      title: {
        ka: 'ალტერნატივა 5: 0% შენატანი',
        en: 'Alternative 5: 0% Down Payment',
        ru: 'Альтернатива 5: 0% первоначальный взнос'
      },
      description: {
        ka: `0% შენატანი, მინ. $${minMonthly}/თვე, +$${alt5PriceIncrease}/კვ.მ`,
        en: `0% down, min. $${minMonthly}/month, +$${alt5PriceIncrease}/m²`,
        ru: `0% первоначальный взнос, мин. $${minMonthly}/месяц, +$${alt5PriceIncrease}/м²`
      },
      downPaymentRange: { min: 0, max: 0 },
      minMonthlyPayment: minMonthly
    },
    {
      id: 6,
      title: {
        ka: 'ალტერნატივა 6: 0% შენატანი',
        en: 'Alternative 6: 0% Down Payment',
        ru: 'Альтернатива 6: 0% первоначальный взнос'
      },
      description: {
        ka: `0% შენატანი, მინ. $${minMonthlyAlt6}/თვე, +$${alt6PriceIncrease}/კვ.მ`,
        en: `0% down, min. $${minMonthlyAlt6}/month, +$${alt6PriceIncrease}/m²`,
        ru: `0% первоначальный взнос, мин. $${minMonthlyAlt6}/месяц, +$${alt6PriceIncrease}/м²`
      },
      downPaymentRange: { min: 0, max: 0 },
      minMonthlyPayment: minMonthlyAlt6
    }
  ]
}
