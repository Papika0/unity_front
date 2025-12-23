import { addMonths } from 'date-fns'
import type { BankLoanInput, BankLoanResult, BankPaymentItem } from '@/types/admin/calculator'

export const useBankCalculator = () => {
  /**
   * Calculate monthly payment using amortization formula
   */
  const calculateMonthlyPayment = (
    principal: number,
    annualRate: number,
    numberOfPayments: number,
  ): number => {
    const monthlyRate = annualRate / 100 / 12

    if (monthlyRate === 0) {
      // If interest rate is 0, simple division
      return principal / numberOfPayments
    }

    // Monthly Payment Formula: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyPayment =
      principal *
      ((monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1))

    return monthlyPayment
  }

  /**
   * Generate amortization schedule
   */
  const generateAmortizationSchedule = (
    loanAmount: number,
    annualRate: number,
    numberOfPayments: number,
    monthlyPayment: number,
  ): BankPaymentItem[] => {
    const schedule: BankPaymentItem[] = []
    const monthlyRate = annualRate / 100 / 12
    let remainingBalance = loanAmount
    const startDate = new Date()

    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = remainingBalance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      remainingBalance -= principalPayment

      const paymentDate = addMonths(startDate, month)

      schedule.push({
        month,
        date: paymentDate,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        remainingBalance: Math.max(0, remainingBalance),
      })
    }

    return schedule
  }

  /**
   * Calculate bank loan details with amortization
   */
  const calculate = (input: BankLoanInput): BankLoanResult => {
    const baseTotal = input.basePrice * input.area
    const downPayment = baseTotal * (input.downPaymentPercent / 100)
    const loanAmount = baseTotal - downPayment

    const annualRate = input.selectedBank.interest_rate
    const numberOfPayments = input.loanTermYears * 12

    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyPayment(loanAmount, annualRate, numberOfPayments)

    // Generate amortization schedule
    const paymentSchedule = generateAmortizationSchedule(
      loanAmount,
      annualRate,
      numberOfPayments,
      monthlyPayment,
    )

    // Calculate totals
    const totalPayment = monthlyPayment * numberOfPayments
    const totalInterest = totalPayment - loanAmount

    return {
      baseTotal,
      downPayment,
      loanAmount,
      monthlyPayment,
      totalInterest,
      totalPayment: downPayment + totalPayment, // Total includes down payment
      effectiveAPR: annualRate,
      paymentSchedule,
    }
  }

  return {
    calculate,
    calculateMonthlyPayment,
    generateAmortizationSchedule,
  }
}
