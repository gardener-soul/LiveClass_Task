import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider } from 'react-hook-form'
import { renderWithProviders } from '@/test-utils'
import { Step3Confirm } from '@/components/enrollment/Step3Confirm'
import { useCourses } from '@/hooks/useCourses'
import type { EnrollmentFormValues } from '@/hooks/useEnrollmentForm'
import type { ErrorResponse } from '@/types/enrollment'

vi.mock('@/hooks/useCourses', () => ({
  useCourses: vi.fn(),
}))

const mockUseCourses = vi.mocked(useCourses)

const MOCK_COURSE = {
  id: 'course-dev-01',
  title: 'React 19 완전 정복',
  instructor: '김철수',
  category: 'development' as const,
  price: 120000,
  maxCapacity: 25,
  currentEnrollment: 18,
  startDate: '2026-06-01',
  endDate: '2026-07-31',
  description: '설명',
}

interface WrapperProps {
  agreedToTerms?: boolean
  isPending?: boolean
  submissionError?: ErrorResponse | null
  enrollmentType?: 'personal' | 'group'
  onPrev?: () => void
  onSubmit?: () => Promise<void>
  goToStep?: (step: 1 | 2 | 3) => void
  onEditCourse?: () => void
}

function Wrapper({
  agreedToTerms = false,
  isPending = false,
  submissionError = null,
  enrollmentType = 'personal',
  onPrev = vi.fn(),
  onSubmit = vi.fn().mockResolvedValue(undefined),
  goToStep = vi.fn(),
  onEditCourse = vi.fn(),
}: WrapperProps = {}) {
  const methods = useForm<EnrollmentFormValues>({
    defaultValues: {
      courseId: 'course-dev-01',
      enrollmentType,
      applicant: {
        name: '홍길동',
        email: 'test@example.com',
        phone: '010-1234-5678',
      },
      agreedToTerms,
    },
  })
  return (
    <FormProvider {...methods}>
      <Step3Confirm
        onPrev={onPrev}
        onSubmit={onSubmit}
        goToStep={goToStep}
        onEditCourse={onEditCourse}
        isPending={isPending}
        submissionError={submissionError}
      />
    </FormProvider>
  )
}

describe('Step3Confirm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCourses.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { courses: [MOCK_COURSE], categories: ['development'] },
      refetch: vi.fn(),
    } as ReturnType<typeof useCourses>)
  })

  it('강의 정보 요약(강의명, 강사, 수강 기간, 수강료)을 표시한다', () => {
    renderWithProviders(<Wrapper />)

    expect(screen.getByText('React 19 완전 정복')).toBeInTheDocument()
    expect(screen.getByText('김철수')).toBeInTheDocument()
    expect(screen.getByText('120,000원')).toBeInTheDocument()
  })

  it('신청자 정보(이름, 이메일, 전화번호)를 표시한다', () => {
    renderWithProviders(<Wrapper />)

    expect(screen.getByText('홍길동')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
    expect(screen.getByText('010-1234-5678')).toBeInTheDocument()
  })

  it('이용약관 미동의 시 "신청하기" 버튼이 disabled이다', () => {
    renderWithProviders(<Wrapper agreedToTerms={false} />)

    const submitBtn = screen.getByRole('button', { name: '신청하기' })
    expect(submitBtn).toBeDisabled()
  })

  it('이용약관 동의 후 "신청하기" 버튼이 활성화된다', () => {
    renderWithProviders(<Wrapper agreedToTerms={true} />)

    const submitBtn = screen.getByRole('button', { name: '신청하기' })
    expect(submitBtn).not.toBeDisabled()
  })

  it('강의 "수정" 클릭 시 onEditCourse가 호출된다', async () => {
    const user = userEvent.setup()
    const onEditCourse = vi.fn()
    renderWithProviders(<Wrapper onEditCourse={onEditCourse} />)

    const editButtons = screen.getAllByRole('button', { name: '수정' })
    await user.click(editButtons[0])

    expect(onEditCourse).toHaveBeenCalled()
  })

  it('신청자 정보 "수정" 클릭 시 goToStep(2)가 호출된다', async () => {
    const user = userEvent.setup()
    const goToStep = vi.fn()
    renderWithProviders(<Wrapper goToStep={goToStep} />)

    const editButtons = screen.getAllByRole('button', { name: '수정' })
    await user.click(editButtons[1])

    expect(goToStep).toHaveBeenCalledWith(2)
  })

  it('COURSE_FULL 에러 props 시 에러 메시지와 "강의 다시 선택" 버튼이 표시된다', () => {
    renderWithProviders(
      <Wrapper submissionError={{ code: 'COURSE_FULL', message: '정원 마감' }} />
    )

    expect(screen.getByText('선택하신 강의의 정원이 마감되었습니다.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '강의 다시 선택' })).toBeInTheDocument()
  })

  it('isPending: true 시 "신청하기" 버튼이 disabled이다', () => {
    renderWithProviders(<Wrapper isPending={true} agreedToTerms={true} />)

    const submitBtn = screen.getByRole('button', { name: /신청하기/ })
    expect(submitBtn).toBeDisabled()
  })
})
