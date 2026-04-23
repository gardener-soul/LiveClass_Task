interface Step2PersonalInfoProps {
  onNext: () => void;
  onPrev: () => void;
}

export function Step2PersonalInfo(_props: Step2PersonalInfoProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <p className="text-sm text-muted-foreground">Step 2 — 신청 정보 입력 (Phase 3에서 구현)</p>
    </div>
  );
}
