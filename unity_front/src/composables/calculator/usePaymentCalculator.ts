/**
 * Payment Calculator Composable
 * Main calculation logic for payment alternatives
 */

import { differenceInMonths } from 'date-fns'
import type { CalculationInput, CalculationResult } from '@/types/admin/calculator'
import {
  generateStandardSchedule,
  generateBalloonSchedule,
  generateOneTimeSchedule,
  generateNegotiatedSchedule,
} from './scheduleGenerators'

export const usePaymentCalculator = () => {
  // ==================== HELPERS ====================
  const getMonthsDifference = (startDate: Date, endDate: Date): number => {
    const months = differenceInMonths(endDate, startDate)
    return Math.max(1, months)
  }

  // ==================== ALTERNATIVE CALCULATORS ====================
  
  /**
   * Alternative 1: Standard Price
   */
  const calculateAlternative1 = (input: CalculationInput): CalculationResult => {
    const startDate = input.startDate || new Date()
    const baseTotal = input.basePrice * input.area
    const downPaymentPercent = input.downPaymentPercent || 20
    const downPayment = baseTotal * (downPaymentPercent / 100)
    const remaining = baseTotal - downPayment

    const deadline = new Date(input.projectSettings.alternatives.alt1.deadline)
    const monthsUntilDeadline = getMonthsDifference(startDate, deadline)
    const monthlyPayment = monthsUntilDeadline > 0 ? remaining / monthsUntilDeadline : remaining

    return {
      totalPrice: baseTotal,
      downPayment,
      monthlyPayment,
      numberOfMonths: monthsUntilDeadline,
      finalBalloonPayment: 0,
      remainingAfterDown: remaining,
      priceModifier: 'Standard (0%)',
      priceModifierValue: 0,
      paymentSchedule: generateStandardSchedule(downPayment, monthlyPayment, monthsUntilDeadline, startDate),
    }
  }

  /**
   * Alternative 2: Internal Installment with Surcharge + Balloon
   */
  const calculateAlternative2 = (input: CalculationInput): CalculationResult => {
    const startDate = input.startDate || new Date()
    const baseTotal = input.basePrice * input.area
    const surchargePercent = input.projectSettings.alternatives.alt2.surcharge_percent
    const totalPrice = baseTotal * (1 + surchargePercent / 100)

    const downPaymentPercent = input.downPaymentPercent || 20
    const downPayment = totalPrice * (downPaymentPercent / 100)
    const remaining = totalPrice - downPayment

    const monthlyPayment = input.monthlyPayment || 800
    const deadline = new Date(input.projectSettings.alternatives.alt2.deadline)
    const monthsUntilDeadline = getMonthsDifference(startDate, deadline)

    const totalMonthlyPayments = monthlyPayment * monthsUntilDeadline
    const balloonPayment = Math.max(0, remaining - totalMonthlyPayments)

    return {
      totalPrice,
      downPayment,
      monthlyPayment,
      numberOfMonths: monthsUntilDeadline,
      finalBalloonPayment: balloonPayment,
      remainingAfterDown: remaining,
      priceModifier: `+${surchargePercent}%`,
      priceModifierValue: totalPrice - baseTotal,
      paymentSchedule: generateBalloonSchedule(downPayment, monthlyPayment, monthsUntilDeadline, balloonPayment, deadline, startDate),
    }
  }

  /**
   * Alternative 3: Full Upfront with Discount
   */
  const calculateAlternative3 = (input: CalculationInput): CalculationResult => {
    const start = input.startDate || new Date()
    const baseTotal = input.basePrice * input.area
    const discountPercent = input.projectSettings.alternatives.alt3.discount_percent
    const totalPrice = baseTotal * (1 - discountPercent / 100)

    const downPaymentPercent = input.downPaymentPercent || 100
    const downPayment = totalPrice * (downPaymentPercent / 100)
    const deadline = new Date(input.projectSettings.alternatives.alt3.deadline)

    return {
      totalPrice,
      downPayment,
      monthlyPayment: 0,
      numberOfMonths: 0,
      finalBalloonPayment: 0,
      remainingAfterDown: totalPrice - downPayment,
      priceModifier: `-${discountPercent}%`,
      priceModifierValue: -(baseTotal - totalPrice),
      paymentSchedule: generateOneTimeSchedule(downPayment, totalPrice, deadline, input.customPaymentDate, input.customPaymentAmount, input.customPayments, start),
    }
  }

  /**
   * Alternative 4: Large Upfront with Discount
   */
  const calculateAlternative4 = (input: CalculationInput): CalculationResult => {
    const start = input.startDate || new Date()
    const baseTotal = input.basePrice * input.area
    const discountPercent = input.projectSettings.alternatives.alt4.discount_percent
    const totalPrice = baseTotal * (1 - discountPercent / 100)

    const downPaymentPercent = input.downPaymentPercent || 50
    const downPayment = totalPrice * (downPaymentPercent / 100)
    const remaining = totalPrice - downPayment
    const deadline = new Date(input.projectSettings.alternatives.alt4.deadline)

    return {
      totalPrice,
      downPayment,
      monthlyPayment: 0,
      numberOfMonths: 0,
      finalBalloonPayment: remaining,
      remainingAfterDown: remaining,
      priceModifier: `-${discountPercent}%`,
      priceModifierValue: -(baseTotal - totalPrice),
      paymentSchedule: generateNegotiatedSchedule(downPayment, remaining, deadline, input.customPaymentDate, input.customPaymentAmount, input.customPayments, start),
    }
  }

  /**
   * Alternative 5: No Down Payment, $800/month + surcharge
   */
  const calculateAlternative5 = (input: CalculationInput): CalculationResult => {
    const startDate = input.startDate || new Date()
    const baseTotal = input.basePrice * input.area
    const priceIncreasePerSqm = input.projectSettings.alternatives.alt5.price_increase_per_sqm
    const totalSurcharge = priceIncreasePerSqm * input.area
    const totalPrice = baseTotal + totalSurcharge

    const monthlyPayment = Math.max(800, input.monthlyPayment || 800)
    const deadline = new Date(input.projectSettings.alternatives.alt5.deadline)
    const monthsUntilDeadline = getMonthsDifference(startDate, deadline)

    const totalMonthlyPayments = monthlyPayment * monthsUntilDeadline
    const remainingForBank = Math.max(0, totalPrice - totalMonthlyPayments)

    return {
      totalPrice,
      downPayment: 0,
      monthlyPayment,
      numberOfMonths: monthsUntilDeadline,
      finalBalloonPayment: remainingForBank,
      remainingAfterDown: totalPrice,
      priceModifier: `+$${totalSurcharge.toFixed(0)} (+$${priceIncreasePerSqm}/m²)`,
      priceModifierValue: totalSurcharge,
      paymentSchedule: generateBalloonSchedule(0, monthlyPayment, monthsUntilDeadline, remainingForBank, deadline, startDate),
    }
  }

  /**
   * Alternative 6: No Down Payment, $1500/month + surcharge
   */
  const calculateAlternative6 = (input: CalculationInput): CalculationResult => {
    const startDate = input.startDate || new Date()
    const baseTotal = input.basePrice * input.area
    const priceIncreasePerSqm = input.projectSettings.alternatives.alt6.price_increase_per_sqm
    const totalSurcharge = priceIncreasePerSqm * input.area
    const totalPrice = baseTotal + totalSurcharge

    const monthlyPayment = Math.max(1500, input.monthlyPayment || 1500)
    const deadline = new Date(input.projectSettings.alternatives.alt6.deadline)
    const monthsUntilDeadline = getMonthsDifference(startDate, deadline)

    const totalMonthlyPayments = monthlyPayment * monthsUntilDeadline
    const remainingForBank = Math.max(0, totalPrice - totalMonthlyPayments)

    return {
      totalPrice,
      downPayment: 0,
      monthlyPayment,
      numberOfMonths: monthsUntilDeadline,
      finalBalloonPayment: remainingForBank,
      remainingAfterDown: totalPrice,
      priceModifier: `+$${totalSurcharge.toFixed(0)} (+$${priceIncreasePerSqm}/m²)`,
      priceModifierValue: totalSurcharge,
      paymentSchedule: generateBalloonSchedule(0, monthlyPayment, monthsUntilDeadline, remainingForBank, deadline, startDate),
    }
  }

  // ==================== MAIN DISPATCHER ====================
  const calculate = (input: CalculationInput): CalculationResult => {
    switch (input.alternative) {
      case 1: return calculateAlternative1(input)
      case 2: return calculateAlternative2(input)
      case 3: return calculateAlternative3(input)
      case 4: return calculateAlternative4(input)
      case 5: return calculateAlternative5(input)
      case 6: return calculateAlternative6(input)
      default: throw new Error(`Invalid alternative: ${input.alternative}`)
    }
  }

  // ==================== RETURN ====================
  return {
    calculate,
    calculateAlternative1,
    calculateAlternative2,
    calculateAlternative3,
    calculateAlternative4,
    calculateAlternative5,
    calculateAlternative6,
    getMonthsDifference,
  }
}
