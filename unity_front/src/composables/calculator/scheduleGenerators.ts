/**
 * Payment Schedule Generators
 * Functions for generating various payment schedules
 */

import { addMonths } from 'date-fns'
import type { PaymentScheduleItem } from '@/types/admin/calculator'

/**
 * Generate standard monthly payment schedule
 */
export function generateStandardSchedule(
  downPayment: number,
  monthlyPayment: number,
  numberOfMonths: number,
  startDate: Date,
): PaymentScheduleItem[] {
  const schedule: PaymentScheduleItem[] = []
  let remaining = downPayment > 0 ? monthlyPayment * numberOfMonths : 0

  if (downPayment > 0) {
    schedule.push({
      month: 0,
      date: startDate,
      amount: downPayment,
      remainingBalance: remaining,
      description: 'Down Payment / შენატანი',
    })
  }

  for (let i = 1; i <= numberOfMonths; i++) {
    const paymentDate = addMonths(startDate, i)
    const payment = i === numberOfMonths ? remaining : monthlyPayment
    remaining -= payment

    schedule.push({
      month: i,
      date: paymentDate,
      amount: payment,
      remainingBalance: Math.max(0, remaining),
      description: 'Monthly Payment / ყოველთვიური გადახდა',
    })
  }

  return schedule
}

/**
 * Generate balloon payment schedule
 */
export function generateBalloonSchedule(
  downPayment: number,
  monthlyPayment: number,
  monthsUntilCompletion: number,
  balloonPayment: number,
  completionDate: Date,
): PaymentScheduleItem[] {
  const schedule: PaymentScheduleItem[] = []
  const startDate = new Date()
  let remaining = monthlyPayment * monthsUntilCompletion + balloonPayment

  if (downPayment > 0) {
    schedule.push({
      month: 0,
      date: startDate,
      amount: downPayment,
      remainingBalance: remaining,
      description: 'Down Payment / შენატანი',
    })
  }

  for (let i = 1; i <= monthsUntilCompletion; i++) {
    const paymentDate = addMonths(startDate, i)
    remaining -= monthlyPayment

    schedule.push({
      month: i,
      date: paymentDate,
      amount: monthlyPayment,
      remainingBalance: Math.max(0, remaining),
      description: 'Monthly Payment / ყოველთვიური გადახდა',
    })
  }

  if (balloonPayment > 0) {
    schedule.push({
      month: monthsUntilCompletion + 1,
      date: new Date(completionDate),
      amount: balloonPayment,
      remainingBalance: 0,
      description: 'Remaining for Bank / დარჩენილი თანხა ბანკისთვის',
    })
  }

  return schedule
}

/**
 * Generate one-time payment schedule (for full upfront)
 */
export function generateOneTimeSchedule(
  downPayment: number,
  totalPrice: number,
  completionDate: Date,
  customDate?: string,
  customAmount?: number,
  customPayments?: Array<{ date: string; amount: number }>,
): PaymentScheduleItem[] {
  const schedule: PaymentScheduleItem[] = []
  let remaining = totalPrice - downPayment

  schedule.push({
    month: 0,
    date: new Date(),
    amount: downPayment,
    remainingBalance: remaining,
    description: 'Down Payment / შენატანი',
  })

  if (customPayments && customPayments.length > 0) {
    const sortedPayments = [...customPayments].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    sortedPayments.forEach((payment, index) => {
      remaining -= payment.amount
      schedule.push({
        month: index + 1,
        date: new Date(payment.date),
        amount: payment.amount,
        remainingBalance: Math.max(0, remaining),
        description: 'Scheduled Payment / დაგეგმილი გადახდა',
      })
    })
  } else {
    const finalAmount = customAmount !== undefined ? customAmount : remaining
    if (finalAmount > 0) {
      const finalDate = customDate ? new Date(customDate) : new Date(completionDate)
      schedule.push({
        month: 1,
        date: finalDate,
        amount: finalAmount,
        remainingBalance: 0,
        description: 'Balance Payment at Completion / დარჩენილი თანხა მშენებლობის დასრულებისას',
      })
    }
  }

  return schedule
}

/**
 * Generate negotiated payment schedule (for Alternative 4)
 */
export function generateNegotiatedSchedule(
  downPayment: number,
  remainingPayment: number,
  completionDate: Date,
  customDate?: string,
  customAmount?: number,
  customPayments?: Array<{ date: string; amount: number }>,
): PaymentScheduleItem[] {
  const schedule: PaymentScheduleItem[] = []
  let remaining = remainingPayment

  schedule.push({
    month: 0,
    date: new Date(),
    amount: downPayment,
    remainingBalance: remaining,
    description: 'Down Payment / შენატანი',
  })

  if (customPayments && customPayments.length > 0) {
    const sortedPayments = [...customPayments].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    sortedPayments.forEach((payment, index) => {
      remaining -= payment.amount
      schedule.push({
        month: index + 1,
        date: new Date(payment.date),
        amount: payment.amount,
        remainingBalance: Math.max(0, remaining),
        description: 'Scheduled Payment / დაგეგმილი გადახდა',
      })
    })
  } else {
    const finalAmount = customAmount !== undefined ? customAmount : remainingPayment
    if (finalAmount > 0) {
      const finalDate = customDate ? new Date(customDate) : new Date(completionDate)
      schedule.push({
        month: 1,
        date: finalDate,
        amount: finalAmount,
        remainingBalance: 0,
        description: 'Balance Payment at Completion / დარჩენილი თანხა მშენებლობის დასრულებისას',
      })
    }
  }

  return schedule
}
