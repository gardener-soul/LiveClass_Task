import { FormProvider } from 'react-hook-form';
import { useEnrollmentForm } from '@/hooks/useEnrollmentForm';
import { StepIndicator } from '@/components/common/StepIndicator';
import { Step1CourseSelect } from '@/components/enrollment/Step1CourseSelect';
import { Step2PersonalInfo } from '@/components/enrollment/Step2PersonalInfo';
import { Step3Confirm } from '@/components/enrollment/Step3Confirm';
import { SuccessScreen } from '@/components/enrollment/SuccessScreen';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => onCancel()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>취소</Button>
          <Button variant="destructive" onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EnrollmentPage() {
  const {
    methods,
    currentStep,
    isEditingCourse,
    handleNextStep,
    handlePrevStep,
    goToStep,
    startCourseEdit,
    handleEnrollmentTypeChange,
    pendingSwitch,
    confirmSwitch,
    cancelSwitch,
    pendingBack,
    requestBack,
    confirmBack,
    cancelBack,
    handleSubmit,
    handleReset,
    isPending,
    submissionError,
    enrollmentResult,
  } = useEnrollmentForm();

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gray-50">
        <StepIndicator currentStep={currentStep} onStepClick={goToStep} />

        <main className="mx-auto max-w-2xl px-4 py-8">
          {currentStep === 1 && (
            <Step1CourseSelect
              onEnrollmentTypeChange={handleEnrollmentTypeChange}
              onNext={handleNextStep}
              isEditingCourse={isEditingCourse}
            />
          )}
          {currentStep === 2 && (
            <Step2PersonalInfo onNext={handleNextStep} onPrev={requestBack} />
          )}
          {currentStep === 3 && (
            <Step3Confirm
              onPrev={handlePrevStep}
              onSubmit={handleSubmit}
              goToStep={goToStep}
              onEditCourse={startCourseEdit}
              isPending={isPending}
              submissionError={submissionError}
            />
          )}
        </main>

        <ConfirmDialog
          open={pendingSwitch}
          title="신청 유형을 변경하시겠습니까?"
          description="입력된 단체 신청 정보가 모두 삭제됩니다."
          confirmLabel="변경"
          onConfirm={confirmSwitch}
          onCancel={cancelSwitch}
        />
        <ConfirmDialog
          open={pendingBack}
          title="이전 단계로 이동하시겠습니까?"
          description="입력된 신청자 정보가 저장되지 않을 수 있습니다."
          confirmLabel="이동"
          onConfirm={confirmBack}
          onCancel={cancelBack}
        />
      </div>

      {enrollmentResult && (
        <SuccessScreen result={enrollmentResult} onReset={handleReset} />
      )}
    </FormProvider>
  );
}
