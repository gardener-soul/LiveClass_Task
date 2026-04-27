import { describe, it, expect } from 'vitest'
import { step2PersonalSchema, step2GroupSchema } from '@/schemas/step2.schema'

const validApplicant = {
  name: '김철수',
  email: 'test@example.com',
  phone: '010-1234-5678',
}

describe('step2PersonalSchema', () => {
  it('motivation 없이 유효한 데이터를 통과시킨다', () => {
    const result = step2PersonalSchema.safeParse({ applicant: validApplicant })
    expect(result.success).toBe(true)
  })

  it('motivation 있어도 통과한다', () => {
    const result = step2PersonalSchema.safeParse({
      applicant: { ...validApplicant, motivation: '배우고 싶습니다.' },
    })
    expect(result.success).toBe(true)
  })

  it('이름이 1자이면 실패한다', () => {
    const result = step2PersonalSchema.safeParse({
      applicant: { ...validApplicant, name: '김' },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('name'))
      expect(issue?.message).toMatch(/2자 이상/)
    }
  })

  it('이름이 21자이면 실패한다', () => {
    const result = step2PersonalSchema.safeParse({
      applicant: { ...validApplicant, name: '김'.repeat(21) },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('name'))
      expect(issue?.message).toMatch(/20자 이하/)
    }
  })

  it('이메일 형식이 틀리면 실패한다', () => {
    const result = step2PersonalSchema.safeParse({
      applicant: { ...validApplicant, email: 'not-an-email' },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('email'))
      expect(issue?.message).toMatch(/이메일/)
    }
  })

  it('하이픈 없는 전화번호 형식을 거부한다', () => {
    const result = step2PersonalSchema.safeParse({
      applicant: { ...validApplicant, phone: '01012345678' },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('phone'))
      expect(issue?.message).toMatch(/전화번호/)
    }
  })

  it('하이픈 있는 전화번호를 통과시킨다', () => {
    const result = step2PersonalSchema.safeParse({
      applicant: { ...validApplicant, phone: '010-1234-5678' },
    })
    expect(result.success).toBe(true)
  })

  it('motivation이 301자이면 실패한다', () => {
    const result = step2PersonalSchema.safeParse({
      applicant: { ...validApplicant, motivation: 'a'.repeat(301) },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('motivation'))
      expect(issue?.message).toMatch(/300자 이하/)
    }
  })
})

const validGroup = {
  organizationName: '테스트 회사',
  headCount: 3,
  participants: [
    { name: '참가자1', email: 'p1@example.com' },
    { name: '참가자2', email: 'p2@example.com' },
    { name: '참가자3', email: 'p3@example.com' },
  ],
  contactPerson: '010-9876-5432',
}

describe('step2GroupSchema', () => {
  it('유효한 단체 데이터를 통과시킨다', () => {
    const result = step2GroupSchema.safeParse({
      applicant: validApplicant,
      group: validGroup,
    })
    expect(result.success).toBe(true)
  })

  it('headCount가 1명이면 실패한다', () => {
    const result = step2GroupSchema.safeParse({
      applicant: validApplicant,
      group: { ...validGroup, headCount: 1 },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('headCount'))
      expect(issue?.message).toMatch(/최소 2명/)
    }
  })

  it('headCount가 11명이면 실패한다', () => {
    const result = step2GroupSchema.safeParse({
      applicant: validApplicant,
      group: { ...validGroup, headCount: 11 },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('headCount'))
      expect(issue?.message).toMatch(/최대 10명/)
    }
  })

  it('참가자 이메일이 신청자 이메일과 중복되면 실패한다', () => {
    const result = step2GroupSchema.safeParse({
      applicant: validApplicant,
      group: {
        ...validGroup,
        participants: [
          { name: '참가자1', email: validApplicant.email },
          { name: '참가자2', email: 'p2@example.com' },
          { name: '참가자3', email: 'p3@example.com' },
        ],
      },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues[0]
      expect(issue.message).toBe('신청자 이메일과 중복됩니다')
    }
  })

  it('참가자들 간 이메일이 중복되면 실패한다', () => {
    const result = step2GroupSchema.safeParse({
      applicant: validApplicant,
      group: {
        ...validGroup,
        participants: [
          { name: '참가자1', email: 'p1@example.com' },
          { name: '참가자2', email: 'p1@example.com' },
          { name: '참가자3', email: 'p3@example.com' },
        ],
      },
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues[0]
      expect(issue.message).toBe('이미 입력된 이메일입니다')
    }
  })

  it('모든 이메일이 서로 다르면 통과한다', () => {
    const result = step2GroupSchema.safeParse({
      applicant: validApplicant,
      group: {
        ...validGroup,
        participants: [
          { name: '참가자1', email: 'p1@example.com' },
          { name: '참가자2', email: 'p2@example.com' },
          { name: '참가자3', email: 'p3@example.com' },
        ],
      },
    })
    expect(result.success).toBe(true)
  })
})
