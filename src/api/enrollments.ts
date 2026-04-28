import type { EnrollmentRequest, EnrollmentResponse, ErrorResponse } from '@/types/enrollment';
import { COURSE_FULL_API_IDS, DUPLICATE_EMAIL, INVALID_TRIGGER_NAME_PREFIX } from '@/mocks/data';
import { delay } from '@/api/_utils';

export async function submitEnrollment(data: EnrollmentRequest): Promise<EnrollmentResponse> {
  await delay(500, 800);

  if (COURSE_FULL_API_IDS.includes(data.courseId)) {
    throw {
      code: 'COURSE_FULL',
      message: '해당 강의의 정원이 마감되었습니다.',
    } satisfies ErrorResponse;
  }

  if (data.applicant.email === DUPLICATE_EMAIL) {
    throw {
      code: 'DUPLICATE_ENROLLMENT',
      message: '이미 신청하신 강의입니다.',
    } satisfies ErrorResponse;
  }

  if (data.applicant.name.toLowerCase().startsWith(INVALID_TRIGGER_NAME_PREFIX)) {
    throw {
      code: 'INVALID_INPUT',
      message: '입력값이 올바르지 않습니다.',
      details: { 'applicant.name': '허용되지 않는 이름입니다' },
    } satisfies ErrorResponse;
  }

  return {
    enrollmentId: `ENR-${Date.now()}`,
    status: 'confirmed',
    enrolledAt: new Date().toISOString(),
  };
}
