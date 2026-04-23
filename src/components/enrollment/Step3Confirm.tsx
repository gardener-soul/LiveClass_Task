import type { ErrorResponse } from '@/types/enrollment';
import type React from 'react';

interface Step3ConfirmProps {
  onPrev: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isPending: boolean;
  submissionError: ErrorResponse | null;
}

export function Step3Confirm(_props: Step3ConfirmProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <p className="text-sm text-muted-foreground">Step 3 — 최종 확인 및 제출 (Phase 3에서 구현)</p>
    </div>
  );
}
