import { useFormContext } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import type React from 'react';

import type { ErrorResponse } from '@/types/enrollment';
import type { EnrollmentFormValues } from '@/hooks/useEnrollmentForm';
import { useCourses } from '@/hooks/useCourses';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface Step3ConfirmProps {
  onPrev: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  goToStep: (step: 1 | 2 | 3) => void;
  onEditCourse: () => void;
  isPending: boolean;
  submissionError: ErrorResponse | null;
}

const ERROR_MESSAGES: Record<string, string> = {
  COURSE_FULL: '선택하신 강의의 정원이 마감되었습니다.',
  DUPLICATE_ENROLLMENT: '이미 신청하신 강의입니다.',
  NETWORK_ERROR: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}

function SummaryCard({ title, onEdit, children }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <Button type="button" variant="link" size="xs" onClick={onEdit}>
          수정
        </Button>
      </div>
      {children}
    </div>
  );
}

export function Step3Confirm({
  onPrev,
  onSubmit,
  goToStep,
  onEditCourse,
  isPending,
  submissionError,
}: Step3ConfirmProps) {
  const { control, watch } = useFormContext<EnrollmentFormValues>();
  const values = watch();
  const agreedToTerms = values.agreedToTerms;
  const { data } = useCourses();

  const selectedCourse = data?.courses.find((c) => c.id === values.courseId);
  const remaining = selectedCourse
    ? selectedCourse.maxCapacity - selectedCourse.currentEnrollment
    : 0;
  const isAlmostFull = remaining > 0 && remaining <= 5;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">최종 확인</h2>
        <p className="text-sm text-muted-foreground">입력하신 정보를 확인해주세요.</p>
      </div>

      {/* 에러 Alert */}
      {submissionError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex flex-col gap-2">
          <p className="text-sm font-medium text-destructive">
            {ERROR_MESSAGES[submissionError.code] ?? submissionError.message}
          </p>
          {submissionError.code === 'COURSE_FULL' && (
            <Button
              type="button"
              variant="link"
              size="xs"
              className="self-start text-destructive hover:text-destructive"
              onClick={() => goToStep(1)}
            >
              강의 다시 선택
            </Button>
          )}
        </div>
      )}

      {/* 강의 정보 요약 */}
      <SummaryCard title="강의 정보" onEdit={onEditCourse}>
        {selectedCourse ? (
          <>
            <InfoRow label="강의명" value={selectedCourse.title} />
            <InfoRow label="강사" value={selectedCourse.instructor} />
            <InfoRow
              label="수강 기간"
              value={`${selectedCourse.startDate} ~ ${selectedCourse.endDate}`}
            />
            <InfoRow label="수강료" value={`${selectedCourse.price.toLocaleString()}원`} />
            {isAlmostFull && (
              <p className="text-xs text-amber-600 font-medium">
                ⚠ 잔여 자리가 {remaining}자리 남아있습니다. 빠른 신청을 권장합니다.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">선택된 강의가 없습니다.</p>
        )}
      </SummaryCard>

      {/* 신청자 정보 요약 */}
      <SummaryCard title="신청자 정보" onEdit={() => goToStep(2)}>
        <InfoRow label="이름" value={values.applicant.name} />
        <InfoRow label="이메일" value={values.applicant.email} />
        <InfoRow label="전화번호" value={values.applicant.phone} />
        {values.applicant.motivation && (
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
            <span className="text-muted-foreground shrink-0">수강 동기</span>
            <span className="font-medium break-words">{values.applicant.motivation}</span>
          </div>
        )}
      </SummaryCard>

      {/* 단체 정보 요약 */}
      {values.enrollmentType === 'group' && values.group && (
        <SummaryCard title="단체 정보" onEdit={() => goToStep(2)}>
          <InfoRow label="단체명" value={values.group.organizationName} />
          <InfoRow label="신청 인원" value={`${values.group.headCount ?? '-'}명`} />
          <InfoRow label="담당자" value={values.group.contactPerson} />
          {values.group.participants.length > 0 && (
            <div className="flex gap-2 text-sm">
              <span className="text-muted-foreground w-20 shrink-0">참가자</span>
              <div className="flex flex-col gap-1">
                {values.group.participants.map((p, i) => (
                  <span key={i} className="font-medium">
                    {p.name} ({p.email})
                  </span>
                ))}
              </div>
            </div>
          )}
        </SummaryCard>
      )}

      {/* 이용약관 동의 */}
      <FormField
        control={control}
        name="agreedToTerms"
        render={({ field }) => (
          <FormItem className="flex-row items-start gap-3 rounded-lg border border-border p-4">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="flex flex-col gap-1">
              <FormLabel className="leading-none cursor-pointer">
                이용약관 및 개인정보 처리방침에 동의합니다
              </FormLabel>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      {/* 네비게이션 */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onPrev} disabled={isPending}>
          ← 이전
        </Button>
        <Button type="button" className="w-full sm:w-auto" onClick={onSubmit} disabled={isPending || !agreedToTerms}>
          {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
          신청하기
        </Button>
      </div>
    </div>
  );
}
