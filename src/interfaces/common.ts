export interface GetListResponse<T> {
  results: T[],
  page: number,
  limit: number,
  totalPages: number,
  totalResults: number,
}

export type RequestGetListParams = Partial<{
  page: number | Ref<number>,
  limit: number,
  populate: string
  select: string
  sortBy: string
}>
