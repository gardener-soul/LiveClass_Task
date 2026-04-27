import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fullSchema } from '@/schemas/enrollment.schema';
import { DRAFT_KEY, type EnrollmentDraft, useEnrollmentDraft } from '@/hooks/useEnrollmentDraft';
import { useStepNavigation } from '@/hooks/useStepNavigation';
import { useEnrollmentSubmit } from '@/hooks/useEnrollmentSubmit';
import type { EnrollmentType } from '@/types/enrollment';

export type { EnrollmentFormValues } from '@/schemas/enrollment.schema';

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    if ((parsed as Record<string, unknown>).version !== 1) return null;
    const draft = parsed as EnrollmentDraft;
    const result = fullSchema.safeParse(draft.values);
    if (!result.success) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    const step = draft.currentStep;
    if (step !== 1 && step !== 2 && step !== 3) return null;
    return { values: result.data, step };
  } catch {
    localStorage.removeItem(DRAFT_KEY);
    return null;
  }
}

export function useEnrollmentForm() {
  const [initialDraft] = useState(() => loadDraft());
  const [pendingSwitch, setPendingSwitch] = useState(false);

  const methods = useForm({
    mode: 'onBlur',
    resolver: zodResolver(fullSchema),
    defaultValues: initialDraft?.values ?? {
      courseId: '',
      enrollmentType: 'personal' as const,
      applicant: { name: '', email: '', phone: '', motivation: '' },
      group: undefined,
      agreedToTerms: false,
    },
  });

  const { submissionError, enrollmentResult, handleSubmit, isPending, resetSubmit } =
    useEnrollmentSubmit(methods);

  const stepNav = useStepNavigation(methods, initialDraft?.step ?? 1);

  const { clearDraft } = useEnrollmentDraft(methods, stepNav.currentStep, enrollmentResult);
  const wasRestored = initialDraft !== null;

  const hasGroupData = () => {
    const group = methods.getValues('group');
    if (!group) return false;
    return !!(group.organizationName || group.participants?.some((p) => p.name || p.email));
  };

  const handleEnrollmentTypeChange = (newType: EnrollmentType) => {
    const currentType = methods.getValues('enrollmentType');
    if (currentType === 'group' && newType === 'personal' && hasGroupData()) {
      setPendingSwitch(true);
      return;
    }
    if (newType === 'group' && !methods.getValues('group')) {
      methods.setValue('group', { organizationName: '', headCount: undefined, participants: [], contactPerson: '' });
    }
    methods.setValue('enrollmentType', newType);
  };

  const confirmSwitch = () => {
    methods.setValue('enrollmentType', 'personal');
    methods.resetField('group'); // defaultValues(undefined)로 리셋 + group 에러 일괄 초기화
    setPendingSwitch(false);
  };

  const cancelSwitch = () => setPendingSwitch(false);

  const handleReset = () => {
    methods.reset();
    stepNav.resetStep();
    resetSubmit();
    clearDraft();
  };

  return {
    methods,
    ...stepNav,
    handleEnrollmentTypeChange,
    pendingSwitch,
    confirmSwitch,
    cancelSwitch,
    handleSubmit,
    handleReset,
    isPending,
    submissionError,
    enrollmentResult,
    wasRestored,
  };
}
