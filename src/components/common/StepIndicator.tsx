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
    <nav className="flex items-center justify-center py-6">
      {STEPS.map(({ step, label }, index) => (
        <div key={step} className="flex items-center">
          {/* 모바일: 원 위 + 라벨 아래, 데스크탑: 원 옆에 라벨 */}
          <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
            <button
              type="button"
              onClick={() => onStepClick(step)}
              disabled={step >= currentStep}
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium',
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
                'text-xs sm:text-sm',
                step === currentStep ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div className="mx-2 h-px w-6 shrink-0 bg-border sm:mx-4 sm:w-8" />
          )}
        </div>
      ))}
    </nav>
  );
}
