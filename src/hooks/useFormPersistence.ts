import { useEffect, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { EnrollmentFormValues } from '@/hooks/useEnrollmentForm';

const STORAGE_KEY = 'enrollment-form-draft';
const DEBOUNCE_MS = 500;
const EXPIRY_MS = 24 * 60 * 60 * 1000;

interface PersistedState {
  formValues: Partial<Omit<EnrollmentFormValues, 'agreedToTerms'>>;
  currentStep: 1 | 2 | 3;
  savedAt: string;
}

function isPersistedState(value: unknown): value is PersistedState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.currentStep === 'number' &&
    [1, 2, 3].includes(v.currentStep as number) &&
    typeof v.savedAt === 'string' &&
    typeof v.formValues === 'object' &&
    v.formValues !== null
  );
}

export function useFormPersistence(
  methods: UseFormReturn<EnrollmentFormValues>,
  currentStep: 1 | 2 | 3,
  setCurrentStep: Dispatch<SetStateAction<1 | 2 | 3>>,
) {
  const [wasRestored, setWasRestored] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentStepRef = useRef(currentStep);
  currentStepRef.current = currentStep;

  // 마운트 시 1회만 실행
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!isPersistedState(parsed)) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      const age = Date.now() - new Date(parsed.savedAt).getTime();
      if (age > EXPIRY_MS) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      methods.reset({
        ...methods.getValues(),
        ...(parsed.formValues as Partial<EnrollmentFormValues>),
        agreedToTerms: false,
      });
      setCurrentStep(parsed.currentStep);
      setWasRestored(true);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const subscription = methods.watch((values) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const { agreedToTerms: _omit, ...rest } = values as EnrollmentFormValues;
        const state: PersistedState = {
          formValues: rest,
          currentStep: currentStepRef.current,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }, DEBOUNCE_MS);
    });
    return () => {
      subscription.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [methods]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (localStorage.getItem(STORAGE_KEY)) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const clearPersisted = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return { clearPersisted, wasRestored };
}
