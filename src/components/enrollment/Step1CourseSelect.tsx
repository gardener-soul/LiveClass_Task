import type { EnrollmentType } from '@/types/enrollment';

interface Step1CourseSelectProps {
  onEnrollmentTypeChange: (type: EnrollmentType) => void;
  onNext: () => void;
}

export function Step1CourseSelect(_props: Step1CourseSelectProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <p className="text-sm text-muted-foreground">Step 1 — 강의 선택 (Phase 3에서 구현)</p>
    </div>
  );
}
