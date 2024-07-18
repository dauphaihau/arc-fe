import type { Ref } from 'vue';

export interface ResponseBaseGetList<T> {
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

// export type ErrorServer = {
//   code: number
//   message: string
//   data: unknown
// };
