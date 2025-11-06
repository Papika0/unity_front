import { addMonths, differenceInMonths } from 'date-fns'
import type {
  CalculationInput,
  CalculationResult,
  PaymentScheduleItem,
} from '@/types/admin/calculator'

export const usePaymentCalculator = () => {
  /**
   * Calculate months difference between two dates
   */
  const getMonthsDifference = (startDate: Date, endDate: Date): number => {
    const months = differenceInMonths(endDate, startDate)
    return Math.max(1, months)
  }

  /**
   * Generate standard monthly payment schedule
   */
  const generateStandardSchedule = (
    downPayment: number,
    monthlyPayment: number,
    numberOfMonths: number,
    startDate: Date,
  ): PaymentScheduleItem[] => {
    const schedule: PaymentScheduleItem[] = []
    let remaining = downPayment > 0 ? monthlyPayment * numberOfMonths : 0

    // Initial down payment
    if (downPayment > 0) {
      schedule.push({
        month: 0,
        date: startDate,
        amount: downPayment,
        remainingBalance: remaining,
        description: 'Down Payment / შენატანი',
      })
    }

    // Monthly payments
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
  const generateBalloonSchedule = (
    downPayment: number,
    monthlyPayment: number,
    monthsUntilCompletion: number,
    balloonPayment: number,
    completionDate: Date,
  ): PaymentScheduleItem[] => {
    const schedule: PaymentScheduleItem[] = []
    const startDate = new Date()
    let remaining = monthlyPayment * monthsUntilCompletion + balloonPayment

    // Initial down payment (only if > 0)
    if (downPayment > 0) {
      schedule.push({
        month: 0,
        date: startDate,
        amount: downPayment,
        remainingBalance: remaining,
        description: 'Down Payment / შენატანი',
      })
    }

    // Monthly payments until construction complete
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

    // Balloon payment at construction completion
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
  const generateOneTimeSchedule = (
    downPayment: number,
    totalPrice: number,
    completionDate: Date,
    customDate?: string,
    customAmount?: number,
  ): PaymentScheduleItem[] => {
    const schedule: PaymentScheduleItem[] = []
    const remaining = totalPrice - downPayment

    // Down payment
    schedule.push({
      month: 0,
      date: new Date(),
      amount: downPayment,
      remainingBalance: customAmount !== undefined ? customAmount : remaining,
      description: 'Down Payment / შენატანი',
    })

    // Remaining payment if not 100% upfront
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

    return schedule
  }

  /**
   * Generate negotiated payment schedule (for Alternative 4)
   */
  const generateNegotiatedSchedule = (
    downPayment: number,
    remainingPayment: number,
    completionDate: Date,
    customDate?: string,
    customAmount?: number,
  ): PaymentScheduleItem[] => {
    const schedule: PaymentScheduleItem[] = []

    // Down payment
    schedule.push({
      month: 0,
      date: new Date(),
      amount: downPayment,
      remainingBalance: customAmount !== undefined ? customAmount : remainingPayment,
      description: 'Down Payment / შენატანი',
    })

    // Negotiated remaining payment
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

    return schedule
  }

  /**
   * Generate simple monthly schedule (for Alt 5 & 6)
   */
  const generateMonthlySchedule = (
    monthlyPayment: number,
    numberOfMonths: number,
    startDate: Date,
  ): PaymentScheduleItem[] => {
    const schedule: PaymentScheduleItem[] = []
    let remaining = monthlyPayment * numberOfMonths

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
   * Alternative 1: Standard Price
   * Base price with proportional installments until deadline
   */
  const calculateAlternative1 = (input: CalculationInput): CalculationResult => {
    const baseTotal = input.basePrice * input.area
    const downPaymentPercent = input.downPaymentPercent || 20
    const downPayment = baseTotal * (downPaymentPercent / 100)
    const remaining = baseTotal - downPayment

    // Calculate months until deadline from project settings
    const deadline = new Date(input.projectSettings.alternatives.alt1.deadline)
    const monthsUntilDeadline = getMonthsDifference(new Date(), deadline)

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
      paymentSchedule: generateStandardSchedule(downPayment, monthlyPayment, monthsUntilDeadline, new Date()),
    }
  }

  /**
   * Alternative 2: Internal Installment with 12% Surcharge + Balloon Payment
   * 20-30% down, $800/month, balloon payment at construction completion
   */
  const calculateAlternative2 = (input: CalculationInput): CalculationResult => {
    const baseTotal = input.basePrice * input.area
    const surchargePercent = input.projectSettings.alternatives.alt2.surcharge_percent
    const totalPrice = baseTotal * (1 + surchargePercent / 100)

    const downPaymentPercent = input.downPaymentPercent || 20
    const downPayment = totalPrice * (downPaymentPercent / 100)
    const remaining = totalPrice - downPayment

    // Monthly payments until deadline
    const monthlyPayment = input.monthlyPayment || 800
    const deadline = new Date(input.projectSettings.alternatives.alt2.deadline)
    const monthsUntilDeadline = getMonthsDifference(new Date(), deadline)

    // Calculate balloon payment
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
      paymentSchedule: generateBalloonSchedule(
        downPayment,
        monthlyPayment,
        monthsUntilDeadline,
        balloonPayment,
        deadline,
      ),
    }
  }

  /**
   * Alternative 3: Full Upfront (80-100%) with 10% Discount
   */
  const calculateAlternative3 = (input: CalculationInput): CalculationResult => {
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
      paymentSchedule: generateOneTimeSchedule(
        downPayment,
        totalPrice,
        deadline,
        input.customPaymentDate,
        input.customPaymentAmount,
      ),
    }
  }

  /**
   * Alternative 4: Large Upfront (50-80%) with 5% Discount
   * Remaining is one-time negotiated payment
   */
  const calculateAlternative4 = (input: CalculationInput): CalculationResult => {
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
      paymentSchedule: generateNegotiatedSchedule(
        downPayment,
        remaining,
        deadline,
        input.customPaymentDate,
        input.customPaymentAmount,
      ),
    }
  }

  /**
   * Alternative 5: No Down Payment, $800/month minimum, +$250/sqm surcharge
   * Payments until construction completion, then remaining goes to bank
   */
  const calculateAlternative5 = (input: CalculationInput): CalculationResult => {
    const baseTotal = input.basePrice * input.area
    const priceIncreasePerSqm = input.projectSettings.alternatives.alt5.price_increase_per_sqm
    const totalSurcharge = priceIncreasePerSqm * input.area
    const totalPrice = baseTotal + totalSurcharge

    const monthlyPayment = Math.max(800, input.monthlyPayment || 800)

    // Calculate months until construction deadline
    const deadline = new Date(input.projectSettings.alternatives.alt5.deadline)
    const monthsUntilDeadline = getMonthsDifference(new Date(), deadline)

    // Calculate total monthly payments and remaining balance for bank
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
      paymentSchedule: generateBalloonSchedule(0, monthlyPayment, monthsUntilDeadline, remainingForBank, deadline),
    }
  }

  /**
   * Alternative 6: No Down Payment, $1500/month minimum, +$180/sqm surcharge
   * Payments until construction completion, then remaining goes to bank
   */
  const calculateAlternative6 = (input: CalculationInput): CalculationResult => {
    const baseTotal = input.basePrice * input.area
    const priceIncreasePerSqm = input.projectSettings.alternatives.alt6.price_increase_per_sqm
    const totalSurcharge = priceIncreasePerSqm * input.area
    const totalPrice = baseTotal + totalSurcharge

    const monthlyPayment = Math.max(1500, input.monthlyPayment || 1500)

    // Calculate months until construction deadline
    const deadline = new Date(input.projectSettings.alternatives.alt6.deadline)
    const monthsUntilDeadline = getMonthsDifference(new Date(), deadline)

    // Calculate total monthly payments and remaining balance for bank
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
      paymentSchedule: generateBalloonSchedule(0, monthlyPayment, monthsUntilDeadline, remainingForBank, deadline),
    }
  }

  /**
   * Main calculation dispatcher
   */
  const calculate = (input: CalculationInput): CalculationResult => {
    switch (input.alternative) {
      case 1:
        return calculateAlternative1(input)
      case 2:
        return calculateAlternative2(input)
      case 3:
        return calculateAlternative3(input)
      case 4:
        return calculateAlternative4(input)
      case 5:
        return calculateAlternative5(input)
      case 6:
        return calculateAlternative6(input)
      default:
        throw new Error(`Invalid alternative: ${input.alternative}`)
    }
  }

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
