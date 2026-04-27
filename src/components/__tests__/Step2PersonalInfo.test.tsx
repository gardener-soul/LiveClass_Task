import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, FormProvider } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { renderWithProviders } from '@/test-utils'
import { Step2PersonalInfo } from '@/components/enrollment/Step2PersonalInfo'
import type { EnrollmentFormValues } from '@/hooks/useEnrollmentForm'
import { step2PersonalSchema } from '@/schemas/step2.schema'

function Wrapper({
  enrollmentType = 'personal' as 'personal' | 'group',
  onNext = vi.fn(),
  onPrev = vi.fn(),
} = {}) {
  const methods = useForm<EnrollmentFormValues>({
    mode: 'onBlur',
    resolver: zodResolver(step2PersonalSchema) as unknown as Resolver<EnrollmentFormValues>,
    defaultValues: {
      courseId: 'course-dev-01',
      enrollmentType,
      applicant: { name: '', email: '', phone: '', motivation: '' },
      agreedToTerms: false,
    },
  })
  return (
    <FormProvider {...methods}>
      <Step2PersonalInfo onNext={onNext} onPrev={onPrev} />
    </FormProvider>
  )
}

describe('Step2PersonalInfo', () => {
  it('이름, 이메일, 전화번호 input이 존재한다', () => {
    renderWithProviders(<Wrapper />)

    expect(screen.getByPlaceholderText('홍길동')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('hong@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('010-1234-5678')).toBeInTheDocument()
  })

  it('수강 동기 textarea가 존재한다', () => {
    renderWithProviders(<Wrapper />)

    expect(screen.getByPlaceholderText(/수강 신청 동기/)).toBeInTheDocument()
  })

  it('이름 1자 입력 후 blur 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Wrapper />)

    const nameInput = screen.getByPlaceholderText('홍길동')
    await user.type(nameInput, '김')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText(/2자 이상/)).toBeInTheDocument()
    })
  })

  it('이메일 형식 오류 후 blur 시 에러 메시지를 표시한다', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Wrapper />)

    const emailInput = screen.getByPlaceholderText('hong@example.com')
    await user.type(emailInput, 'invalid-email')
    await user.tab()

    await waitFor(() => {
      expect(screen.getByText('올바른 이메일 형식을 입력해주세요')).toBeInTheDocument()
    })
  })

  it('전화번호 입력 시 자동으로 하이픈 포맷으로 변환된다', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Wrapper />)

    const phoneInput = screen.getByPlaceholderText('010-1234-5678')
    await user.type(phoneInput, '01012345678')

    await waitFor(() => {
      expect((phoneInput as HTMLInputElement).value).toBe('010-1234-5678')
    })
  })

  it('단체 신청 시 단체 정보 섹션이 렌더링된다', () => {
    renderWithProviders(<Wrapper enrollmentType="group" />)

    expect(screen.getByText('단체 정보')).toBeInTheDocument()
  })
})
