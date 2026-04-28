import { useFormContext } from 'react-hook-form';

import type { EnrollmentFormValues } from '@/hooks/useEnrollmentForm';
import { formatPhoneInput } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Step2GroupInfo } from '@/components/enrollment/Step2GroupInfo';

interface Step2PersonalInfoProps {
  onNext: () => void;
  onPrev: () => void;
}

export function Step2PersonalInfo({ onNext, onPrev }: Step2PersonalInfoProps) {
  const { control, watch } = useFormContext<EnrollmentFormValues>();
  const enrollmentType = watch('enrollmentType');

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">신청 정보 입력</h2>
        <p className="text-sm text-muted-foreground">수강 신청자 정보를 입력해주세요.</p>
      </div>

      {/* 신청자 정보 */}
      <div className="flex flex-col gap-4 rounded-xl border border-border p-4">
        <p className="text-sm font-semibold text-foreground">신청자 정보</p>

        {/* 이름 */}
        <FormField
          control={control}
          name="applicant.name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이름 *</FormLabel>
              <FormControl>
                <Input placeholder="홍길동" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 이메일 */}
        <FormField
          control={control}
          name="applicant.email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일 *</FormLabel>
              <FormControl>
                <Input placeholder="hong@example.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 전화번호 */}
        <FormField
          control={control}
          name="applicant.phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>전화번호 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="010-1234-5678"
                  inputMode="numeric"
                  {...field}
                  onChange={(e) => field.onChange(formatPhoneInput(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 수강 동기 (선택) */}
        <FormField
          control={control}
          name="applicant.motivation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>수강 동기 (선택)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="수강 신청 동기를 300자 이내로 입력해주세요."
                  maxLength={300}
                  className="h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* 단체 정보 (단체 신청 시) */}
      {enrollmentType === 'group' && <Step2GroupInfo />}

      {/* 네비게이션 */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onPrev}>
          ← 이전
        </Button>
        <Button type="button" className="w-full sm:w-auto" onClick={onNext}>
          다음 단계 →
        </Button>
      </div>
    </div>
  );
}
