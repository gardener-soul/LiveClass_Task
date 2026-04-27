import { describe, it, expect } from 'vitest'
import { step1Schema } from '@/schemas/step1.schema'

describe('step1Schema', () => {
  it('유효한 데이터(courseId + personal)를 통과시킨다', () => {
    const result = step1Schema.safeParse({
      courseId: 'course-dev-01',
      enrollmentType: 'personal',
    })
    expect(result.success).toBe(true)
  })

  it('유효한 데이터(courseId + group)를 통과시킨다', () => {
    const result = step1Schema.safeParse({
      courseId: 'course-dev-01',
      enrollmentType: 'group',
    })
    expect(result.success).toBe(true)
  })

  it('courseId가 빈 문자열이면 실패한다', () => {
    const result = step1Schema.safeParse({
      courseId: '',
      enrollmentType: 'personal',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('강의를 선택해주세요')
    }
  })

  it('enrollmentType이 enum 외 값이면 실패한다', () => {
    const result = step1Schema.safeParse({
      courseId: 'course-dev-01',
      enrollmentType: 'corporate',
    })
    expect(result.success).toBe(false)
  })
})
