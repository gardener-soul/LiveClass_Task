import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { CheckIcon } from 'lucide-react';

import type { Course, CourseCategory, EnrollmentType } from '@/types/enrollment';
import type { EnrollmentFormValues } from '@/hooks/useEnrollmentForm';
import { cn } from '@/lib/utils';
import { useCourses } from '@/hooks/useCourses';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface Step1CourseSelectProps {
  onEnrollmentTypeChange: (type: EnrollmentType) => void;
  onNext: () => void;
  isEditingCourse?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: '전체',
  development: '개발',
  design: '디자인',
  marketing: '마케팅',
  business: '비즈니스',
};

const CATEGORY_IMAGE: Record<CourseCategory, string> = {
  development: '/Development.png',
  design: '/Design.png',
  marketing: '/Marketing.png',
  business: '/Business.png',
};

const TABS = ['all', 'development', 'design', 'marketing', 'business'] as const;

function CourseCardSkeleton() {
  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden animate-pulse">
      <div className="h-28 bg-muted" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2" />
        <div className="h-3 bg-muted rounded w-1/3" />
        <div className="h-4 bg-muted rounded w-1/4 mt-1" />
      </div>
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  isSelected: boolean;
  onSelect: () => void;
}

function CourseCard({ course, isSelected, onSelect }: CourseCardProps) {
  const isFull = course.currentEnrollment >= course.maxCapacity;

  return (
    <div
      role="button"
      tabIndex={isFull ? -1 : 0}
      onClick={isFull ? undefined : onSelect}
      onKeyDown={(e) => {
        if (!isFull && (e.key === 'Enter' || e.key === ' ')) onSelect();
      }}
      className={cn(
        'relative rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden cursor-pointer transition-shadow duration-200',
        isFull && 'opacity-60 pointer-events-none cursor-default',
        isSelected && !isFull ? 'ring-2 ring-primary shadow-md' : 'hover:shadow-md',
      )}
    >
      {/* 썸네일 */}
      <div className="h-28 relative overflow-hidden">
        <img
          src={CATEGORY_IMAGE[course.category]}
          alt={course.category}
          className="w-full h-full object-cover"
        />
        {isSelected && !isFull && (
          <div className="absolute top-2 right-2 rounded-full bg-primary p-1">
            <CheckIcon className="size-3 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* 카드 내용 */}
      <div className="p-4 flex flex-col gap-1.5">
        <p className="text-sm font-medium line-clamp-2 leading-snug">{course.title}</p>
        <p className="text-xs text-muted-foreground">
          {course.instructor} · {course.startDate} ~ {course.endDate}
        </p>
        <p className="text-xs text-muted-foreground">
          {course.currentEnrollment}/{course.maxCapacity}명
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm font-semibold text-primary">{course.price.toLocaleString()}원</p>
          {isFull && (
            <Badge variant="destructive" className="text-xs">정원 마감</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function Step1CourseSelect({ onEnrollmentTypeChange, onNext, isEditingCourse = false }: Step1CourseSelectProps) {
  const { watch, setValue, formState } = useFormContext<EnrollmentFormValues>();
  const [activeTab, setActiveTab] = useState<string>('all');

  const selectedCourseId = watch('courseId');
  const enrollmentType = watch('enrollmentType');

  const { data, isLoading, isError, refetch } = useCourses();

  const courses = data?.courses ?? [];
  const filtered = activeTab === 'all' ? courses : courses.filter((c) => c.category === activeTab);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">강의 선택</h2>
        <p className="text-sm text-muted-foreground">수강할 강의를 선택해주세요.</p>
      </div>

      {/* 카테고리 탭 + 신청 유형 */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 flex-wrap">
          {TABS.map((tab) => (
            <Button
              key={tab}
              type="button"
              size="sm"
              variant={activeTab === tab ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab)}
            >
              {CATEGORY_LABELS[tab]}
            </Button>
          ))}
        </div>

        {/* 신청 유형 */}
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium whitespace-nowrap">신청 유형</p>
          <RadioGroup
            value={enrollmentType}
            onValueChange={(val: string) => onEnrollmentTypeChange(val as EnrollmentType)}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="personal" id="type-personal" />
              <Label htmlFor="type-personal" className="cursor-pointer">
                개인 신청
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="group" id="type-group" />
              <Label htmlFor="type-group" className="cursor-pointer">
                단체 신청
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* 강의 카드 그리드 */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">강의 목록을 불러오지 못했습니다.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            다시 시도
          </Button>
        </div>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          해당 카테고리에 강의가 없습니다.
        </p>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isSelected={selectedCourseId === course.id}
              onSelect={() => setValue('courseId', course.id, { shouldValidate: true })}
            />
          ))}
        </div>
      )}

      {/* 강의 선택 에러 */}
      {formState.errors.courseId && (
        <p className="text-xs font-medium text-destructive">{formState.errors.courseId.message}</p>
      )}

      <div className="flex justify-end">
        <Button type="button" onClick={onNext}>
          {isEditingCourse ? '최종 확인으로 →' : '다음 단계 →'}
        </Button>
      </div>
    </div>
  );
}
