import type { Expense, ExpenseSplit, SplitType } from 'Features/Schema/types'

export interface DraftSplitLine {
  uid: string
  amount?: number
  percentage?: number
  shares?: number
}

/**
 * Resolves a draft split (as edited in the AddExpense form) into the absolute
 * `amount` per member that the backend expects — per CONTRACT.md, `splits[].amount`
 * is "always resolved to absolute value regardless of splitType".
 */
export function resolveSplits(
  splitType: SplitType,
  lines: DraftSplitLine[],
  totalAmount: number,
): ExpenseSplit[] {
  if (lines.length === 0) return []

  switch (splitType) {
    case 'equal': {
      const count = lines.length
      const base = Math.floor((totalAmount / count) * 100) / 100
      const remainder = Math.round((totalAmount - base * count) * 100) / 100
      return lines.map((l, i) => ({
        uid: l.uid,
        // distribute the rounding remainder (cents) to the first member(s)
        amount: Math.round((base + (i < Math.round(remainder * 100) ? 0.01 : 0)) * 100) / 100,
      }))
    }
    case 'exact':
      return lines.map((l) => ({ uid: l.uid, amount: Math.round((l.amount ?? 0) * 100) / 100 }))
    case 'percentage':
      return lines.map((l) => ({
        uid: l.uid,
        percentage: l.percentage ?? 0,
        amount: Math.round(((totalAmount * (l.percentage ?? 0)) / 100) * 100) / 100,
      }))
    case 'shares': {
      const totalShares = lines.reduce((acc, l) => acc + (l.shares ?? 0), 0)
      return lines.map((l) => ({
        uid: l.uid,
        shares: l.shares ?? 0,
        amount: totalShares > 0 ? Math.round(((totalAmount * (l.shares ?? 0)) / totalShares) * 100) / 100 : 0,
      }))
    }
    default:
      return []
  }
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

export interface YourShareInfo {
  /** 'positive' = you're owed money on this expense, 'negative' = you owe
   *  money, 'neutral' = you paid and nobody owes you (e.g. a solo expense),
   *  'none' = your uid isn't in this expense's splits at all. */
  tone: 'positive' | 'negative' | 'neutral' | 'none'
  /** e.g. "You paid ₹1200" or "You owe ₹300" or "Not involved" */
  primary: string
  /** e.g. "you're owed ₹900" — only set alongside a 'positive' primary line */
  secondary?: string
}

/**
 * Computes what the *current viewer* specifically paid/owes on one expense,
 * purely from fields the list/detail endpoints already return — no extra
 * API call. Shared by ExpenseListItem (list row) and ExpenseDetail (restated
 * on the read-only screen) so the framing stays identical in both places.
 */
export function computeYourShare(
  expense: Pick<Expense, 'amount' | 'currency' | 'paidBy' | 'splits'>,
  currentUid: string,
): YourShareInfo {
  const yourSplit = expense.splits.find((s) => s.uid === currentUid)
  const youPaid = expense.paidBy === currentUid

  if (youPaid) {
    const owedToYou = Math.round((expense.amount - (yourSplit?.amount ?? 0)) * 100) / 100
    const primary = `You paid ${formatCurrency(expense.amount, expense.currency)}`
    if (owedToYou > 0.005) {
      return { tone: 'positive', primary, secondary: `you're owed ${formatCurrency(owedToYou, expense.currency)}` }
    }
    return { tone: 'neutral', primary }
  }

  if (yourSplit) {
    return { tone: 'negative', primary: `You owe ${formatCurrency(yourSplit.amount, expense.currency)}` }
  }

  return { tone: 'none', primary: 'Not involved' }
}
