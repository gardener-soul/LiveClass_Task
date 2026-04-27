import { useEffect } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { useForm, FormProvider } from 'react-hook-form'
import { renderWithProviders } from '@/test-utils'
import { Step1CourseSelect } from '@/components/enrollment/Step1CourseSelect'
import { useCourses } from '@/hooks/useCourses'
import type { EnrollmentFormValues } from '@/hooks/useEnrollmentForm'

vi.mock('@/hooks/useCourses', () => ({
  useCourses: vi.fn(),
}))

const mockUseCourses = vi.mocked(useCourses)

const MOCK_COURSES = [
  {
    id: 'course-dev-01',
    title: 'React 19 완전 정복',
    instructor: '김철수',
    category: 'development',
    price: 120000,
    maxCapacity: 25,
    currentEnrollment: 18,
    startDate: '2026-06-01',
    endDate: '2026-07-31',
    description: '설명',
  },
  {
    id: 'course-dev-02',
    title: 'TypeScript 심화',
    instructor: '이영희',
    category: 'development',
    price: 95000,
    maxCapacity: 20,
    currentEnrollment: 19,
    startDate: '2026-06-15',
    endDate: '2026-08-15',
    description: '설명',
  },
  {
    id: 'course-dev-03',
    title: 'NestJS 백엔드 개발',
    instructor: '박민준',
    category: 'development',
    price: 110000,
    maxCapacity: 20,
    currentEnrollment: 20,
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    description: '설명',
  },
]

function WrapperWithError() {
  const methods = useForm<EnrollmentFormValues>({
    defaultValues: {
      courseId: '',
      enrollmentType: 'personal',
      applicant: { name: '', email: '', phone: '', motivation: '' },
      agreedToTerms: false,
    },
  })
  useEffect(() => {
    methods.setError('courseId', { message: '강의를 선택해주세요' })
  }, [])
  return (
    <FormProvider {...methods}>
      <Step1CourseSelect onNext={vi.fn()} onEnrollmentTypeChange={vi.fn()} />
    </FormProvider>
  )
}

function Wrapper({ onNext = vi.fn(), onEnrollmentTypeChange = vi.fn() } = {}) {
  const methods = useForm<EnrollmentFormValues>({
    defaultValues: {
      courseId: '',
      enrollmentType: 'personal',
      applicant: { name: '', email: '', phone: '', motivation: '' },
      agreedToTerms: false,
    },
  })
  return (
    <FormProvider {...methods}>
      <Step1CourseSelect onNext={onNext} onEnrollmentTypeChange={onEnrollmentTypeChange} />
    </FormProvider>
  )
}

describe('Step1CourseSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCourses.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { courses: MOCK_COURSES, categories: ['development'] },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCourses>)
  })

  it('로딩 상태일 때 스켈레톤 6개를 렌더링한다', () => {
    mockUseCourses.mockReturnValue({ isLoading: true, isError: false, data: undefined, refetch: vi.fn() } as unknown as ReturnType<typeof useCourses>)

    renderWithProviders(<Wrapper />)

    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons).toHaveLength(6)
  })

  it('에러 상태일 때 에러 메시지와 "다시 시도" 버튼을 렌더링한다', () => {
    mockUseCourses.mockReturnValue({ isLoading: false, isError: true, data: undefined, refetch: vi.fn() } as unknown as ReturnType<typeof useCourses>)

    renderWithProviders(<Wrapper />)

    expect(screen.getByText('강의 목록을 불러오지 못했습니다.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument()
  })

  it('빈 목록일 때 "해당 카테고리에 강의가 없습니다" 텍스트를 표시한다', () => {
    mockUseCourses.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { courses: [], categories: [] },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCourses>)

    renderWithProviders(<Wrapper />)

    expect(screen.getByText('해당 카테고리에 강의가 없습니다.')).toBeInTheDocument()
  })

  it('강의 카드에 제목, 강사명, 가격을 표시한다', () => {
    renderWithProviders(<Wrapper />)

    expect(screen.getByText('React 19 완전 정복')).toBeInTheDocument()
    expect(screen.getByText(/김철수/)).toBeInTheDocument()
    expect(screen.getByText('120,000원')).toBeInTheDocument()
  })

  it('정원 마감 강의에 "정원 마감" 배지를 표시한다', () => {
    renderWithProviders(<Wrapper />)

    expect(screen.getByText('정원 마감')).toBeInTheDocument()
  })

  it('마감 임박 강의(잔여 ≤5)에 "마감 임박" 배지를 표시한다', () => {
    renderWithProviders(<Wrapper />)

    expect(screen.getByText(/마감 임박/)).toBeInTheDocument()
    expect(screen.getByText(/1자리 남음/)).toBeInTheDocument()
  })

  it('courseId 에러 상태일 때 에러 메시지를 표시한다', () => {
    renderWithProviders(<WrapperWithError />)

    expect(screen.getByText('강의를 선택해주세요')).toBeInTheDocument()
  })
})
