import type { ICategory } from '~/interfaces/category';

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

export interface IUserActivitiesSessionStorage {
  categoryProductVisited: ICategory['id']
  rootCategoryVisited: ICategory
  subCategories: ICategory[] & GetListResponse<ICategory>
}

export type ErrorServer = {
  code: number
  message: string
  data: unknown
};
