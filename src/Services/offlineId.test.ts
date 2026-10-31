import { describe, expect, it } from 'vitest'
import {
  MAX_LOCAL_ID_LENGTH,
  OFFLINE_LOCAL_ID_HEADER,
  generateLocalId,
  isValidLocalId,
  offlineIdHeaders,
} from 'Services/offlineId'

describe('generateLocalId', () => {
  it('uses crypto.randomUUID and gives a fresh id per call', () => {
    const a = generateLocalId()
    const b = generateLocalId()
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(a).not.toBe(b)
  })

  it('falls back to a local- id within the backend length cap when randomUUID is missing', () => {
    const id = generateLocalId({})
    expect(id.startsWith('local-')).toBe(true)
    expect(id.length).toBeLessThanOrEqual(MAX_LOCAL_ID_LENGTH)
    expect(generateLocalId(undefined)).not.toBe(id)
  })
})

describe('offlineIdHeaders', () => {
  it('puts the id in the X-Offline-Local-Id header', () => {
    expect(OFFLINE_LOCAL_ID_HEADER).toBe('X-Offline-Local-Id')
    expect(offlineIdHeaders('abc')).toEqual({ 'X-Offline-Local-Id': 'abc' })
  })

  it('rejects empty or over-long ids instead of silently sending no idempotency key', () => {
    expect(isValidLocalId('')).toBe(false)
    expect(isValidLocalId(undefined)).toBe(false)
    expect(isValidLocalId('x'.repeat(MAX_LOCAL_ID_LENGTH + 1))).toBe(false)
    expect(() => offlineIdHeaders('')).toThrow()
  })
})
