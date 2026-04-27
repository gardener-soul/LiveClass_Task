import { useState } from 'react';
import { z } from 'zod';
import type { UseFormReturn, FieldPath } from 'react-hook-form';
import type { EnrollmentFormValues } from '@/schemas/enrollment.schema';
import { step1Schema } from '@/schemas/step1.schema';
import { step2PersonalSchema, createStep2GroupSchema } from '@/schemas/step2.schema';
import { step3Schema } from '@/schemas/step3.schema';
import { useCourses } from '@/hooks/useCourses';

export function useStepNavigation(
  methods: UseFormReturn<EnrollmentFormValues>,
  initialStep: 1 | 2 | 3,
) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(initialStep);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [pendingBack, setPendingBack] = useState(false);

  const { data: coursesData } = useCourses();

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

  const handlePrevStep = () => setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);

  const requestBack = () => setPendingBack(true);
  const confirmBack = () => { setPendingBack(false); setCurrentStep(1); };
  const cancelBack = () => setPendingBack(false);

  const goToStep = (step: 1 | 2 | 3) => {
    if (step < currentStep) setCurrentStep(step);
  };

  // Step 3에서 강의 정보만 수정할 때: Step 2를 건너뛰고 Step 1 → Step 3으로 이동
  const startCourseEdit = () => { setIsEditingCourse(true); setCurrentStep(1); };

  return {
    currentStep,
    isEditingCourse,
    pendingBack,
    handleNextStep,
    handlePrevStep,
    requestBack,
    confirmBack,
    cancelBack,
    goToStep,
    startCourseEdit,
    resetStep: () => setCurrentStep(1),
  };
}
