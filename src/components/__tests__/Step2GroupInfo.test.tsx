import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { useForm, FormProvider } from 'react-hook-form'
import { renderWithProviders } from '@/test-utils'
import { Step2GroupInfo } from '@/components/enrollment/Step2GroupInfo'
import type { EnrollmentFormValues } from '@/hooks/useEnrollmentForm'

function Wrapper({ headCount = 0 }: { headCount?: number } = {}) {
  const methods = useForm<EnrollmentFormValues>({
    defaultValues: {
      courseId: 'course-dev-01',
      enrollmentType: 'group',
      applicant: { name: '', email: '', phone: '', motivation: '' },
      group: {
        organizationName: '',
        headCount,
        participants: [],
        contactPerson: '',
      },
      agreedToTerms: false,
    },
  })
  return (
    <FormProvider {...methods}>
      <Step2GroupInfo />
    </FormProvider>
  )
}

describe('Step2GroupInfo', () => {
  it('headCount 3이면 참가자 필드가 3행 렌더링된다', async () => {
    renderWithProviders(<Wrapper headCount={3} />)

    await waitFor(() => {
      const nameInputs = screen.getAllByPlaceholderText('이름')
      expect(nameInputs).toHaveLength(3)
    })
  })

  it('headCount 0이면 참가자 명단 섹션이 렌더링되지 않는다', () => {
    renderWithProviders(<Wrapper headCount={0} />)

    expect(screen.queryByText('참가자 명단')).not.toBeInTheDocument()
  })
})
