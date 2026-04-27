import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchCourses } from '@/api/courses'

vi.mock('@/api/_utils', () => ({
  delay: vi.fn().mockResolvedValue(undefined),
}))

describe('fetchCourses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('카테고리 없이 호출하면 전체 강의 10개를 반환한다', async () => {
    const result = await fetchCourses()
    expect(result.courses).toHaveLength(10)
  })

  it('development 카테고리로 호출하면 해당 강의만 반환한다', async () => {
    const result = await fetchCourses('development')
    expect(result.courses.length).toBeGreaterThan(0)
    result.courses.forEach((course) => {
      expect(course.category).toBe('development')
    })
  })

  it('응답에 categories 배열이 포함된다', async () => {
    const result = await fetchCourses()
    expect(Array.isArray(result.categories)).toBe(true)
    expect(result.categories.length).toBeGreaterThan(0)
  })
})
