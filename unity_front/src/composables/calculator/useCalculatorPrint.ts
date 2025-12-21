/**
 * Calculator Print Composable
 * Print functionality for payment and bank loan calculations
 */

import { format } from 'date-fns'
import type { CalculationResult, BankLoanResult } from '@/types/admin/calculator'
import { pdfTranslations, getDescriptionByLanguage, type PDFLanguage } from './pdfTranslations'

export const useCalculatorPrint = () => {
  // ==================== FORMATTERS ====================
  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const formatDate = (date: Date): string => {
    return format(date, 'MMM dd, yyyy')
  }

  // ==================== HTML GENERATORS ====================
  const generateSummaryRows = (result: CalculationResult | BankLoanResult, t: typeof pdfTranslations['en'], area: number, basePrice: number, isBank: boolean): string => {
    if (!isBank && 'totalPrice' in result) {
      const calc = result as CalculationResult
      return `
        <tr><td>${t.baseTotal}</td><td>${formatCurrency(basePrice * area)}</td></tr>
        <tr><td>${t.priceModifier}</td><td>${calc.priceModifier}</td></tr>
        <tr><td>${t.totalPrice}</td><td><strong>${formatCurrency(calc.totalPrice)}</strong></td></tr>
        <tr><td>${t.downPayment}</td><td>${formatCurrency(calc.downPayment)}</td></tr>
        ${calc.monthlyPayment > 0 ? `<tr><td>${t.monthlyPayment}</td><td>${formatCurrency(calc.monthlyPayment)}</td></tr>` : ''}
        ${calc.numberOfMonths > 0 ? `<tr><td>${t.numberOfMonths}</td><td>${calc.numberOfMonths}</td></tr>` : ''}
        ${calc.finalBalloonPayment > 0 ? `<tr><td>${t.finalPayment}</td><td>${formatCurrency(calc.finalBalloonPayment)}</td></tr>` : ''}
      `
    } else if (isBank && 'monthlyPayment' in result) {
      const bank = result as BankLoanResult
      return `<tr><td>${t.monthlyPayment}</td><td><strong>${formatCurrency(bank.monthlyPayment)}</strong></td></tr>`
    }
    return ''
  }

  const generateScheduleSection = (result: CalculationResult | BankLoanResult, t: typeof pdfTranslations['en'], lang: PDFLanguage, isBank: boolean): string => {
    if (!result.paymentSchedule || result.paymentSchedule.length === 0) return ''

    const scheduleRows = result.paymentSchedule.map(item => {
      if (!isBank && 'description' in item) {
        return `<tr><td>${item.month}</td><td>${formatDate(item.date)}</td><td>${formatCurrency(item.amount)}</td><td>${formatCurrency(item.remainingBalance)}</td><td>${getDescriptionByLanguage(item.description, lang)}</td></tr>`
      } else if ('payment' in item) {
        return `<tr><td>${item.month}</td><td>${formatDate(item.date)}</td><td>${formatCurrency(item.payment)}</td><td>${formatCurrency(item.remainingBalance)}</td></tr>`
      }
      return ''
    }).join('')

    const headers = !isBank 
      ? `<th>${t.month}</th><th>${t.date}</th><th>${t.payment}</th><th>${t.remainingBalance}</th><th>${t.description}</th>`
      : `<th>${t.month}</th><th>${t.date}</th><th>${t.payment}</th><th>${t.balance}</th>`

    return `
      <div class="page-break"></div>
      <h2>${!isBank ? t.paymentSchedule : t.amortizationSchedule}</h2>
      <table><thead><tr>${headers}</tr></thead><tbody>${scheduleRows}</tbody></table>
    `
  }

  const generatePrintStyles = (): string => `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; padding: 20px; color: #1e293b; font-size: 11pt; line-height: 1.6; }
    .print-header { background: linear-gradient(to right, #f59e0b, #eab308); color: white; padding: 30px; text-align: center; margin-bottom: 30px; border-radius: 10px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .print-header h1 { margin: 0; font-size: 32pt; font-weight: 400; letter-spacing: 1px; }
    .print-header p { margin-top: 10px; font-size: 14pt; opacity: 0.95; }
    .info-section { margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #f59e0b; }
    .info-row { display: flex; margin-bottom: 10px; }
    .info-label { font-weight: 600; color: #475569; min-width: 150px; }
    .info-value { color: #1e293b; }
    h2 { color: #f59e0b; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; margin: 30px 0 20px 0; font-size: 18pt; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f59e0b; color: white; padding: 12px; text-align: left; font-weight: 600; font-size: 10pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 10pt; }
    tr:nth-child(even) { background: #fef3c7; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @media print { body { padding: 0; } .page-break { page-break-before: always; } @page { margin: 1.5cm; } }
    @media screen { body { background: #f1f5f9; max-width: 900px; margin: 0 auto; } }
  `

  // ==================== MAIN PRINT FUNCTION ====================
  const printCalculation = (
    result: CalculationResult | BankLoanResult | null,
    projectName: string,
    alternativeName: string,
    area: number,
    basePrice: number,
    lang: PDFLanguage = 'en',
    isBank: boolean = false
  ) => {
    if (!result) {
      console.error('No calculation result to print')
      return
    }

    const t = pdfTranslations[lang]
    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      alert('Please allow popups to print the calculation')
      return
    }

    const summaryRows = generateSummaryRows(result, t, area, basePrice, isBank)
    const scheduleSection = generateScheduleSection(result, t, lang, isBank)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unity Development - ${!isBank ? t.paymentReport : t.bankLoanReport}</title>
        <style>${generatePrintStyles()}</style>
      </head>
      <body>
        <div class="print-header">
          <h1>Unity Development</h1>
          <p>${!isBank ? t.paymentReport : t.bankLoanReport}</p>
        </div>
        <div class="info-section">
          <div class="info-row"><span class="info-label">${t.project}</span><span class="info-value">${projectName}</span></div>
          <div class="info-row"><span class="info-label">${t.date}</span><span class="info-value">${new Date().toLocaleDateString()}</span></div>
          <div class="info-row"><span class="info-label">${!isBank ? t.paymentMethod : t.bank}</span><span class="info-value">${alternativeName}</span></div>
          <div class="info-row"><span class="info-label">${t.area}</span><span class="info-value">${area} m²</span></div>
          <div class="info-row"><span class="info-label">${t.basePrice}</span><span class="info-value">${formatCurrency(basePrice)}/m²</span></div>
        </div>
        <h2>${t.description}</h2>
        <table><thead><tr><th>${t.description}</th><th>${t.amount}</th></tr></thead><tbody>${summaryRows}</tbody></table>
        ${scheduleSection}
      </body>
      </html>
    `)

    printWindow.document.close()
    setTimeout(() => { printWindow.focus(); printWindow.print(); setTimeout(() => printWindow.close(), 100) }, 500)
  }

  // ==================== RETURN ====================
  return { printCalculation }
}
