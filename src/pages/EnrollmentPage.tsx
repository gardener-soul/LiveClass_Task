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

export function EnrollmentPage() {
  const {
    methods,
    currentStep,
    handleNextStep,
    handlePrevStep,
    goToStep,
    handleEnrollmentTypeChange,
    pendingSwitch,
    confirmSwitch,
    cancelSwitch,
    handleSubmit,
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
            />
          )}
          {currentStep === 2 && (
            <Step2PersonalInfo onNext={handleNextStep} onPrev={handlePrevStep} />
          )}
          {currentStep === 3 && (
            <Step3Confirm
              onPrev={handlePrevStep}
              onSubmit={handleSubmit}
              isPending={isPending}
              submissionError={submissionError}
            />
          )}
        </main>

        <Dialog open={pendingSwitch} onOpenChange={() => cancelSwitch()}>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>신청 유형을 변경하시겠습니까?</DialogTitle>
              <DialogDescription>입력된 단체 신청 정보가 모두 삭제됩니다.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={cancelSwitch}>
                취소
              </Button>
              <Button variant="destructive" onClick={confirmSwitch}>
                변경
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {enrollmentResult && <SuccessScreen result={enrollmentResult} />}
    </FormProvider>
  );
}
