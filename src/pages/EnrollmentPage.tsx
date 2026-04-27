import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
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
    isEditingCourse,
    handleNextStep,
    handlePrevStep,
    goToStep,
    startCourseEdit,
    handleEnrollmentTypeChange,
    pendingSwitch,
    confirmSwitch,
    cancelSwitch,
    handleSubmit,
    handleReset,
    isPending,
    submissionError,
    enrollmentResult,
    wasRestored,
  } = useEnrollmentForm();

  const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const onNext = () => {
    setStepDirection('forward');
    handleNextStep();
  };

  const onPrev = () => {
    setStepDirection('backward');
    handlePrevStep();
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gray-50">
        <StepIndicator currentStep={currentStep} onStepClick={goToStep} />

        {wasRestored && !bannerDismissed && (
          <div className="mx-auto flex max-w-2xl items-center justify-between rounded-lg bg-primary/10 px-4 py-2.5 text-sm text-primary">
            <span>이전에 작성하던 내용을 불러왔습니다.</span>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="ml-3 shrink-0 hover:opacity-70"
              aria-label="닫기"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        <main
          key={currentStep}
          className={cn(
            'mx-auto max-w-2xl px-4 py-8',
            stepDirection === 'forward' ? 'animate-slide-in-right' : 'animate-slide-in-left',
          )}
        >
          {currentStep === 1 && (
            <Step1CourseSelect
              onEnrollmentTypeChange={handleEnrollmentTypeChange}
              onNext={onNext}
              isEditingCourse={isEditingCourse}
            />
          )}
          {currentStep === 2 && (
            <Step2PersonalInfo onNext={onNext} onPrev={onPrev} />
          )}
          {currentStep === 3 && (
            <Step3Confirm
              onPrev={onPrev}
              onSubmit={handleSubmit}
              goToStep={goToStep}
              onEditCourse={startCourseEdit}
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

      {enrollmentResult && (
        <SuccessScreen result={enrollmentResult} onReset={handleReset} />
      )}
    </FormProvider>
  );
}
