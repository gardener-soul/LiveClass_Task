import { z } from 'zod';

export const step1Schema = z.object({
  courseId: z.string().min(1, { error: '강의를 선택해주세요' }),
  enrollmentType: z.enum(['personal', 'group'], { error: '신청 유형을 선택해주세요' }),
});

export type Step1FormData = z.infer<typeof step1Schema>;
