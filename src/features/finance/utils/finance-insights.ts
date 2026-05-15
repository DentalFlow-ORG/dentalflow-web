import type { FinanceSummary } from '../types/finance.types'
import { formatCurrency } from './finance-format'

export type InsightTone = 'positive' | 'warning' | 'danger' | 'neutral'

export type FinancialInsight = {
  id: string
  title: string
  description: string
  tone: InsightTone
}

export function generateInsights(
  summary: FinanceSummary,
  previousSummary?: FinanceSummary | null,
): FinancialInsight[] {
  const { kpis, expensesByCategory, incomeByService } = summary
  const { totalIncome, totalExpenses, netProfit, fixedExpensesTotal } = kpis

  if (totalIncome === 0 && totalExpenses === 0) {
    return [
      {
        id: 'no-data',
        title: 'Dados insuficientes',
        description:
          'Registre receitas e despesas para visualizar alertas e oportunidades financeiras.',
        tone: 'neutral',
      },
    ]
  }

  const insights: FinancialInsight[] = []

  // 1. Net result (always first)
  if (netProfit > 0) {
    insights.push({
      id: 'surplus',
      title: 'Superávit no período',
      description: `A clínica fechou o período com resultado positivo de ${formatCurrency(netProfit)}.`,
      tone: 'positive',
    })
  } else if (netProfit < 0) {
    insights.push({
      id: 'deficit',
      title: 'Déficit no período',
      description: `As despesas superaram as receitas em ${formatCurrency(Math.abs(netProfit))}. Revise os maiores gastos do período.`,
      tone: 'danger',
    })
  } else {
    insights.push({
      id: 'break-even',
      title: 'Resultado equilibrado',
      description: 'Receitas e despesas ficaram equilibradas no período.',
      tone: 'neutral',
    })
  }

  // 2. Result trend vs previous period
  if (previousSummary) {
    const prevNetProfit = previousSummary.kpis.netProfit
    const delta = netProfit - prevNetProfit
    if (Math.abs(delta) >= 0.01) {
      insights.push({
        id: 'result-trend',
        title: delta > 0 ? 'Resultado melhorou' : 'Resultado piorou',
        description:
          delta > 0
            ? `O resultado melhorou ${formatCurrency(delta)} em comparação ao período anterior.`
            : `O resultado piorou ${formatCurrency(Math.abs(delta))} em relação ao período anterior.`,
        tone: delta > 0 ? 'positive' : 'warning',
      })
    }
  }

  // 3. Expense pressure (only meaningful when there is income to compare)
  if (totalIncome > 0 && totalExpenses > 0) {
    const ratio = (totalExpenses / totalIncome) * 100
    if (ratio >= 70) {
      insights.push({
        id: 'expense-pressure',
        title: 'Despesas pressionando o resultado',
        description: `As despesas representam ${ratio.toFixed(0)}% das receitas no período.${ratio >= 90 ? ' Atenção ao equilíbrio financeiro.' : ''}`,
        tone: ratio >= 90 ? 'danger' : 'warning',
      })
    }
  }

  // 4. Revenue trend vs previous period
  if (previousSummary) {
    const prevIncome = previousSummary.kpis.totalIncome
    if (prevIncome > 0 && totalIncome > 0) {
      const pctChange = ((totalIncome - prevIncome) / prevIncome) * 100
      if (Math.abs(pctChange) >= 5) {
        insights.push({
          id: 'income-trend',
          title: pctChange > 0 ? 'Receita em crescimento' : 'Receita em queda',
          description:
            pctChange > 0
              ? `A receita aumentou ${pctChange.toFixed(0)}% em relação ao período anterior.`
              : `A receita caiu ${Math.abs(pctChange).toFixed(0)}% em relação ao período anterior.`,
          tone: pctChange > 0 ? 'positive' : 'warning',
        })
      }
    } else if (totalIncome > 0 && prevIncome === 0) {
      insights.push({
        id: 'income-trend',
        title: 'Primeiro período com receita',
        description: 'Não havia receita registrada no período anterior para comparação.',
        tone: 'positive',
      })
    }
  }

  // 5. Expenses outpaced revenue — only when both periods have sufficient data
  if (
    previousSummary &&
    previousSummary.kpis.totalExpenses > 0 &&
    previousSummary.kpis.totalIncome > 0 &&
    totalIncome > 0 &&
    totalExpenses > 0
  ) {
    const expGrowth =
      ((totalExpenses - previousSummary.kpis.totalExpenses) / previousSummary.kpis.totalExpenses) * 100
    const incGrowth =
      ((totalIncome - previousSummary.kpis.totalIncome) / previousSummary.kpis.totalIncome) * 100
    if (expGrowth > incGrowth + 5 && expGrowth > 5) {
      insights.push({
        id: 'expense-outpaced',
        title: 'Atenção ao crescimento das despesas',
        description:
          'As despesas cresceram mais rápido que as receitas em relação ao período anterior.',
        tone: 'warning',
      })
    }
  }

  // 6. Top expense category
  const topExpense = expensesByCategory.find((item) => item.amount > 0)
  if (topExpense) {
    insights.push({
      id: 'top-expense',
      title: 'Maior concentração de gastos',
      description: `A categoria "${topExpense.categoryName}" concentra ${formatCurrency(topExpense.amount)} em despesas no período.`,
      tone: 'neutral',
    })
  }

  // 7. Top revenue service
  const topService = incomeByService.find((item) => item.amount > 0)
  if (topService) {
    insights.push({
      id: 'top-service',
      title: 'Principal fonte de receita',
      description: `O serviço "${topService.serviceName}" gerou ${formatCurrency(topService.amount)} no período.`,
      tone: 'positive',
    })
  }

  // 8. Fixed expense weight
  if (fixedExpensesTotal > 0) {
    const fixedRatio = totalIncome > 0 ? (fixedExpensesTotal / totalIncome) * 100 : null
    const heavyWeight = fixedRatio !== null && fixedRatio >= 50
    const ratioText = heavyWeight ? `, representando ${fixedRatio!.toFixed(0)}% da receita` : ''
    insights.push({
      id: 'fixed-expenses',
      title: 'Peso das despesas fixas',
      description: `As despesas fixas somam ${formatCurrency(fixedExpensesTotal)} no período${ratioText}.`,
      tone: heavyWeight ? 'warning' : 'neutral',
    })
  }

  return insights.slice(0, 6)
}
