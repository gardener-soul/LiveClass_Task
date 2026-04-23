import { cn } from '@/lib/utils';

const STEPS = [
  { step: 1 as const, label: '강의 선택' },
  { step: 2 as const, label: '신청 정보' },
  { step: 3 as const, label: '최종 확인' },
];

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
  onStepClick: (step: 1 | 2 | 3) => void;
}

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <nav className="flex items-center justify-center gap-4 py-6">
      {STEPS.map(({ step, label }, index) => (
        <div key={step} className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onStepClick(step)}
            disabled={step >= currentStep}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
              step === currentStep
                ? 'bg-primary text-primary-foreground'
                : step < currentStep
                  ? 'cursor-pointer bg-primary/20 text-primary hover:bg-primary/30'
                  : 'bg-muted text-muted-foreground',
            )}
          >
            {step}
          </button>
          <span
            className={cn(
              'text-sm',
              step === currentStep ? 'font-medium text-foreground' : 'text-muted-foreground',
            )}
          >
            {label}
          </span>
          {index < STEPS.length - 1 && <div className="h-px w-8 bg-border" />}
        </div>
      ))}
    </nav>
  );
}
