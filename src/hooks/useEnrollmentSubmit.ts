import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { UseFormReturn, FieldPath } from 'react-hook-form';
import { submitEnrollment } from '@/api/enrollments';
import type { EnrollmentFormValues } from '@/schemas/enrollment.schema';
import type { EnrollmentRequest, EnrollmentResponse, ErrorResponse } from '@/types/enrollment';

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

export function useEnrollmentSubmit(methods: UseFormReturn<EnrollmentFormValues>) {
  const [submissionError, setSubmissionError] = useState<ErrorResponse | null>(null);
  const [enrollmentResult, setEnrollmentResult] = useState<EnrollmentResponse | null>(null);

  const mutation = useMutation<EnrollmentResponse, ErrorResponse, EnrollmentRequest>({
    mutationFn: submitEnrollment,
    onSuccess: (data) => {
      setEnrollmentResult(data);
    },
    onError: (error) => {
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

  return {
    submissionError,
    enrollmentResult,
    handleSubmit,
    isPending: mutation.isPending,
    resetSubmit: () => {
      setEnrollmentResult(null);
      setSubmissionError(null);
    },
  };
}
