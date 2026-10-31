import { describe, expect, it } from 'vitest'
import { exampleSplit } from 'Pages/Landing/splitExample'
import type { SplitType } from 'Features/Schema/types'

const TYPES: SplitType[] = ['equal', 'exact', 'percentage', 'shares']

describe('landing split example', () => {
  it.each(TYPES)('%s split adds back up to the bill', (type) => {
    for (const amount of [2400, 1999, 37.5]) {
      const total = exampleSplit(type, amount).reduce((sum, r) => sum + r.amount, 0)
      expect(total).toBeCloseTo(amount, 1)
    }
  })

  it('uses the real split rules for the default dinner', () => {
    expect(exampleSplit('equal', 2400).map((r) => r.amount)).toEqual([600, 600, 600, 600])
    expect(exampleSplit('shares', 2400).map((r) => [r.amount, r.label])).toEqual([
      [960, '2 shares'], [480, '1 share'], [480, '1 share'], [480, '1 share'],
    ])
    expect(exampleSplit('percentage', 2400)[0]).toMatchObject({ amount: 960, label: '40%' })
  })
})
