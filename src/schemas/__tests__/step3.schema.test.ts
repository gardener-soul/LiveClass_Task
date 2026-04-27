import { describe, it, expect } from 'vitest'
import { step3Schema } from '@/schemas/step3.schema'

describe('step3Schema', () => {
  it('agreedToTerms: true이면 통과한다', () => {
    const result = step3Schema.safeParse({ agreedToTerms: true })
    expect(result.success).toBe(true)
  })

  it('agreedToTerms: false이면 실패한다', () => {
    const result = step3Schema.safeParse({ agreedToTerms: false })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('이용약관에 동의해주세요')
    }
  })
})
