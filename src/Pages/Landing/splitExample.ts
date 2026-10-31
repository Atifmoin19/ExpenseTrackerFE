import { resolveSplits, type DraftSplitLine } from 'Features/Schema/splitUtils'
import type { SplitType } from 'Features/Schema/types'

/** The landing page's worked example: one dinner bill, four friends. */
export const EXAMPLE_PEOPLE = ['You', 'Aarav', 'Meera', 'Kabir'] as const
export const EXAMPLE_DEFAULT_AMOUNT = 2400
/** Theme colour per example person, in EXAMPLE_PEOPLE order. */
export const PERSON_COLORS = ['primary.600', 'primary.400', 'primary.200', 'ink.300']

const PERCENTAGES = [40, 30, 20, 10]
const SHARES = [2, 1, 1, 1]
// Exact amounts are entered as rupees; scale this pattern to the bill so the
// lines always add up to the total.
const EXACT_WEIGHTS = [0.375, 0.29, 0.21, 0.125]

export const SPLIT_TYPE_COPY: Record<SplitType, { title: string; blurb: string }> = {
  equal: { title: 'Equal', blurb: 'Everyone pays the same.' },
  exact: { title: 'Exact', blurb: 'Type what each person owes.' },
  percentage: { title: 'Percentage', blurb: 'Split by percent, must total 100.' },
  shares: { title: 'Shares', blurb: 'Two shares for the couple, one for each single.' },
}

export function exampleLines(type: SplitType, amount: number): DraftSplitLine[] {
  const uids = EXAMPLE_PEOPLE.map((p) => p.toLowerCase())
  switch (type) {
    case 'exact': {
      const parts = EXACT_WEIGHTS.map((w) => Math.round(amount * w))
      parts[parts.length - 1] = Math.round((amount - parts.slice(0, -1).reduce((a, b) => a + b, 0)) * 100) / 100
      return uids.map((uid, i) => ({ uid, amount: parts[i] }))
    }
    case 'percentage':
      return uids.map((uid, i) => ({ uid, percentage: PERCENTAGES[i] }))
    case 'shares':
      return uids.map((uid, i) => ({ uid, shares: SHARES[i] }))
    default:
      return uids.map((uid) => ({ uid }))
  }
}

/** Per-person label for the input that drives each split type ("40%", "2 shares"). */
export function lineLabel(type: SplitType, line: DraftSplitLine): string | null {
  if (type === 'percentage') return `${line.percentage}%`
  if (type === 'shares') return `${line.shares} share${line.shares === 1 ? '' : 's'}`
  return null
}

export function exampleSplit(type: SplitType, amount: number) {
  const lines = exampleLines(type, amount)
  return resolveSplits(type, lines, amount).map((split, i) => ({
    name: EXAMPLE_PEOPLE[i],
    amount: split.amount,
    label: lineLabel(type, lines[i]),
    fraction: amount > 0 ? split.amount / amount : 0,
  }))
}
