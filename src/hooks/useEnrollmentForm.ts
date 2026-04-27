import { useState, useEffect, useRef } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { submitEnrollment } from '@/api/enrollments';
import { step1Schema } from '@/schemas/step1.schema';
import { applicantSchema, step2PersonalSchema, createStep2GroupSchema } from '@/schemas/step2.schema';
import { step3Schema } from '@/schemas/step3.schema';
import { useCourses } from '@/hooks/useCourses';
import type { EnrollmentType, EnrollmentRequest, EnrollmentResponse, ErrorResponse } from '@/types/enrollment';

// applicantSchema 재사용으로 blur 시 포맷 검증 동작 보장
// group은 optional + 포맷 검증 없음 (스텝 전환 시 createStep2GroupSchema로 처리)
const fullSchema = z.object({
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

const DRAFT_KEY = 'enrollment-form-draft';

type EnrollmentDraft = {
  version: 1;
  values: EnrollmentFormValues;
  currentStep: 1 | 2 | 3;
};

function loadDraft(): { values: EnrollmentFormValues; step: 1 | 2 | 3 } | null {
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

function buildEnrollmentRequest(data: EnrollmentFormValues): EnrollmentRequest {
  if (data.enrollmentType === 'group' && data.group) {
    return {
      courseId: data.courseId,
      type: 'group',
      applicant: data.applicant,
      group: {
        ...data.group,
        // step 2 검증 통과 후 headCount는 반드시 유효한 number
        headCount: data.group.headCount as number,
      },
      agreedToTerms: data.agreedToTerms,
    };
  }
  return {
    courseId: data.courseId,
    type: 'personal',
    applicant: data.applicant,
    agreedToTerms: data.agreedToTerms,
  };
}

export function useEnrollmentForm() {
  const [initialDraft] = useState(() => loadDraft());
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(initialDraft?.step ?? 1);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState(false);
  const [pendingBack, setPendingBack] = useState(false);
  const [submissionError, setSubmissionError] = useState<ErrorResponse | null>(null);
  const [enrollmentResult, setEnrollmentResult] = useState<EnrollmentResponse | null>(null);

  const { data: coursesData } = useCourses();

  const methods = useForm<EnrollmentFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(fullSchema),
    defaultValues: initialDraft?.values ?? {
      courseId: '',
      enrollmentType: 'personal',
      applicant: { name: '', email: '', phone: '', motivation: '' },
      group: undefined,
      agreedToTerms: false,
    },
  });

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentStepRef = useRef<1 | 2 | 3>(currentStep);
  currentStepRef.current = currentStep;
  // 초기 마운트와 실제 스텝 변경을 구분하기 위한 flag
  const isMountedRef = useRef(false);

  const isDirty = methods.formState.isDirty;

  // watch() subscription → 500ms debounce → localStorage 저장
  useEffect(() => {
    const subscription = methods.watch((values) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          version: 1,
          values: values as EnrollmentFormValues,
          currentStep: currentStepRef.current,
        } satisfies EnrollmentDraft));
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
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      version: 1,
      values: methods.getValues(),
      currentStep,
    } satisfies EnrollmentDraft));
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

  const handleNextStep = () => {
    const values = methods.getValues();

    let stepSchema: z.ZodType;
    if (currentStep === 1) {
      stepSchema = step1Schema;
    } else if (currentStep === 2 && values.enrollmentType === 'group') {
      const selectedCourse = coursesData?.courses.find((c) => c.id === values.courseId);
      const remainingCapacity = selectedCourse
        ? selectedCourse.maxCapacity - selectedCourse.currentEnrollment
        : 10;
      stepSchema = createStep2GroupSchema(Math.min(10, remainingCapacity));
    } else if (currentStep === 2) {
      stepSchema = step2PersonalSchema;
    } else {
      stepSchema = step3Schema;
    }

    methods.clearErrors();
    const result = stepSchema.safeParse(values);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.') as FieldPath<EnrollmentFormValues>;
        if (path) methods.setError(path, { type: 'manual', message: issue.message });
      });
      // 첫 번째 에러 필드로 포커스 이동 (스크롤 포함)
      const firstPath = result.error.issues[0]?.path.join('.') as FieldPath<EnrollmentFormValues>;
      if (firstPath) setTimeout(() => methods.setFocus(firstPath), 0);
      return;
    }

    if (currentStep === 1 && isEditingCourse) {
      setIsEditingCourse(false);
      setCurrentStep(3);
    } else {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
  };

  const requestBack = () => setPendingBack(true);
  const confirmBack = () => {
    setPendingBack(false);
    setCurrentStep(1);
  };
  const cancelBack = () => setPendingBack(false);

  const goToStep = (step: 1 | 2 | 3) => {
    if (step < currentStep) setCurrentStep(step);
  };

  // Step 3에서 강의 정보만 수정할 때: Step 2를 건너뛰고 Step 1 → Step 3으로 이동
  const startCourseEdit = () => {
    setIsEditingCourse(true);
    setCurrentStep(1);
  };

  // group이 undefined이면 데이터 없음, 있으면 내용 확인
  const hasGroupData = (): boolean => {
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
    // 단체 전환 시 group이 없으면 초기값으로 생성
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

  const mutation = useMutation({
    mutationFn: submitEnrollment,
    onSuccess: (data) => {
      setEnrollmentResult(data);
    },
    onError: (error: unknown) => {
      const err = error as Partial<ErrorResponse>;
      if (err.code === 'INVALID_INPUT' && err.details) {
        Object.entries(err.details).forEach(([field, message]) => {
          methods.setError(field as FieldPath<EnrollmentFormValues>, { message });
        });
      } else if (err.code) {
        // 비즈니스 에러 (COURSE_FULL, DUPLICATE_ENROLLMENT 등)
        setSubmissionError(err as ErrorResponse);
      } else {
        // 네트워크 에러 또는 예상치 못한 에러
        setSubmissionError({ code: 'NETWORK_ERROR', message: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
      }
    },
  });

  const handleSubmit = methods.handleSubmit((data) => {
    setSubmissionError(null);
    mutation.mutate(buildEnrollmentRequest(data));
  });

  const handleReset = () => {
    methods.reset();
    setCurrentStep(1);
    setEnrollmentResult(null);
    setSubmissionError(null);
    localStorage.removeItem(DRAFT_KEY);
  };

  return {
    methods,
    currentStep,
    isEditingCourse,
    handleNextStep,
    handlePrevStep,
    goToStep,
    startCourseEdit,
    handleEnrollmentTypeChange,
    pendingSwitch,
    confirmSwitch,
    cancelSwitch,
    pendingBack,
    requestBack,
    confirmBack,
    cancelBack,
    handleSubmit,
    handleReset,
    isPending: mutation.isPending,
    submissionError,
    enrollmentResult,
  };
}
