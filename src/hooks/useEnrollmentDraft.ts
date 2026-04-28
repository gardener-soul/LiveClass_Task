import { useEffect, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { EnrollmentFormValues } from '@/schemas/enrollment.schema';
import type { EnrollmentResponse } from '@/types/enrollment';

export const DRAFT_KEY = 'enrollment-form-draft';

export type EnrollmentDraft = {
  version: 1;
  values: EnrollmentFormValues;
  currentStep: 1 | 2 | 3;
};

export function useEnrollmentDraft(
  methods: UseFormReturn<EnrollmentFormValues>,
  currentStep: 1 | 2 | 3,
  enrollmentResult: EnrollmentResponse | null,
) {
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentStepRef = useRef<1 | 2 | 3>(currentStep);
  currentStepRef.current = currentStep;
  const isMountedRef = useRef(false);

  const isDirty = methods.formState.isDirty;

  // watch() subscription → 500ms debounce → localStorage 저장
  useEffect(() => {
    const subscription = methods.watch((values) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            version: 1,
            values: values as EnrollmentFormValues,
            currentStep: currentStepRef.current,
          } satisfies EnrollmentDraft),
        );
      }, 500);
    });
    return () => {
      subscription.unsubscribe();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [methods]);

  // 스텝 변경 시 즉시 저장 (watch debounce보다 우선하여 중복 write 방지)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (enrollmentResult) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        version: 1,
        values: methods.getValues(),
        currentStep,
      } satisfies EnrollmentDraft),
    );
  }, [currentStep, enrollmentResult, methods]);

  // 브라우저 이탈 방지 (제출 성공 후 비활성화)
  useEffect(() => {
    if (enrollmentResult) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty || currentStep > 1) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, currentStep, enrollmentResult]);

  return {
    clearDraft: () => localStorage.removeItem(DRAFT_KEY),
  };
}
