import { z } from 'zod';

export const step3Schema = z.object({
  agreedToTerms: z.literal(true, { message: '이용약관에 동의해주세요' }),
});

export type Step3FormData = z.infer<typeof step3Schema>;
