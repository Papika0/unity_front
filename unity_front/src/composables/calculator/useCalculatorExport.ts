/**
 * Calculator Export Composable
 * PDF export functionality for payment and bank loan calculations
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import type { CalculationResult, BankLoanResult } from '@/types/admin/calculator'
import { pdfTranslations, getDescriptionByLanguage, type PDFLanguage } from './pdfTranslations'

export const useCalculatorExport = () => {
  // ==================== FORMATTERS ====================
  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const formatDate = (date: Date): string => {
    return format(date, 'MMM dd, yyyy')
  }

  // ==================== PDF HEADER ====================
  const createPDFHeader = (doc: jsPDF, title: string) => {
    doc.setFillColor(245, 158, 11)
    doc.rect(0, 0, 210, 45, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(28)
    doc.text('Unity Development', 105, 20, { align: 'center' })
    doc.setFontSize(16)
    doc.text(title, 105, 32, { align: 'center' })
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
  }

  // ==================== PDF FOOTER ====================
  const addPDFFooter = (doc: jsPDF, t: typeof pdfTranslations['en']) => {
    const pageCount = doc.internal.pages.length - 1
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setTextColor(128, 128, 128)
      doc.text(`${t.page} ${i} ${t.of} ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' })
      doc.text(t.generatedBy, 105, doc.internal.pageSize.height - 5, { align: 'center' })
    }
  }

  // ==================== EXPORT PAYMENT CALCULATION ====================
  const exportCalculationToPDF = (
    result: CalculationResult,
    projectName: string,
    alternativeName: string,
    area: number,
    basePrice: number,
    lang: PDFLanguage = 'en',
  ) => {
    const t = pdfTranslations[lang]
    const doc = new jsPDF()
    createPDFHeader(doc, t.paymentReport)

    // Project Info
    const infoY = 55
    const infoItems = [
      [t.project, projectName],
      [t.date, new Date().toLocaleDateString('en-US')],
      [t.paymentMethod, alternativeName],
      [t.area, `${area} m²`],
      [t.basePrice, formatCurrency(basePrice) + '/m²'],
    ]

    infoItems.forEach(([label, value], i) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label, 20, infoY + (i * 7))
      doc.setFont('helvetica', 'normal')
      doc.text(value, 60, infoY + (i * 7))
    })

    // Summary Table
    autoTable(doc, {
      startY: infoY + 40,
      head: [[t.description, t.amount]],
      body: [
        [t.baseTotal, formatCurrency(basePrice * area)],
        [t.priceModifier, result.priceModifier],
        [t.totalPrice, formatCurrency(result.totalPrice)],
        [t.downPayment, formatCurrency(result.downPayment)],
        [t.monthlyPayment, result.monthlyPayment > 0 ? formatCurrency(result.monthlyPayment) : 'N/A'],
        [t.numberOfMonths, result.numberOfMonths > 0 ? result.numberOfMonths.toString() : 'N/A'],
        [t.finalPayment, result.finalBalloonPayment > 0 ? formatCurrency(result.finalBalloonPayment) : 'N/A'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], fontSize: 12, fontStyle: 'bold' },
      bodyStyles: { fontSize: 11 },
      alternateRowStyles: { fillColor: [254, 243, 199] },
      margin: { left: 20, right: 20 },
    })

    // Payment Schedule
    if (result.paymentSchedule && result.paymentSchedule.length > 0) {
      doc.addPage()
      doc.setFontSize(18)
      doc.setTextColor(245, 158, 11)
      doc.text(t.paymentSchedule, 20, 20)

      autoTable(doc, {
        startY: 30,
        head: [[t.month, t.date, t.payment, t.remainingBalance, t.description]],
        body: result.paymentSchedule.map((item) => [
          item.month.toString(),
          formatDate(item.date),
          formatCurrency(item.amount),
          formatCurrency(item.remainingBalance),
          getDescriptionByLanguage(item.description, lang),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11], fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [254, 243, 199] },
      })
    }

    addPDFFooter(doc, t)
    const timestamp = format(new Date(), 'yyyy-MM-dd')
    doc.save(`Unity_Development_Payment_${projectName.replace(/\s+/g, '_')}_${timestamp}.pdf`)
  }

  // ==================== EXPORT BANK LOAN ====================
  const exportBankLoanToPDF = (
    result: BankLoanResult,
    projectName: string,
    bankName: string,
    area: number,
    basePrice: number,
    loanTermYears: number,
    lang: PDFLanguage = 'en',
  ) => {
    const t = pdfTranslations[lang]
    const doc = new jsPDF()
    createPDFHeader(doc, t.bankLoanReport)

    // Project Info
    const infoY = 55
    const infoItems = [
      [t.project, projectName],
      [t.date, new Date().toLocaleDateString('en-US')],
      [t.bank, bankName],
      [t.area, `${area} m²`],
      [t.basePrice, formatCurrency(basePrice) + '/m²'],
      [t.loanTerm, `${loanTermYears} ${t.years}`],
    ]

    infoItems.forEach(([label, value], i) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label, 20, infoY + (i * 7))
      doc.setFont('helvetica', 'normal')
      doc.text(value, 60, infoY + (i * 7))
    })

    // Summary Table
    autoTable(doc, {
      startY: infoY + 50,
      head: [[t.description, t.amount]],
      body: [
        [t.loanTerm, `${loanTermYears * 12} ${t.months}`],
        [t.monthlyPayment, formatCurrency(result.monthlyPayment)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], fontSize: 12, fontStyle: 'bold' },
      bodyStyles: { fontSize: 11 },
      alternateRowStyles: { fillColor: [254, 243, 199] },
      margin: { left: 20, right: 20 },
    })

    // Amortization Schedule
    if (result.paymentSchedule && result.paymentSchedule.length > 0) {
      doc.addPage()
      doc.setFontSize(18)
      doc.setTextColor(245, 158, 11)
      doc.text(t.amortizationSchedule, 20, 20)

      autoTable(doc, {
        startY: 30,
        head: [[t.month, t.date, t.payment, t.balance]],
        body: result.paymentSchedule.map((item) => [
          item.month.toString(),
          formatDate(item.date),
          formatCurrency(item.payment),
          formatCurrency(item.remainingBalance),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11], fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [254, 243, 199] },
      })
    }

    addPDFFooter(doc, t)
    const timestamp = format(new Date(), 'yyyy-MM-dd')
    doc.save(`Unity_Development_Bank_Loan_${bankName.replace(/\s+/g, '_')}_${timestamp}.pdf`)
  }

  // ==================== RETURN ====================
  return {
    exportCalculationToPDF,
    exportBankLoanToPDF,
    formatCurrency,
    formatDate,
  }
}
