import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack';
import type { UseQueryOptions } from '@tanstack/vue-query';
import type { ComputedRef } from 'vue';
import { RESOURCES } from '~/config/enums/resources';
import type {
  GetProductsParams,
  Product,
  ResponseGetDetailProduct,
  ResponseGetProducts
} from '~/types/product';
import type { ResponseBaseGetList } from '~/types/common';

export function useGetProducts(
  params: ComputedRef<GetProductsParams | undefined>,
  options?: Partial<UseQueryOptions<ResponseBaseGetList<ResponseGetProducts>>>
) {
  return useQuery<ResponseBaseGetList<ResponseGetProducts>>({
    enabled: !!params,
    ...options,
    queryKey: ['get-products', params],
    queryFn: () => {
      return useCustomFetch.get<ResponseBaseGetList<ResponseGetProducts>>(
        RESOURCES.PRODUCTS,
        params.value
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
      return useCustomFetch.get<ResponseGetDetailProduct>(
        `${RESOURCES.PRODUCTS}/${id}`,
        undefined,
        options
      );
    },
  });
}

export function useGetProductsByMultiQueries(queries?: GetProductsParams[]) {
  return useQueries({
    queries: queries?.map(qp => ({
      queryKey: [qp.category],
      queryFn: async () => {
        const res = await useCustomFetch.get<ResponseBaseGetList<ResponseGetProducts>>(
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
