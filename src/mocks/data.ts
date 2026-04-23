import type { Course } from '@/types/enrollment';

export const COURSE_FULL_API_IDS: readonly string[] = ['course-dev-02'];
export const DUPLICATE_EMAIL = 'duplicate@test.com';
export const INVALID_TRIGGER_NAME_PREFIX = 'invalid';

export const MOCK_COURSES: Course[] = [
  // development — 3개
  {
    id: 'course-dev-01',
    title: 'React 19 완전 정복',
    description: 'React 19의 새로운 기능과 Server Components를 실전 프로젝트로 마스터합니다.',
    category: 'development',
    price: 120000,
    maxCapacity: 25,
    currentEnrollment: 18,
    startDate: '2026-06-01',
    endDate: '2026-07-31',
    instructor: '김철수',
  },
  {
    // 마감 임박 — 선택 가능하지만 제출 시 COURSE_FULL API 에러 트리거
    id: 'course-dev-02',
    title: 'TypeScript 심화 과정',
    description: '제네릭, 조건부 타입, 타입 추론 등 고급 TypeScript 패턴을 학습합니다.',
    category: 'development',
    price: 95000,
    maxCapacity: 20,
    currentEnrollment: 19,
    startDate: '2026-06-15',
    endDate: '2026-08-15',
    instructor: '이영희',
  },
  {
    // 정원 마감 — disabled
    id: 'course-dev-03',
    title: 'Node.js + NestJS 백엔드 개발',
    description: 'NestJS로 확장 가능한 RESTful API 서버를 구축하는 실전 강의입니다.',
    category: 'development',
    price: 110000,
    maxCapacity: 20,
    currentEnrollment: 20,
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    instructor: '박민준',
  },

  // design — 2개
  {
    id: 'course-des-01',
    title: 'Figma로 시작하는 UI/UX 디자인',
    description: '디자인 원칙부터 컴포넌트 시스템 설계까지, Figma를 활용한 실무 디자인 과정입니다.',
    category: 'design',
    price: 85000,
    maxCapacity: 30,
    currentEnrollment: 12,
    startDate: '2026-06-01',
    endDate: '2026-07-31',
    instructor: '최수아',
  },
  {
    id: 'course-des-02',
    title: '디자인 시스템 구축 실전',
    description: 'Atomic Design 방법론으로 일관된 디자인 시스템을 처음부터 만들어봅니다.',
    category: 'design',
    price: 100000,
    maxCapacity: 25,
    currentEnrollment: 8,
    startDate: '2026-07-01',
    endDate: '2026-08-31',
    instructor: '정지훈',
  },

  // marketing — 2개
  {
    id: 'course-mkt-01',
    title: '퍼포먼스 마케팅 입문',
    description: 'Google Ads, Meta Ads를 활용한 디지털 광고 집행 및 성과 분석 방법을 배웁니다.',
    category: 'marketing',
    price: 75000,
    maxCapacity: 30,
    currentEnrollment: 21,
    startDate: '2026-06-15',
    endDate: '2026-07-15',
    instructor: '한소연',
  },
  {
    // 정원 마감 — disabled
    id: 'course-mkt-02',
    title: '콘텐츠 마케팅 전략',
    description: 'SNS 채널별 콘텐츠 기획부터 바이럴 전략까지 실전 마케팅 노하우를 공유합니다.',
    category: 'marketing',
    price: 65000,
    maxCapacity: 20,
    currentEnrollment: 20,
    startDate: '2026-05-15',
    endDate: '2026-06-15',
    instructor: '오승민',
  },

  // business — 3개
  {
    id: 'course-biz-01',
    title: '스타트업 재무 관리 기초',
    description: '스타트업 창업자를 위한 회계·세무·자금 조달 기초 강의입니다.',
    category: 'business',
    price: 90000,
    maxCapacity: 25,
    currentEnrollment: 10,
    startDate: '2026-06-01',
    endDate: '2026-07-31',
    instructor: '임재현',
  },
  {
    id: 'course-biz-02',
    title: 'OKR로 팀 성과 관리하기',
    description: 'OKR 프레임워크 도입부터 분기별 리뷰 운영까지, 성과 관리 체계를 구축합니다.',
    category: 'business',
    price: 80000,
    maxCapacity: 20,
    currentEnrollment: 7,
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    instructor: '강다은',
  },
  {
    id: 'course-biz-03',
    title: '협상과 의사결정 심리학',
    description: '행동경제학과 심리학을 바탕으로 협상력과 의사결정 역량을 키우는 과정입니다.',
    category: 'business',
    price: 70000,
    maxCapacity: 30,
    currentEnrollment: 14,
    startDate: '2026-06-15',
    endDate: '2026-08-15',
    instructor: '윤보라',
  },
];
