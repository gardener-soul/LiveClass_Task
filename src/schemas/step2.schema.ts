import { z } from 'zod';

const PHONE_REGEX = /^0[0-9]{1,2}-[0-9]{3,4}-[0-9]{4}$/;

const applicantSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다').max(20, '이름은 20자 이하이어야 합니다'),
  email: z.string().email('올바른 이메일 형식을 입력해주세요'),
  phone: z.string().regex(PHONE_REGEX, '전화번호 형식이 올바르지 않습니다 (예: 010-1234-5678)'),
  motivation: z.string().max(300, '지원 동기는 300자 이하이어야 합니다').optional(),
});

const participantSchema = z.object({
  name: z.string().min(1, '참가자 이름을 입력해주세요'),
  email: z.string().email('올바른 이메일 형식을 입력해주세요'),
});

const groupSchema = z.object({
  organizationName: z.string().min(1, '단체명을 입력해주세요'),
  headCount: z
    .number({ error: '신청 인원을 입력해주세요' })
    .min(2, '단체 신청은 최소 2명 이상이어야 합니다')
    .max(10, '단체 신청은 최대 10명까지 가능합니다'),
  participants: z.array(participantSchema),
  contactPerson: z.string().min(1, '담당자 연락처를 입력해주세요'),
});

export const step2PersonalSchema = z.object({
  applicant: applicantSchema,
});

export const step2GroupSchema = z
  .object({
    applicant: applicantSchema,
    group: groupSchema,
  })
  .superRefine((data, ctx) => {
    const applicantEmail = data.applicant.email;
    const seen = new Set<string>([applicantEmail]);

    data.group.participants.forEach((participant, index) => {
      const { email } = participant;
      if (seen.has(email)) {
        ctx.addIssue({
          code: 'custom',
          message: email === applicantEmail ? '신청자 이메일과 중복됩니다' : '이미 입력된 이메일입니다',
          path: ['group', 'participants', index, 'email'],
        });
      } else {
        seen.add(email);
      }
    });
  });

export type Step2PersonalFormData = z.infer<typeof step2PersonalSchema>;
export type Step2GroupFormData = z.infer<typeof step2GroupSchema>;
