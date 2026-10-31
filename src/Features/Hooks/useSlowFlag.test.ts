import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useSlowFlag } from 'Features/Hooks/useSlowFlag'

describe('useSlowFlag', () => {
  afterEach(() => vi.useRealTimers())

  it('turns true only after the request has been pending for the delay', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useSlowFlag(true, 2500))
    act(() => vi.advanceTimersByTime(2499))
    expect(result.current).toBe(false)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe(true)
  })

  it('resets when the request finishes, and never fires for a fast request', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ active }) => useSlowFlag(active, 2500), {
      initialProps: { active: true },
    })
    act(() => vi.advanceTimersByTime(3000))
    expect(result.current).toBe(true)
    rerender({ active: false })
    expect(result.current).toBe(false)

    rerender({ active: true })
    act(() => vi.advanceTimersByTime(1000))
    rerender({ active: false })
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current).toBe(false)
  })
})
