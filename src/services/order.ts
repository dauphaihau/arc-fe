import type { ComputedRef } from 'vue';
import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack';
import { RESOURCES } from '~/config/enums/resources';
import type {
  CreateOrderForBuyNowBody,
  CreateOrderFromCartBody,
  GetSummaryOderBody,
  ResponseCreateOrder,
  ResponseGetOrderShops,
  ResponseGetOrderShopsByCheckoutSession,
  SummaryOrder
} from '~/types/order';
import type { GetProductsLowestPriceQueries } from '~/types/product';
import type { GetListResponse } from '~/types/common';

export function useCreateOrderForBuyNow() {
  return useMutation({
    mutationKey: ['create-order-for-buy-now'],
    mutationFn: (body: CreateOrderForBuyNowBody) => {
      return useCustomFetchTemp.put<ResponseCreateOrder>(
        `${RESOURCES.USER}${RESOURCES.ORDERS}`,
        body
      );
    },
  });
}

export function useCreateOrderFromCart() {
  return useMutation({
    mutationKey: ['create-order-from-cart'],
    mutationFn: (body: CreateOrderFromCartBody) => {
      return useCustomFetchTemp.post<ResponseCreateOrder>(
        `${RESOURCES.USER}${RESOURCES.ORDERS}`,
        body
      );
    },
  });
}

export function useGetSummaryOder(
  body?: ComputedRef<GetSummaryOderBody | undefined>
) {
  return useQuery({
    queryKey: ['get-summary-oder', body],
    queryFn: () => {
      return useCustomFetchTemp.delete<{ summaryOrder: SummaryOrder }>(
        `${RESOURCES.USER}${RESOURCES.ORDERS}`,
        undefined,
        body?.value
      );
    },
  });
}

export function useMutateSummaryOder() {
  return useMutation({
    mutationKey: ['mutate-summary-oder'],
    mutationFn: (body?: GetSummaryOderBody) => {
      return useCustomFetchTemp.delete<{ summaryOrder: SummaryOrder }>(
        `${RESOURCES.USER}${RESOURCES.ORDERS}`,
        undefined,
        body
      );
    },
  });
}

export function useGetOrderShops(queryParams?: GetProductsLowestPriceQueries) {
  return useQuery({
    queryKey: ['get-order-shops'],
    queryFn: () => {
      return useCustomFetchTemp.get<GetListResponse<ResponseGetOrderShops['orderShop']>>(
        `${RESOURCES.USER}${RESOURCES.ORDERS}`,
        queryParams
      );
    },
    enabled: !!queryParams,
  });
}

export function useGetOrderShopsByCheckoutSession(
  sessionId?: string,
  options?: NitroFetchOptions<NitroFetchRequest>
) {
  return useQuery({
    enabled: !!sessionId,
    queryKey: ['verify-cs'],
    queryFn: () => {
      return useCustomFetchTemp.get<ResponseGetOrderShopsByCheckoutSession>(
        `${RESOURCES.USER}/order/session`,
        {
          session_id: sessionId,
        },
        options
      );
    },
  });
}
