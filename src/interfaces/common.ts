export interface GetListResponse<T> {
  results: T[],
  page: number,
  limit: number,
  totalPages: number,
  totalResults: number,
}

export interface RequestGetListParams {
  page: number | Ref<number>,
  limit: number,
}
