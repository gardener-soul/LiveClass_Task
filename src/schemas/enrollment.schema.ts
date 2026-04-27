import { z } from 'zod';
import { applicantSchema } from '@/schemas/step2.schema';

// applicantSchema 재사용으로 blur 시 포맷 검증 동작 보장
// group은 optional + 포맷 검증 없음 (스텝 전환 시 createStep2GroupSchema로 처리)
export const fullSchema = z.object({
  courseId: z.string(),
  enrollmentType: z.enum(['personal', 'group']),
  applicant: applicantSchema,
  group: z
    .object({
      organizationName: z.string(),
      headCount: z.number().optional(),
      participants: z.array(z.object({ name: z.string(), email: z.string() })),
      contactPerson: z.string(),
    })
    .optional(),
  agreedToTerms: z.boolean(),
});

export type EnrollmentFormValues = z.infer<typeof fullSchema>;
