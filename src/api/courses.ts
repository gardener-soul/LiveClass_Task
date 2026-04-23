import type { CourseListResponse } from '@/types/enrollment';
import { COURSE_CATEGORIES } from '@/types/enrollment';
import { MOCK_COURSES } from '@/mocks/data';
import { delay } from '@/api/_utils';

export async function fetchCourses(category?: string): Promise<CourseListResponse> {
  await delay(300, 500);

  const courses =
    category ? MOCK_COURSES.filter((c) => c.category === category) : MOCK_COURSES;

  return { courses, categories: [...COURSE_CATEGORIES] };
}
