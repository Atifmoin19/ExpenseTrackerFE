import { describe, expect, it } from 'vitest'
import { normalizeUser } from 'Services/auth'

describe('normalizeUser', () => {
  it('maps the backend id to uid and keeps the flags', () => {
    const user = normalizeUser({
      id: 'u-1', email: 'a@example.com', displayName: null, photoUrl: null,
      isPlatformAdmin: true, isDemo: true, demoExpiresAt: '2026-11-01T00:00:00Z',
      createdAt: '2026-10-31T00:00:00Z', updatedAt: '2026-10-31T00:00:00Z',
    })
    expect(user).toMatchObject({ uid: 'u-1', displayName: '', isPlatformAdmin: true, isDemo: true })
    expect(user).not.toHaveProperty('id')
  })
})
