// ─── 카테고리 상수 (단일 소스) ─────────────────────────────────────────────────

export const COURSE_CATEGORIES = ['development', 'design', 'marketing', 'business'] as const;
export type CourseCategory = typeof COURSE_CATEGORIES[number];

// ─── API 타입 ──────────────────────────────────────────────────────────────

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  price: number;
  maxCapacity: number;
  currentEnrollment: number;
  startDate: string;
  endDate: string;
  instructor: string;
}

export interface CourseListResponse {
  courses: Course[];
  categories: CourseCategory[];
}

export interface ApplicantData {
  name: string;
  email: string;
  phone: string;
  motivation?: string;
}

export interface GroupData {
  organizationName: string;
  headCount: number;
  participants: Array<{ name: string; email: string }>;
  contactPerson: string;
}

export interface PersonalEnrollmentRequest {
  courseId: string;
  type: 'personal';
  applicant: ApplicantData;
  agreedToTerms: boolean;
}

export interface GroupEnrollmentRequest {
  courseId: string;
  type: 'group';
  applicant: ApplicantData;
  group: GroupData;
  agreedToTerms: boolean;
}

export type EnrollmentRequest = PersonalEnrollmentRequest | GroupEnrollmentRequest;

export interface EnrollmentResponse {
  enrollmentId: string;
  status: 'confirmed' | 'pending';
  enrolledAt: string;
}

export interface ErrorResponse {
  code: 'COURSE_FULL' | 'DUPLICATE_ENROLLMENT' | 'INVALID_INPUT' | 'NETWORK_ERROR';
  message: string;
  details?: Record<string, string>;
}

// ─── 폼 데이터 타입 (discriminated union) ────────────────────────────────────

export type EnrollmentType = 'personal' | 'group';

export interface BaseFormData {
  courseId: string;
  enrollmentType: EnrollmentType;
  applicant: ApplicantData;
  agreedToTerms: boolean;
}

export interface PersonalFormData extends BaseFormData {
  enrollmentType: 'personal';
}

export interface GroupFormData extends BaseFormData {
  enrollmentType: 'group';
  group: GroupData;
}

export type FormData = PersonalFormData | GroupFormData;
