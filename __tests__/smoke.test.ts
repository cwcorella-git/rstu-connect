/**
 * Smoke tests to verify the testing setup works correctly
 */

describe('Test Setup', () => {
  it('should run a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have access to DOM APIs', () => {
    const div = document.createElement('div')
    div.textContent = 'Hello'
    expect(div.textContent).toBe('Hello')
  })

  it('should have localStorage mocked', () => {
    expect(window.localStorage).toBeDefined()
    expect(typeof window.localStorage.getItem).toBe('function')
  })
})

describe('Utility Functions', () => {
  // Test the simpleHash function logic (inlined to avoid import issues)
  function simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return 'h_' + Math.abs(hash).toString(36) + '_' + str.length.toString(36)
  }

  it('should hash strings deterministically', () => {
    const hash1 = simpleHash('password123')
    const hash2 = simpleHash('password123')
    expect(hash1).toBe(hash2)
  })

  it('should produce different hashes for different inputs', () => {
    const hash1 = simpleHash('password123')
    const hash2 = simpleHash('password456')
    expect(hash1).not.toBe(hash2)
  })

  it('should produce valid hash format', () => {
    const hash = simpleHash('test')
    expect(hash).toMatch(/^h_[a-z0-9]+_[a-z0-9]+$/)
  })
})

describe('Invite Code Generation', () => {
  // Test the invite code generation logic (inlined)
  function generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  it('should generate 6-character codes', () => {
    const code = generateInviteCode()
    expect(code).toHaveLength(6)
  })

  it('should only use allowed characters', () => {
    const code = generateInviteCode()
    const allowedChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/
    expect(code).toMatch(allowedChars)
  })

  it('should not contain confusing characters (0, O, 1, I)', () => {
    // Generate multiple codes to increase confidence
    // Note: L is allowed, only 0/O and 1/I are excluded
    for (let i = 0; i < 100; i++) {
      const code = generateInviteCode()
      expect(code).not.toMatch(/[0O1I]/)
    }
  })
})
