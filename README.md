# LiveClass — 다단계 수강 신청 폼

온라인 교육 플랫폼의 강의 수강 신청 흐름을 3단계 폼으로 구현한 과제입니다.

---

## 프로젝트 개요

수강생이 강의를 선택하고 개인/단체 신청 정보를 입력하여 수강 신청을 완료하는 3단계 폼입니다.

| 단계  | 내용                                                              |
| ----- | ----------------------------------------------------------------- |
| 1단계 | 카테고리별 강의 목록 조회 + 강의 선택 + 신청 유형(개인/단체) 선택 |
| 2단계 | 공통 수강생 정보 입력 + 단체 신청 시 조건부 추가 필드             |
| 3단계 | 전체 입력 내용 확인 + 이용약관 동의 + 제출                        |
| 완료  | 신청 완료 화면 (신청 번호, 요약 정보)                             |

**선택 구현**

- `localStorage` 임시 저장 — 새로고침 후 입력 데이터 자동 복구 (`agreedToTerms` 저장 제외)
- 이탈 방지 — `beforeunload` 브라우저 경고 + Step 2 이전 버튼 클릭 시 인앱 확인 다이얼로그
- 반응형 레이아웃 — 모바일 세로 스크롤 레이아웃

**추가 구현**

- 카테고리별 썸네일 이미지 + 브랜드 파비콘 적용
- 잔여석 < 2일 때 단체 신청 자동 차단 — 강의 선택 또는 유형 전환 시 개인 신청으로 강제 전환 + 안내
- 마감 임박 적용 — 잔여 5자리 이하 시 "마감 임박 (N자리 남음)" 배지 + Step 3 요약 경고
- Mock API 에러 재현 가능 설계 — 랜덤 실패 대신 특정 courseId/이메일로 에러 트리거

---

## 기술 스택

| 역할         | 라이브러리                  | 버전    | 선택 이유                                                                                                    |
| ------------ | --------------------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| 프레임워크   | React                       | ^19.1.0 | 과제 권장. 동시성 기능                                                                                       |
| 언어         | TypeScript                  | ~5.8.3  | 과제 필수. discriminated union으로 개인/단체 타입 엄격 분리                                                  |
| 빌드         | Vite                        | ^6.3.5  | 빠른 HMR, ESM 기반 개발 서버                                                                                 |
| 폼 상태 관리 | React Hook Form             | ^7.73.1 | 비제어 컴포넌트 기반으로 불필요한 리렌더 최소화. `FormProvider`로 스텝 간 단일 상태 공유                     |
| 유효성 검증  | Zod                         | ^4.3.6  | 스키마 기반 선언적 검증. UI와 검증 로직 완전 분리. TypeScript 타입 자동 추론                                 |
| 서버 상태    | TanStack Query              | ^5.99.2 | 강의 목록 fetching, 로딩/에러 상태 자동 관리, 중복 요청 방지                                                 |
| 스타일       | Tailwind CSS v4 + shadcn/ui | ^4.2.4  | 유틸리티 클래스 기반 빠른 스타일링. shadcn/ui는 코드 복사 방식으로 `src/components/ui/`에 실제 구현체가 포함 |
| 테스트       | Vitest + Testing Library    | ^4.1.5  | Vite와 동일한 번들러 환경. 빠른 실행                                                                         |

**선택하지 않은 대안들**

- **Formik**: `FormProvider` 없이 스텝 간 상태를 공유하려면 별도 Context를 직접 구성해야 합니다. RHF는 이미 내장되어 있습니다.
- **Yup**: Zod 대비 TypeScript 타입 추론이 약하고, `discriminated union` 표현이 번거롭습니다. Zod는 스키마 정의와 타입 추론이 한 곳에서 이루어집니다.
- **SWR**: 강의 목록 외에 mutation(제출) 상태 관리도 필요합니다. TanStack Query는 query와 mutation을 일관된 API로 처리합니다.
- **styled-components / emotion**: CSS-in-JS는 런타임 비용이 있고 평가 핵심인 폼 로직과 관계없는 설정 비용이 큽니다. Tailwind v4는 빌드 타임에 처리됩니다.
- **MUI / Ant Design**: npm 패키지 라이브러리는 내부 구현이 블랙박스입니다. shadcn/ui는 코드가 `src/components/ui/`에 직접 복사되어 평가자가 실제 구현체를 볼 수 있습니다.
- **Jest**: Vite 환경에서 Jest를 쓰려면 별도 트랜스파일 설정이 필요합니다. Vitest는 `vite.config.ts`를 그대로 공유합니다.

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 테스트 실행
npm test

# 테스트 감시 모드
npm run test:watch
```

> Mock API를 사용하므로 별도 서버 없이 즉시 실행 가능합니다.

---

## 프로젝트 구조 설명

```
src/
├── api/                        # Mock API 함수 (Promise 딜레이로 서버 시뮬레이션)
│   ├── courses.ts              # GET /api/courses?category={category}
│   ├── enrollments.ts          # POST /api/enrollments
│   └── _utils.ts               # 딜레이/에러 시뮬레이션 유틸
├── components/
│   ├── ui/                     # shadcn/ui 컴포넌트 (복사된 실제 소스)
│   ├── common/                 # 공통 UI (StepIndicator 등)
│   └── enrollment/             # 스텝별 폼 컴포넌트
│       ├── Step1CourseSelect.tsx
│       ├── Step2PersonalInfo.tsx
│       ├── Step2GroupInfo.tsx   ← 단체 신청 시 조건부 렌더
│       ├── Step3Confirm.tsx
│       └── SuccessScreen.tsx
├── hooks/
│   ├── useEnrollmentForm.ts    # 스텝 전환 + 스텝별 검증 트리거
│   ├── useEnrollmentSubmit.ts  # TanStack Query mutation 래핑
│   ├── useStepNavigation.ts    # 스텝 이동 로직
│   ├── useFormPersistence.ts   # localStorage 임시 저장/복구
│   ├── useEnrollmentDraft.ts   # 임시 저장 draft 관리
│   └── useCourses.ts           # 강의 목록 fetching
├── schemas/                    # Zod 스키마 (스텝별 분리)
│   ├── step1.schema.ts
│   ├── step2.schema.ts         # personal/group 분기 처리
│   ├── step3.schema.ts
│   └── enrollment.schema.ts
├── types/
│   └── enrollment.ts           # discriminated union 타입 정의
├── mocks/
│   └── data.ts                 # 목 강의 데이터 (4개 카테고리, 10개 강의)
└── pages/
    └── EnrollmentPage.tsx      # FormProvider + 스텝 라우팅
```

---

## 요구사항 해석 및 가정

### 1. 마감 임박 기준: 비율(%) vs 절대값(N자리)

**결정**: 잔여 자리 ≤ 5를 기준으로 합니다.

"80% 이상 차면 임박"이라는 비율 기준은 100명 강의(80명 수강 → 20자리 남음)에서 전혀 급하지 않습니다. 사용자에게 실제로 의미 있는 것은 숫자입니다. "5자리 남음"은 즉각적인 행동을 유도할 수 있지만 "80% 찼습니다"는 그렇지 않습니다.

### 2. 단체 신청과 잔여석: headCount 자동 차단 시점

**결정**: 잔여석이 `MIN_SEATS_FOR_GROUP(2)` 미만이면 단체 신청을 선택하거나 해당 강의를 선택하는 순간 개인 신청으로 강제 전환합니다.

단체 신청은 최소 2명이므로, 잔여석이 1자리뿐인 강의에 단체 신청을 허용하면 서버 제출 시 실패합니다. 실패를 예고할 수 있다면 미리 차단하는 것이 좋습니다.

### 3. 참가자 이메일 중복: 어디까지 검증할 것인가

**결정**: 참가자 배열 내 중복뿐 아니라, 신청자 이메일과의 중복도 검증합니다.

명세에는 "이메일 형식 검증"만 있지만, 같은 신청 건에 동일 이메일이 두 번 들어가는 것은 데이터 무결성 문제입니다. Zod `superRefine`으로 배열을 순회해 중복 인덱스를 특정하고 해당 필드에 에러를 등록합니다.

### 4. Mock API 에러 재현 방식: 랜덤 vs 특정 트리거

**결정**: 랜덤 실패 대신 특정 courseId/이메일로 에러를 트리거합니다.

랜덤 실패는 코드 리뷰어가 에러 케이스를 재현할 수 없습니다. 평가 상황에서 "10번 시도해야 한 번 나오는 에러"는 없는 것과 같습니다. 구체적인 트리거 조건은 [docs/TEST.md](docs/TEST.md)에 문서화되어 있습니다.

---

## 설계 결정과 이유

### 1. Facade Hook: `useEnrollmentForm`이 외부 인터페이스를 단일화한 이유

스텝 관리(`useStepNavigation`), 제출(`useEnrollmentSubmit`), draft 저장(`useEnrollmentDraft`)은 목적이 분명히 달라 별도 파일로 분리했습니다. 문제는 세 훅 모두 RHF의 `methods` 객체를 파라미터로 받아야 한다는 점입니다. 이를 `EnrollmentPage`에서 직접 호출하면 훅 간 의존성 순서를 페이지가 수동으로 조율해야 하는 "분리된 것처럼 보이지만 강하게 결합된" 구조가 됩니다.

`useEnrollmentForm`이 `methods`를 소유하고 내부에서 세 훅을 조율한 뒤, `EnrollmentPage`에는 단일 인터페이스만 노출합니다. 내부 구현 변경이 페이지 코드에 영향을 주지 않는 Facade 패턴입니다.

### 2. 스텝별 검증: `stepSchema.safeParse()` + 수동 `setError`

스텝 전환 시 해당 스텝 필드만 검증하는 방법으로 두 가지를 고민했습니다.

- **B안**: 스텝마다 `zodResolver`를 다른 스키마로 동적 교체
- **A안(채택)**: 스텝별 Zod 스키마로 `safeParse(values)` 후 각 issue를 `setError`로 직접 매핑

B안은 RHF 공식 지원 패턴이 아니라 예측 불가한 동작을 유발할 수 있습니다. A안은 스텝 스키마를 `useStepNavigation` 내부에서 선택해 `safeParse`를 실행하고, 실패한 각 경로에 `setError`를 호출합니다. 단체 신청 시 `createStep2GroupSchema(remainingCapacity)`로 잔여석 기반 스키마를 동적으로 생성하는 것도 이 구조에서 자연스럽게 처리됩니다.

### 3. 에러 포커스: `setFocus` vs `querySelector`

유효성 실패 시 첫 번째 에러 필드로 이동하는 방법으로 `querySelector`로 DOM을 직접 탐색하는 방식도 있지만, RHF의 `setFocus(path)`를 선택했습니다.

`setFocus`는 RHF에 이미 등록된 `ref`를 통해 `.focus()`를 호출하므로 추가 의존성이 없고, 브라우저가 포커스된 요소를 자동으로 뷰포트에 스크롤시켜 줍니다. DOM 직접 접근은 컴포넌트 언마운트/리마운트 상황에서 ref와 엇나갈 위험이 있습니다.

### 4. localStorage 복구: 확인 다이얼로그 없이 자동 복구 + 배너

새로고침 후 draft를 발견했을 때 "복구할까요?" 다이얼로그를 띄우는 방식도 있습니다. 하지만 새로고침 직후 즉각적인 의사결정을 요구하는 것은 마찰이 크고, 사용자가 의도한 데이터를 굳이 "허락받고" 복구할 이유가 없습니다.

자동 복구 후 상단 배너로 "이전 작성 내용을 불러왔습니다"를 알리고, 원하지 않으면 초기화 버튼을 제공하는 방식을 선택했습니다. `agreedToTerms`는 보안 관행상 저장하지 않으며, 복구 시 `version: 1` 검증과 `fullSchema.safeParse`로 손상된 draft를 자동으로 걸러냅니다.

### 5. 서버 에러 코드: 필드 에러 vs 폼 레벨 Alert 분리

| 에러 코드              | 처리 방식                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `INVALID_INPUT`        | `setError()`로 해당 필드에 직접 매핑 — 사용자가 어느 필드를 수정해야 하는지 즉시 파악 가능 |
| `COURSE_FULL`          | 폼 상단 Alert + 1단계 이동 버튼 — 필드 수정으로 해결 불가한 비즈니스 에러는 별도 처리      |
| `DUPLICATE_ENROLLMENT` | 폼 상단 Alert + 안내 메시지                                                                |
| 네트워크 에러          | 입력 데이터 유지 + 재시도 안내                                                             |

필드에 귀속되는 에러는 RHF에, 폼 전체 수준의 비즈니스 에러는 컴포넌트 state로 분리합니다. 모든 에러를 같은 방식으로 처리하면 "서버가 정원 초과라고 하는데 어떤 필드를 고쳐야 하나요?"라는 혼란을 줍니다.

---

## 미구현 / 제약사항

- **결제 연동 및 인증**: 과제 명세에 따라 구현하지 않음
- **실제 백엔드 서버**: Mock API(Promise 딜레이)로 대체. 실 서버 연동 시 `src/api/` 함수 내부 구현만 교체하면 됨
- **E2E 테스트**: Vitest 단위/통합 테스트만 포함. Playwright/Cypress 등 E2E는 미구현

---

## AI 활용 범위

본 프로젝트는 **Claude Code** 를 활용하여 개발했습니다.

| 항목   | 활용 내역                                                         |
| ------ | ----------------------------------------------------------------- |
| 설계   | 요구사항 파악, 폴더 구조 설계, discriminated union 타입 구조 설계 |
| 구현   | 스텝별 컴포넌트, Zod 스키마, 커스텀 훅, Mock API 구현             |
| 검증   | 코드 리뷰, 리팩토링 (/simplify)                                   |
| 테스트 | 단위/통합 테스트 코드 작성                                        |

과제분석 및 요구사항 설계, 설계 문서 검증 및 수정, UI 및 UX, 엣지 케이스에 대한 QA는 직접 작업하였습니다.
