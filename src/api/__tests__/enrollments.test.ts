import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitEnrollment } from '@/api/enrollments'
import type { EnrollmentRequest } from '@/types/enrollment'

vi.mock('@/api/_utils', () => ({
  delay: vi.fn().mockResolvedValue(undefined),
}))

const validRequest: EnrollmentRequest = {
  courseId: 'course-dev-01',
  type: 'personal',
  applicant: {
    name: '김철수',
    email: 'test@example.com',
    phone: '010-1234-5678',
  },
  agreedToTerms: true,
}

describe('submitEnrollment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('정상 신청 시 enrollmentId와 status: confirmed를 반환한다', async () => {
    const result = await submitEnrollment(validRequest)
    expect(result.enrollmentId).toMatch(/^ENR-/)
    expect(result.status).toBe('confirmed')
  })

  it('정원 마감 강의 courseId이면 COURSE_FULL 에러를 throw한다', async () => {
    await expect(
      submitEnrollment({ ...validRequest, courseId: 'course-dev-02' }),
    ).rejects.toMatchObject({ code: 'COURSE_FULL' })
  })

  it('중복 이메일이면 DUPLICATE_ENROLLMENT 에러를 throw한다', async () => {
    await expect(
      submitEnrollment({
        ...validRequest,
        applicant: { ...validRequest.applicant, email: 'duplicate@test.com' },
      }),
    ).rejects.toMatchObject({ code: 'DUPLICATE_ENROLLMENT' })
  })

  it('invalid로 시작하는 이름이면 INVALID_INPUT 에러와 details를 throw한다', async () => {
    await expect(
      submitEnrollment({
        ...validRequest,
        applicant: { ...validRequest.applicant, name: 'invalid홍길동' },
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_INPUT',
      details: { 'applicant.name': expect.any(String) },
    })
  })
})
