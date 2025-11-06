import { format } from 'date-fns'
import type { CalculationResult, BankLoanResult } from '@/types/admin/calculator'

type Language = 'ka' | 'en' | 'ru'

const translations = {
  ka: {
    paymentReport: 'გადახდის გრაფიკის ანგარიში',
    bankLoanReport: 'საბანკო სესხის გაანგარიშების ანგარიში',
    project: 'პროექტი:',
    date: 'თარიღი:',
    paymentMethod: 'გადახდის მეთოდი:',
    area: 'ფართობი:',
    basePrice: 'საბაზო ფასი:',
    bank: 'ბანკი:',
    loanTerm: 'სესხის ვადა:',
    years: 'წელი',
    months: 'თვე',
    description: 'აღწერა',
    amount: 'თანხა',
    baseTotal: 'საბაზო ჯამი',
    priceModifier: 'ფასის მოდიფიკატორი',
    totalPrice: 'სულ ფასი',
    downPayment: 'შენატანი',
    monthlyPayment: 'ყოველთვიური გადახდა',
    numberOfMonths: 'თვეების რაოდენობა',
    finalPayment: 'საბოლოო გადახდა',
    paymentSchedule: 'გადახდის გრაფიკი',
    month: 'თვე',
    payment: 'გადახდა',
    remainingBalance: 'დარჩენილი ბალანსი',
    loanAmount: 'სესხის ოდენობა',
    interestRate: 'პროცენტული განაკვეთი',
    totalInterest: 'სულ პროცენტი',
    totalPayment: 'სულ გადახდა',
    amortizationSchedule: 'ამორტიზაციის გრაფიკი',
    principal: 'ძირი',
    interest: 'პროცენტი',
    balance: 'ბალანსი',
  },
  en: {
    paymentReport: 'Payment Calculation Report',
    bankLoanReport: 'Bank Loan Calculation Report',
    project: 'Project:',
    date: 'Date:',
    paymentMethod: 'Payment Method:',
    area: 'Area:',
    basePrice: 'Base Price:',
    bank: 'Bank:',
    loanTerm: 'Loan Term:',
    years: 'years',
    months: 'months',
    description: 'Description',
    amount: 'Amount',
    baseTotal: 'Base Total',
    priceModifier: 'Price Modifier',
    totalPrice: 'Total Price',
    downPayment: 'Down Payment',
    monthlyPayment: 'Monthly Payment',
    numberOfMonths: 'Number of Months',
    finalPayment: 'Final Payment',
    paymentSchedule: 'Payment Schedule',
    month: 'Month',
    payment: 'Payment',
    remainingBalance: 'Remaining Balance',
    loanAmount: 'Loan Amount',
    interestRate: 'Interest Rate',
    totalInterest: 'Total Interest',
    totalPayment: 'Total Payment',
    amortizationSchedule: 'Amortization Schedule',
    principal: 'Principal',
    interest: 'Interest',
    balance: 'Balance',
  },
  ru: {
    paymentReport: 'Отчет о расчете оплаты',
    bankLoanReport: 'Отчет о расчете банковского кредита',
    project: 'Проект:',
    date: 'Дата:',
    paymentMethod: 'Способ оплаты:',
    area: 'Площадь:',
    basePrice: 'Базовая цена:',
    bank: 'Банк:',
    loanTerm: 'Срок кредита:',
    years: 'лет',
    months: 'месяцев',
    description: 'Описание',
    amount: 'Сумма',
    baseTotal: 'Базовая сумма',
    priceModifier: 'Модификатор цены',
    totalPrice: 'Общая цена',
    downPayment: 'Первоначальный взнос',
    monthlyPayment: 'Ежемесячный платеж',
    numberOfMonths: 'Количество месяцев',
    finalPayment: 'Финальный платеж',
    paymentSchedule: 'График платежей',
    month: 'Месяц',
    payment: 'Платеж',
    remainingBalance: 'Остаток',
    loanAmount: 'Сумма кредита',
    interestRate: 'Процентная ставка',
    totalInterest: 'Общий процент',
    totalPayment: 'Общий платеж',
    amortizationSchedule: 'График амортизации',
    principal: 'Основной долг',
    interest: 'Процент',
    balance: 'Баланс',
  },
}

const getDescriptionByLanguage = (description: string, lang: Language): string => {
  const parts = description.split(' / ')
  if (lang === 'ka') return parts[1] || parts[0]
  if (lang === 'en') return parts[0] || parts[1]
  return parts[1] || parts[0]
}

export const useCalculatorPrint = () => {
  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  const formatDate = (date: Date): string => {
    return format(date, 'MMM dd, yyyy')
  }

  const printCalculation = (
    result: CalculationResult | BankLoanResult | null,
    projectName: string,
    alternativeName: string,
    area: number,
    basePrice: number,
    lang: Language = 'en',
    isBank: boolean = false
  ) => {
    if (!result) {
      console.error('No calculation result to print')
      return
    }

    const t = translations[lang]
    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      alert('Please allow popups to print the calculation')
      return
    }

    // Build summary rows based on calculation type
    let summaryRows = ''
    
    if (!isBank && 'totalPrice' in result) {
      const calcResult = result as CalculationResult
      summaryRows = `
        <tr>
          <td>${t.baseTotal}</td>
          <td>${formatCurrency(basePrice * area)}</td>
        </tr>
        <tr>
          <td>${t.priceModifier}</td>
          <td>${calcResult.priceModifier}</td>
        </tr>
        <tr>
          <td>${t.totalPrice}</td>
          <td><strong>${formatCurrency(calcResult.totalPrice)}</strong></td>
        </tr>
        <tr>
          <td>${t.downPayment}</td>
          <td>${formatCurrency(calcResult.downPayment)}</td>
        </tr>
        ${calcResult.monthlyPayment > 0 ? `
        <tr>
          <td>${t.monthlyPayment}</td>
          <td>${formatCurrency(calcResult.monthlyPayment)}</td>
        </tr>
        ` : ''}
        ${calcResult.numberOfMonths > 0 ? `
        <tr>
          <td>${t.numberOfMonths}</td>
          <td>${calcResult.numberOfMonths}</td>
        </tr>
        ` : ''}
        ${calcResult.finalBalloonPayment > 0 ? `
        <tr>
          <td>${t.finalPayment}</td>
          <td>${formatCurrency(calcResult.finalBalloonPayment)}</td>
        </tr>
        ` : ''}
      `
    } else if (isBank && 'monthlyPayment' in result) {
      const bankResult = result as BankLoanResult
      summaryRows = `
        <tr>
          <td>${t.monthlyPayment}</td>
          <td><strong>${formatCurrency(bankResult.monthlyPayment)}</strong></td>
        </tr>
      `
    }

    // Build payment schedule
    let scheduleSection = ''
    if (result.paymentSchedule && result.paymentSchedule.length > 0) {
      const scheduleRows = result.paymentSchedule.map(item => {
        if (!isBank && 'description' in item) {
          return `
            <tr>
              <td>${item.month}</td>
              <td>${formatDate(item.date)}</td>
              <td>${formatCurrency(item.amount)}</td>
              <td>${formatCurrency(item.remainingBalance)}</td>
              <td>${getDescriptionByLanguage(item.description, lang)}</td>
            </tr>
          `
        } else if ('payment' in item) {
          return `
            <tr>
              <td>${item.month}</td>
              <td>${formatDate(item.date)}</td>
              <td>${formatCurrency(item.payment)}</td>
              <td>${formatCurrency(item.remainingBalance)}</td>
            </tr>
          `
        }
        return ''
      }).join('')

      const scheduleHeaders = !isBank 
        ? `<th>${t.month}</th><th>${t.date}</th><th>${t.payment}</th><th>${t.remainingBalance}</th><th>${t.description}</th>`
        : `<th>${t.month}</th><th>${t.date}</th><th>${t.payment}</th><th>${t.balance}</th>`

      scheduleSection = `
        <div class="page-break"></div>
        <h2>${!isBank ? t.paymentSchedule : t.amortizationSchedule}</h2>
        <table>
          <thead>
            <tr>${scheduleHeaders}</tr>
          </thead>
          <tbody>
            ${scheduleRows}
          </tbody>
        </table>
      `
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="${lang}">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Unity Development - ${!isBank ? t.paymentReport : t.bankLoanReport}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            padding: 20px;
            color: #1e293b;
            font-size: 11pt;
            line-height: 1.6;
          }

          .print-header {
            background: linear-gradient(to right, #f59e0b, #eab308);
            color: white;
            padding: 30px;
            text-align: center;
            margin-bottom: 30px;
            border-radius: 10px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-header h1 {
            margin: 0;
            font-size: 32pt;
            font-weight: 400;
            letter-spacing: 1px;
          }

          .print-header p {
            margin-top: 10px;
            font-size: 14pt;
            opacity: 0.95;
          }

          .info-section {
            margin: 30px 0;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
          }

          .info-row {
            display: flex;
            margin-bottom: 10px;
          }

          .info-label {
            font-weight: 600;
            color: #475569;
            min-width: 150px;
          }

          .info-value {
            color: #1e293b;
          }

          h2 {
            color: #f59e0b;
            border-bottom: 2px solid #f59e0b;
            padding-bottom: 10px;
            margin: 30px 0 20px 0;
            font-size: 18pt;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }

          th {
            background: #f59e0b;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 10pt;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 10pt;
          }

          tr:nth-child(even) {
            background: #fef3c7;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          @media print {
            body {
              padding: 0;
            }

            .page-break {
              page-break-before: always;
            }

            @page {
              margin: 1.5cm;
            }
          }

          @media screen {
            body {
              background: #f1f5f9;
              max-width: 900px;
              margin: 0 auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>Unity Development</h1>
          <p>${!isBank ? t.paymentReport : t.bankLoanReport}</p>
        </div>

        <div class="info-section">
          <div class="info-row">
            <span class="info-label">${t.project}</span>
            <span class="info-value">${projectName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">${t.date}</span>
            <span class="info-value">${new Date().toLocaleDateString()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">${!isBank ? t.paymentMethod : t.bank}</span>
            <span class="info-value">${alternativeName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">${t.area}</span>
            <span class="info-value">${area} m²</span>
          </div>
          <div class="info-row">
            <span class="info-label">${t.basePrice}</span>
            <span class="info-value">${formatCurrency(basePrice)}/m²</span>
          </div>
        </div>

        <h2>${t.description}</h2>
        <table>
          <thead>
            <tr>
              <th>${t.description}</th>
              <th>${t.amount}</th>
            </tr>
          </thead>
          <tbody>
            ${summaryRows}
          </tbody>
        </table>

        ${scheduleSection}
      </body>
      </html>
    `)

    printWindow.document.close()

    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      setTimeout(() => printWindow.close(), 100)
    }, 500)
  }

  return {
    printCalculation,
  }
}
