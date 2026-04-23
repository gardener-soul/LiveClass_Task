import { z } from 'zod';

export const step1Schema = z.object({
  courseId: z.string().min(1, '강의를 선택해주세요'),
  enrollmentType: z.enum(['personal', 'group']),
});

export type Step1FormData = z.infer<typeof step1Schema>;
