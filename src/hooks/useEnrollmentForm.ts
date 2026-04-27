import { useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { submitEnrollment } from '@/api/enrollments';
import { step1Schema } from '@/schemas/step1.schema';
import { step2PersonalSchema, step2GroupSchema } from '@/schemas/step2.schema';
import { step3Schema } from '@/schemas/step3.schema';
import type { EnrollmentType, EnrollmentRequest, EnrollmentResponse, ErrorResponse } from '@/types/enrollment';

// RHF 타입 추론 및 제출 전 최종 구조 검증용. 포맷 검증은 handleNextStep에서 스텝 스키마로 처리
const fullSchema = z.object({
  courseId: z.string(),
  enrollmentType: z.enum(['personal', 'group']),
  applicant: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    motivation: z.string().optional(),
  }),
  group: z
    .object({
      organizationName: z.string(),
      headCount: z.number(),
      participants: z.array(z.object({ name: z.string(), email: z.string() })),
      contactPerson: z.string(),
    })
    .optional(),
  agreedToTerms: z.boolean(),
});

export type EnrollmentFormValues = z.infer<typeof fullSchema>;

function buildEnrollmentRequest(data: EnrollmentFormValues): EnrollmentRequest {
  if (data.enrollmentType === 'group' && data.group) {
    return {
      courseId: data.courseId,
      type: 'group',
      applicant: data.applicant,
      group: data.group,
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
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [pendingSwitch, setPendingSwitch] = useState(false);
  const [submissionError, setSubmissionError] = useState<ErrorResponse | null>(null);
  const [enrollmentResult, setEnrollmentResult] = useState<EnrollmentResponse | null>(null);

  const methods = useForm<EnrollmentFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(fullSchema),
    defaultValues: {
      courseId: '',
      enrollmentType: 'personal',
      applicant: { name: '', email: '', phone: '', motivation: '' },
      agreedToTerms: false,
    },
  });

  const { clearPersisted, wasRestored } = useFormPersistence(methods, currentStep, setCurrentStep);

  const handleNextStep = () => {
    const values = methods.getValues();

    const stepSchema: z.ZodType =
      currentStep === 1
        ? step1Schema
        : currentStep === 2
          ? values.enrollmentType === 'group'
            ? step2GroupSchema
            : step2PersonalSchema
          : step3Schema;

    methods.clearErrors();
    const result = stepSchema.safeParse(values);

    if (!result.success) {
      let firstErrorPath: FieldPath<EnrollmentFormValues> | null = null;

      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.') as FieldPath<EnrollmentFormValues>;
        if (path) {
          if (!firstErrorPath) firstErrorPath = path;
          methods.setError(path, { type: 'manual', message: issue.message });
        }
      });

      if (firstErrorPath) methods.setFocus(firstErrorPath);
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

  const goToStep = (step: 1 | 2 | 3) => {
    if (step < currentStep) setCurrentStep(step);
  };

  // Step 3에서 강의 정보만 수정할 때: Step 2를 건너뛰고 Step 1 → Step 3으로 이동
  const startCourseEdit = () => {
    setIsEditingCourse(true);
    setCurrentStep(1);
  };

  const hasGroupData = (): boolean => {
    const group = methods.getValues('group');
    return !!(group?.organizationName || group?.participants?.some((p) => p.name || p.email));
  };

  const handleEnrollmentTypeChange = (newType: EnrollmentType) => {
    const currentType = methods.getValues('enrollmentType');
    if (currentType === 'group' && newType === 'personal' && hasGroupData()) {
      setPendingSwitch(true);
      return;
    }
    methods.setValue('enrollmentType', newType);
  };

  const confirmSwitch = () => {
    methods.setValue('enrollmentType', 'personal');
    methods.unregister('group');
    methods.resetField('group');
    setPendingSwitch(false);
  };

  const cancelSwitch = () => setPendingSwitch(false);

  const mutation = useMutation({
    mutationFn: submitEnrollment,
    onSuccess: (data) => {
      setEnrollmentResult(data);
    },
    onError: (error: ErrorResponse) => {
      if (error.code === 'INVALID_INPUT' && error.details) {
        Object.entries(error.details).forEach(([field, message]) => {
          methods.setError(field as FieldPath<EnrollmentFormValues>, { message });
        });
      } else {
        setSubmissionError(error);
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
    clearPersisted();
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
    handleSubmit,
    handleReset,
    isPending: mutation.isPending,
    submissionError,
    enrollmentResult,
    wasRestored,
  };
}
