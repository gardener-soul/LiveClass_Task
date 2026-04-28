import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useEnrollmentForm } from '@/hooks/useEnrollmentForm';
import { submitEnrollment } from '@/api/enrollments';

vi.mock('@/api/enrollments', () => ({
  submitEnrollment: vi.fn(),
}));

vi.mock('@/api/_utils', () => ({
  delay: vi.fn().mockResolvedValue(undefined),
}));

const mockSubmitEnrollment = vi.mocked(submitEnrollment);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

// formState.errors를 명시적으로 구독해 re-render를 트리거하는 래퍼
function useEnrollmentFormWithErrors() {
  const hook = useEnrollmentForm();
  const _errors = hook.methods.formState.errors;
  return { ...hook, errors: _errors };
}

describe('useEnrollmentForm — 스텝 네비게이션', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('초기 상태는 currentStep: 1, enrollmentType: personal', () => {
    const { result } = renderHook(() => useEnrollmentForm(), {
      wrapper: createWrapper(),
    });
    expect(result.current.currentStep).toBe(1);
    expect(result.current.methods.getValues('enrollmentType')).toBe('personal');
  });

  it('step1 유효 데이터로 handleNextStep 호출 시 step 2로 이동한다', async () => {
    const { result } = renderHook(() => useEnrollmentForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.methods.setValue('courseId', 'course-dev-01');
      result.current.methods.setValue('enrollmentType', 'personal');
    });

    await act(async () => {
      result.current.handleNextStep();
    });

    expect(result.current.currentStep).toBe(2);
  });

  it('courseId 없이 handleNextStep 호출 시 step 유지, courseId 에러 발생', async () => {
    const { result } = renderHook(() => useEnrollmentFormWithErrors(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.handleNextStep();
    });

    expect(result.current.currentStep).toBe(1);
    await waitFor(() => {
      expect(result.current.errors.courseId).toBeDefined();
    });
  });

  it('step2에서 handlePrevStep 호출 시 step 1로 이동한다', async () => {
    const { result } = renderHook(() => useEnrollmentForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.methods.setValue('courseId', 'course-dev-01');
    });
    await act(async () => {
      result.current.handleNextStep();
    });
    expect(result.current.currentStep).toBe(2);

    act(() => {
      result.current.handlePrevStep();
    });
    expect(result.current.currentStep).toBe(1);
  });

  it('goToStep(1) step3에서 호출 시 step 1로 이동한다', async () => {
    const { result } = renderHook(() => useEnrollmentForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.methods.setValue('courseId', 'course-dev-01');
    });
    await act(async () => {
      result.current.handleNextStep();
    });
    act(() => {
      result.current.methods.setValue('applicant.name', '김철수');
      result.current.methods.setValue('applicant.email', 'test@example.com');
      result.current.methods.setValue('applicant.phone', '010-1234-5678');
    });
    await act(async () => {
      result.current.handleNextStep();
    });
    expect(result.current.currentStep).toBe(3);

    act(() => {
      result.current.goToStep(1);
    });
    expect(result.current.currentStep).toBe(1);
  });

  it('goToStep(3) step1에서 호출 시 무시된다 (미래 스텝으로 이동 불가)', () => {
    const { result } = renderHook(() => useEnrollmentForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.goToStep(3);
    });
    expect(result.current.currentStep).toBe(1);
  });
});

describe('useEnrollmentForm — 신청 유형 전환', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('personal → group 전환은 즉시 전환된다', () => {
    const { result } = renderHook(() => useEnrollmentForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleEnrollmentTypeChange('group');
    });
    expect(result.current.methods.getValues('enrollmentType')).toBe('group');
    expect(result.current.pendingSwitch).toBe(false);
  });

  it('group → personal 전환 시 단체 데이터 없으면 즉시 전환된다', () => {
    const { result } = renderHook(() => useEnrollmentForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleEnrollmentTypeChange('group');
      result.current.handleEnrollmentTypeChange('personal');
    });
    expect(result.current.methods.getValues('enrollmentType')).toBe('personal');
    expect(result.current.pendingSwitch).toBe(false);
  });

  it('group → personal 전환 시 단체명 입력돼 있으면 pendingSwitch: true', () => {
    const { result } = renderHook(() => useEnrollmentForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleEnrollmentTypeChange('group');
      result.current.methods.setValue('group.organizationName', '테스트 회사');
      result.current.handleEnrollmentTypeChange('personal');
    });
    expect(result.current.pendingSwitch).toBe(true);
  });

  it('confirmSwitch 호출 시 enrollmentType: personal로 전환, group 초기화', () => {
    const { result } = renderHook(() => useEnrollmentForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleEnrollmentTypeChange('group');
      result.current.methods.setValue('group.organizationName', '테스트 회사');
      result.current.handleEnrollmentTypeChange('personal');
    });
    act(() => {
      result.current.confirmSwitch();
    });
    expect(result.current.methods.getValues('enrollmentType')).toBe('personal');
    expect(result.current.pendingSwitch).toBe(false);
  });

  it('cancelSwitch 호출 시 enrollmentType: group 유지', () => {
    const { result } = renderHook(() => useEnrollmentForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleEnrollmentTypeChange('group');
      result.current.methods.setValue('group.organizationName', '테스트 회사');
      result.current.handleEnrollmentTypeChange('personal');
    });
    act(() => {
      result.current.cancelSwitch();
    });
    expect(result.current.methods.getValues('enrollmentType')).toBe('group');
    expect(result.current.pendingSwitch).toBe(false);
  });

  it('forcePersonal 호출 시 enrollmentType이 personal로 즉시 전환된다', () => {
    const { result } = renderHook(() => useEnrollmentForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleEnrollmentTypeChange('group');
    });
    expect(result.current.methods.getValues('enrollmentType')).toBe('group');

    act(() => {
      result.current.forcePersonal();
    });
    expect(result.current.methods.getValues('enrollmentType')).toBe('personal');
    expect(result.current.pendingSwitch).toBe(false);
  });

  it('forcePersonal 호출 시 group 데이터가 있어도 확인 없이 초기화된다', () => {
    const { result } = renderHook(() => useEnrollmentForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.handleEnrollmentTypeChange('group');
      result.current.methods.setValue('group.organizationName', '테스트 회사');
    });

    act(() => {
      result.current.forcePersonal();
    });

    expect(result.current.methods.getValues('enrollmentType')).toBe('personal');
    expect(result.current.methods.getValues('group')).toBeUndefined();
    expect(result.current.pendingSwitch).toBe(false);
  });
});

describe('useEnrollmentForm — 제출', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  function fillAllSteps(result: ReturnType<typeof useEnrollmentForm>) {
    result.methods.setValue('courseId', 'course-dev-01');
    result.methods.setValue('enrollmentType', 'personal');
    result.methods.setValue('applicant.name', '김철수');
    result.methods.setValue('applicant.email', 'test@example.com');
    result.methods.setValue('applicant.phone', '010-1234-5678');
    result.methods.setValue('agreedToTerms', true);
  }

  it('성공 제출 시 enrollmentResult에 enrollmentId가 설정된다', async () => {
    mockSubmitEnrollment.mockResolvedValueOnce({
      enrollmentId: 'ENR-12345',
      status: 'confirmed',
      enrolledAt: new Date().toISOString(),
    });

    const { result } = renderHook(() => useEnrollmentForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      fillAllSteps(result.current);
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    await waitFor(() => {
      expect(result.current.enrollmentResult?.enrollmentId).toBe('ENR-12345');
    });
  });

  it('COURSE_FULL 에러 시 submissionError.code가 COURSE_FULL', async () => {
    mockSubmitEnrollment.mockRejectedValueOnce({
      code: 'COURSE_FULL',
      message: '정원 마감',
    });

    const { result } = renderHook(() => useEnrollmentForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      fillAllSteps(result.current);
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    await waitFor(() => {
      expect(result.current.submissionError?.code).toBe('COURSE_FULL');
    });
  });

  it('DUPLICATE_ENROLLMENT 에러 시 submissionError.code가 DUPLICATE_ENROLLMENT', async () => {
    mockSubmitEnrollment.mockRejectedValueOnce({
      code: 'DUPLICATE_ENROLLMENT',
      message: '중복 신청',
    });

    const { result } = renderHook(() => useEnrollmentForm(), {
      wrapper: createWrapper(),
    });

    act(() => {
      fillAllSteps(result.current);
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    await waitFor(() => {
      expect(result.current.submissionError?.code).toBe('DUPLICATE_ENROLLMENT');
    });
  });

  it('INVALID_INPUT 에러 시 해당 필드에 formState.errors가 설정된다', async () => {
    mockSubmitEnrollment.mockRejectedValueOnce({
      code: 'INVALID_INPUT',
      message: '잘못된 입력',
      details: { 'applicant.name': '허용되지 않는 이름입니다' },
    });

    const { result } = renderHook(() => useEnrollmentFormWithErrors(), {
      wrapper: createWrapper(),
    });

    act(() => {
      fillAllSteps(result.current);
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent);
    });

    await waitFor(() => {
      expect(result.current.errors.applicant?.name).toBeDefined();
    });
  });
});
