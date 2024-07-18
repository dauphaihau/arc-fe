import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack';
import type { MutationOptions } from '@tanstack/vue-query';
import type { FetchError } from 'ofetch';
import { RESOURCES } from '~/config/enums/resources';
import type {
  AddCartProduct, ResponseGetCart, ResponseGetProductsRecentlyAdded, UpdateCartProductBody, UpdateCouponsItem
} from '~/types/cart';
import type { SummaryOrder } from '~/types/order';
import type { ProductInventory } from '~/types/product';
import { toastCustom } from '~/config/toast';

export function useGetCart(
  options?: NitroFetchOptions<NitroFetchRequest>
) {
  return useQuery({
    queryKey: ['get-cart'],
    queryFn: () => {
      return useCustomFetch.get<ResponseGetCart>(
        `${RESOURCES.USER}${RESOURCES.CART}`,
        undefined,
        options
      );
    },
    retry: 1,
  });
}

export function useGetProductsRecentlyAdded(
  options?: NitroFetchOptions<NitroFetchRequest>
) {
  return useQuery({
    enabled: false,
    queryKey: ['get-products-recently-added'],
    queryFn: () => {
      return useCustomFetch.get<ResponseGetProductsRecentlyAdded>(
        `${RESOURCES.USER}${RESOURCES.CART}`,
        { type: 'header' },
        options
      );
    },
  });
}

export function useAddProductToCart(
  options?: MutationOptions<{ summaryOrder: SummaryOrder }, FetchError, AddCartProduct>
) {
  const toast = useToast();
  return useMutation({
    ...options,
    mutationKey: ['add-to-cart'],
    mutationFn: (body: AddCartProduct) => {
      return useCustomFetch.post<{ summaryOrder: SummaryOrder }>(
        `${RESOURCES.USER}${RESOURCES.CART}`,
        body
      );
    },
    onError() {
      toast.add({
        ...toastCustom.error,
        title: 'Add to cart failed',
      });
    },
  });
}

export function useUpdateCartProduct(
  options?: MutationOptions<{ summaryOrder: SummaryOrder }, FetchError, UpdateCartProductBody>
) {
  const toast = useToast();
  return useMutation({
    ...options,
    mutationKey: ['update-cart-product'],
    mutationFn: (body: UpdateCartProductBody) => {
      return useCustomFetch.patch<{ summaryOrder: SummaryOrder }>(
        `${RESOURCES.USER}${RESOURCES.CART}`,
        body
      );
    },
    onError() {
      toast.add({
        ...toastCustom.error,
        title: 'Update product cart failed',
      });
    },
  });
}

export function useDeleteCartProduct(
  id: ProductInventory['id'],
  options?: MutationOptions<{ summaryOrder: SummaryOrder }>
) {
  const toast = useToast();
  return useMutation({
    mutationKey: ['delete-cart-product'],
    mutationFn: () => {
      return useCustomFetch.delete<{ summaryOrder: SummaryOrder }>(
        `${RESOURCES.USER}${RESOURCES.CART}`,
        { inventory: id },
        undefined
        // options
      );
    },
    onError: () => {
      toast.add({
        ...toastCustom.error,
        title: 'Delete product cart failed',
      });
    },
    ...options,
  });
}

// calc summary order by item's addition info
export function useCalcSummaryOrder() {
  return useMutation({
    mutationKey: ['update-coupons-item'],
    mutationFn: (body: UpdateCouponsItem[]) => {
      return useCustomFetch.put<{ summaryOrder: SummaryOrder }>(
        `${RESOURCES.USER}${RESOURCES.CART}`,
        body
      );
    },
  });
}
