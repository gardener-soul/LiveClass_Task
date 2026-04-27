import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test-utils'
import { EnrollmentPage } from '@/pages/EnrollmentPage'
import { fetchCourses } from '@/api/courses'
import { submitEnrollment } from '@/api/enrollments'

vi.mock('@/api/courses', () => ({
  fetchCourses: vi.fn(),
}))
vi.mock('@/api/enrollments', () => ({
  submitEnrollment: vi.fn(),
}))
vi.mock('@/api/_utils', () => ({
  delay: vi.fn().mockResolvedValue(undefined),
}))

const mockFetchCourses = vi.mocked(fetchCourses)
const mockSubmitEnrollment = vi.mocked(submitEnrollment)

const MOCK_COURSES = [
  {
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
  },
  {
    id: 'course-dev-03',
    title: 'NestJS 백엔드 개발',
    instructor: '박민준',
    category: 'development' as const,
    price: 110000,
    maxCapacity: 20,
    currentEnrollment: 20,
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    description: '설명',
  },
]

describe('EnrollmentPage 통합 테스트', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockFetchCourses.mockResolvedValue({
      courses: MOCK_COURSES,
      categories: ['development'],
    })
  })

  it('초기 렌더링 시 Step1이 표시된다', async () => {
    renderWithProviders(<EnrollmentPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '강의 선택' })).toBeInTheDocument()
    })
  })

  it('step1에서 강의 선택 후 "다음" 클릭 시 Step2가 렌더링된다', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EnrollmentPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '강의 선택' })).toBeInTheDocument()
      expect(screen.getByText('React 19 완전 정복')).toBeInTheDocument()
    })

    await user.click(screen.getByText('React 19 완전 정복'))
    await user.click(screen.getByRole('button', { name: /다음/ }))

    await waitFor(() => {
      expect(screen.getByText('신청 정보 입력')).toBeInTheDocument()
    })
  })

  it('step2에서 "이전" 클릭 시 Step1으로 돌아온다', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EnrollmentPage />)

    await waitFor(() => {
      expect(screen.getByText('React 19 완전 정복')).toBeInTheDocument()
    })

    await user.click(screen.getByText('React 19 완전 정복'))
    await user.click(screen.getByRole('button', { name: /다음/ }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '신청 정보 입력' })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /이전/ }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '강의 선택' })).toBeInTheDocument()
    })
  })

  it('전체 정상 제출 플로우 시 SuccessScreen이 렌더링된다', async () => {
    const user = userEvent.setup()
    mockSubmitEnrollment.mockResolvedValueOnce({
      enrollmentId: 'ENR-12345',
      status: 'confirmed',
      enrolledAt: new Date().toISOString(),
    })

    renderWithProviders(<EnrollmentPage />)

    // Step1: 강의 선택
    await waitFor(() => {
      expect(screen.getByText('React 19 완전 정복')).toBeInTheDocument()
    })
    await user.click(screen.getByText('React 19 완전 정복'))
    await user.click(screen.getByRole('button', { name: /다음/ }))

    // Step2: 개인 정보 입력
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '신청 정보 입력' })).toBeInTheDocument()
    })
    await user.type(screen.getByPlaceholderText('홍길동'), '김철수')
    await user.type(screen.getByPlaceholderText('hong@example.com'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('010-1234-5678'), '01012345678')
    await user.click(screen.getByRole('button', { name: /다음/ }))

    // Step3: 이용약관 동의 후 제출
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '최종 확인' })).toBeInTheDocument()
    })
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    await user.click(screen.getByRole('button', { name: '신청하기' }))

    // SuccessScreen 확인
    await waitFor(() => {
      expect(screen.getByText('ENR-12345')).toBeInTheDocument()
    })
  })

  it('group → personal 전환 확인 다이얼로그에서 "취소" 클릭 시 group 유지', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EnrollmentPage />)

    await waitFor(() => {
      expect(screen.getByText('React 19 완전 정복')).toBeInTheDocument()
    })

    // 단체 신청으로 전환
    await user.click(screen.getByRole('radio', { name: '단체 신청' }))

    // 단체명 입력 후 개인 신청으로 전환 시도
    await user.click(screen.getByText('React 19 완전 정복'))
    await user.click(screen.getByRole('button', { name: /다음/ }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '신청 정보 입력' })).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('(주)라이브클래스'), '테스트 회사')

    // 이전으로 돌아가서 개인으로 전환
    await user.click(screen.getByRole('button', { name: /이전/ }))
    await user.click(screen.getByRole('radio', { name: '개인 신청' }))

    // 다이얼로그 표시 확인
    await waitFor(() => {
      expect(screen.getByText('신청 유형을 변경하시겠습니까?')).toBeInTheDocument()
    })

    // "취소" 클릭
    await user.click(screen.getByRole('button', { name: '취소' }))

    expect(screen.queryByText('신청 유형을 변경하시겠습니까?')).not.toBeInTheDocument()
  })

  it('localStorage 복구 시 배너가 표시된다', async () => {
    const draft = {
      formValues: { courseId: 'course-dev-01', enrollmentType: 'personal' },
      currentStep: 2,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem('enrollment-form-draft', JSON.stringify(draft))

    renderWithProviders(<EnrollmentPage />)

    await waitFor(() => {
      expect(screen.getByText('이전에 작성하던 내용을 불러왔습니다.')).toBeInTheDocument()
    })
  })
})
