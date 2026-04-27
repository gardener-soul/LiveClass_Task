import { useEffect } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';

import type { EnrollmentFormValues } from '@/hooks/useEnrollmentForm';
import { useCourses } from '@/hooks/useCourses';
import { formatPhoneInput } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';

export function Step2GroupInfo() {
  const { control, watch } = useFormContext<EnrollmentFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'group.participants',
  });

  const headCount = watch('group.headCount') ?? 0;
  const courseId = watch('courseId');

  const { data } = useCourses();
  const selectedCourse = data?.courses.find((c) => c.id === courseId);
  const remainingCapacity = selectedCourse
    ? selectedCourse.maxCapacity - selectedCourse.currentEnrollment
    : 10;
  const effectiveMax = Math.min(10, remainingCapacity);

  useEffect(() => {
    const diff = headCount - fields.length;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        append({ name: '', email: '' }, { shouldFocus: false });
      }
    } else if (diff < 0) {
      remove(
        Array.from({ length: Math.abs(diff) }, (_, i) => fields.length - 1 - i),
      );
    }
  }, [headCount, fields.length, append, remove]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-4">
      <p className="text-sm font-semibold text-foreground">단체 정보</p>

      {/* 단체명 */}
      <FormField
        control={control}
        name="group.organizationName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>단체명 *</FormLabel>
            <FormControl>
              <Input placeholder="(주)라이브클래스" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 신청 인원수 */}
      <FormField
        control={control}
        name="group.headCount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>신청 인원수 * (2~{effectiveMax}명)</FormLabel>
            {remainingCapacity < 10 && (
              <p className="text-xs text-amber-600">
                잔여 정원이 {remainingCapacity}명입니다. 최대 {effectiveMax}명까지 단체 신청이 가능합니다.
              </p>
            )}
            <FormControl>
              <Input
                type="number"
                min={2}
                max={effectiveMax}
                placeholder="5"
                {...field}
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = e.target.valueAsNumber;
                  if (isNaN(val)) {
                    field.onChange(undefined);
                  } else if (val > effectiveMax) {
                    field.onChange(effectiveMax);
                  } else {
                    field.onChange(val);
                  }
                }}
                onBlur={(e) => {
                  const val = e.target.valueAsNumber;
                  if (!isNaN(val) && val < 2) {
                    field.onChange(2);
                  }
                  field.onBlur();
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 담당자 연락처 */}
      <FormField
        control={control}
        name="group.contactPerson"
        render={({ field }) => (
          <FormItem>
            <FormLabel>담당자 연락처 *</FormLabel>
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

      {/* 참가자 명단 */}
      {fields.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">참가자 명단</p>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <span className="mt-2 text-xs text-muted-foreground w-5 shrink-0">
                {index + 1}
              </span>
              <div className="flex-1 flex flex-col gap-1.5">
                <FormField
                  control={control}
                  name={`group.participants.${index}.name`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="이름" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex-1 flex flex-col gap-1.5">
                <FormField
                  control={control}
                  name={`group.participants.${index}.email`}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="이메일" type="email" {...f} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
