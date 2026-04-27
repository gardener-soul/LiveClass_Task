import { useState } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { useFormPersistence } from '@/hooks/useFormPersistence'
import type { EnrollmentFormValues } from '@/hooks/useEnrollmentForm'

const STORAGE_KEY = 'enrollment-form-draft'

function renderPersistenceHook() {
  return renderHook(() => {
    const methods = useForm<EnrollmentFormValues>({
      defaultValues: {
        courseId: '',
        enrollmentType: 'personal',
        applicant: { name: '', email: '', phone: '', motivation: '' },
        agreedToTerms: false,
      },
    })
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
    const persistence = useFormPersistence(methods, currentStep, setCurrentStep)
    return { methods, currentStep, setCurrentStep, ...persistence }
  })
}

describe('useFormPersistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('폼 값 변경 시 debounce 후 localStorage에 저장된다', async () => {
    vi.useFakeTimers()

    try {
      const { result } = renderPersistenceHook()
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

      act(() => {
        result.current.methods.setValue('courseId', 'course-dev-01')
      })

      expect(setItemSpy).not.toHaveBeenCalledWith(STORAGE_KEY, expect.any(String))

      await act(async () => {
        vi.advanceTimersByTime(600)
      })

      expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY, expect.any(String))
    } finally {
      vi.clearAllTimers()
      vi.useRealTimers()
    }
  })

  it('유효한 draft가 있으면 폼 값을 복구하고 wasRestored: true를 반환한다', () => {
    const draft = {
      formValues: { courseId: 'course-dev-01', enrollmentType: 'personal' },
      currentStep: 2,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))

    const { result } = renderPersistenceHook()

    expect(result.current.wasRestored).toBe(true)
    expect(result.current.methods.getValues('courseId')).toBe('course-dev-01')
  })

  it('24시간 초과된 draft는 복구하지 않고 removeItem을 호출한다', () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
    const expiredDate = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    const draft = {
      formValues: { courseId: 'course-dev-01' },
      currentStep: 1,
      savedAt: expiredDate,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))

    const { result } = renderPersistenceHook()

    expect(result.current.wasRestored).toBe(false)
    expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEY)
  })

  it('손상된 JSON draft는 에러 없이 무시하고 removeItem을 호출한다', () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
    localStorage.setItem(STORAGE_KEY, '{invalid json}')

    const { result } = renderPersistenceHook()

    expect(result.current.wasRestored).toBe(false)
    expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEY)
  })

  it('clearPersisted 호출 시 localStorage.removeItem(STORAGE_KEY)을 호출한다', () => {
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem')
    const { result } = renderPersistenceHook()

    act(() => {
      result.current.clearPersisted()
    })

    expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEY)
  })

  it('복구 시 agreedToTerms는 항상 false로 초기화된다', () => {
    const draft = {
      formValues: { courseId: 'course-dev-01', enrollmentType: 'personal' },
      currentStep: 3,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))

    const { result } = renderPersistenceHook()

    expect(result.current.methods.getValues('agreedToTerms')).toBe(false)
  })
})
