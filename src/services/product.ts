import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack';
import type { MutateOptions } from '@tanstack/vue-query';
import type { ComputedRef } from 'vue';
import { RESOURCES } from '~/config/enums/resources';
import type {
  GetProductsLowestPriceQueries, GetProductsQueryParams,
  Product,
  ResponseGetDetailProduct,
  ResponseGetProducts
} from '~/types/product';
import type { GetListResponse } from '~/types/common';

export function useGetProducts(
  queryParams?: GetProductsQueryParams,
  options?: NitroFetchOptions<NitroFetchRequest>
) {
  return useQuery({
    enabled: false,
    queryKey: ['get-product', queryParams],
    queryFn: () => {
      return useCustomFetchTemp.get<GetListResponse<ResponseGetProducts>>(
        RESOURCES.PRODUCTS,
        queryParams,
        options
      );
    },
  });
}

export function useSearchProducts(
  options: MutateOptions<GetListResponse<ResponseGetProducts>, unknown, GetProductsQueryParams, unknown>
) {
  return useMutation({
    ...options,
    mutationKey: ['get-search-product'],
    mutationFn: (queryParams?: GetProductsQueryParams) => {
      return useCustomFetchTemp.get<GetListResponse<ResponseGetProducts>>(
        RESOURCES.PRODUCTS,
        queryParams
      );
    },
  });
}

export function useGetDetailProduct(
  id: Product['id'],
  options?: NitroFetchOptions<NitroFetchRequest>
) {
  return useQuery({
    enabled: !!id,
    queryKey: ['get-detail-product', id],
    queryFn: () => {
      return useCustomFetchTemp.get<ResponseGetDetailProduct>(
        `${RESOURCES.PRODUCTS}/${id}`,
        undefined,
        options
      );
    },
  });
}

export function useGetProductsLowestPrice(
  queryParams: ComputedRef<GetProductsLowestPriceQueries | undefined>,
  options?: NitroFetchOptions<NitroFetchRequest>
) {
  return useQuery({
    enabled: !!queryParams,
    queryKey: ['get-product-lowest-price', queryParams],
    queryFn: () => {
      return useCustomFetchTemp.delete<GetListResponse<ResponseGetProducts>>(
        RESOURCES.PRODUCTS,
        queryParams.value,
        options
      );
    },
  });
}


export function useGetMultiProductsLowestPrice(queries?: GetProductsLowestPriceQueries[]) {
  return useQueries({
    queries: queries?.map(qp => ({
      queryKey: [qp.category],
      queryFn: async () => {
        const res = await useCustomFetchTemp.delete<GetListResponse<ResponseGetProducts>>(
          RESOURCES.PRODUCTS,
          qp
        );
        return {
          ...res,
          categoryId: qp.category,
        };
      },
    })) ?? [],
  });
}
