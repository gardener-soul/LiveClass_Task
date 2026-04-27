import { CheckIcon } from 'lucide-react';

import type { EnrollmentResponse } from '@/types/enrollment';
import { Button } from '@/components/ui/button';

interface SuccessScreenProps {
  result: EnrollmentResponse;
  onReset: () => void;
}

export function SuccessScreen({ result, onReset }: SuccessScreenProps) {
  const enrolledAt = new Date(result.enrolledAt).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50 px-4">
      <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-primary animate-scale-in">
        <CheckIcon className="size-10 text-primary-foreground" strokeWidth={2.5} />
      </div>

      <div className="text-center animate-fade-up-delay-200">
        <h2 className="text-2xl font-bold mb-2">수강 신청이 완료되었습니다!</h2>
        <p className="text-sm text-muted-foreground mb-6">
          신청 번호: <span className="font-mono font-semibold">{result.enrollmentId}</span>
        </p>
      </div>

      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 flex flex-col gap-2 mb-8 animate-fade-up-delay-350">
        <div className="flex gap-2 text-sm">
          <span className="text-muted-foreground w-20 shrink-0">신청 상태</span>
          <span className="font-medium">
            {result.status === 'confirmed' ? '확정' : '대기 중'}
          </span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="text-muted-foreground w-20 shrink-0">신청 일시</span>
          <span className="font-medium">{enrolledAt}</span>
        </div>
      </div>

      <div className="animate-fade-up-delay-500">
        <Button type="button" size="lg" onClick={onReset}>
          처음으로 돌아가기
        </Button>
      </div>
    </div>
  );
}
