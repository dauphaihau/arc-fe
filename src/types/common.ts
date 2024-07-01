import type { Category } from '~/types/category';

export interface GetListResponse<T> {
  results: T[]
  page: number
  limit: number
  totalPages: number
  totalResults: number
}

export type RequestGetListParams = Partial<{
  page: number | Ref<number>
  limit: number
  populate: string
  select: string
  sortBy: string
}>;

export interface UserActivitiesSessionStorage {
  categoryProductVisited: Category['id']
  rootCategoryVisited: Category
  subCategories: Category[] & GetListResponse<Category>
}

export type ErrorServer = {
  code: number
  message: string
  data: unknown
};
