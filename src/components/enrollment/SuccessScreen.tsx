import type { EnrollmentResponse } from '@/types/enrollment';

interface SuccessScreenProps {
  result: EnrollmentResponse;
}

export function SuccessScreen(_props: SuccessScreenProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">수강 신청 완료 (Phase 3에서 구현)</p>
      </div>
    </div>
  );
}
