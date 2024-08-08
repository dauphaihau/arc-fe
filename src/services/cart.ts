import type { MutationOptions, UseQueryOptions } from '@tanstack/vue-query';
import type { FetchError } from 'ofetch';
import { RESOURCES } from '~/config/enums/resources';
import type {
  AddProductToCartBody, ResponseGetCart,
  UpdateCartBody, ResponseUpdateCart,
  ResponseAddProductToCartBody, ResponseDeleteProductCart
} from '~/types/request-api/cart';
import type { ProductInventory } from '~/types/product';
import { toastCustom } from '~/config/toast';
import { useGetCurrentUser } from '~/services/user';
import type { Cart } from '~/types/cart';

export function useGetCart(
  params?: { cart_id: Cart['id'] },
  queryOptions?: Partial<UseQueryOptions<ResponseGetCart>>
) {
  const { data: dataUserAuth } = useGetCurrentUser();
  return useQuery<ResponseGetCart>({
    ...queryOptions,
    enabled: !!dataUserAuth.value?.user,
    queryKey: ['get-cart', params?.cart_id ?? 'my-cart'],
    queryFn: () => {
      return useCustomFetch.get<ResponseGetCart>(
        `${RESOURCES.USER}${RESOURCES.CART}`,
        params ?? undefined
      );
    },
    retry: 1,
  });
}

export function useAddProductToCart(
  options?: MutationOptions<ResponseAddProductToCartBody, FetchError, AddProductToCartBody>
) {
  const toast = useToast();
  return useMutation({
    onError() {
      toast.add({
        ...toastCustom.error,
        title: 'Add product to cart failed',
      });
    },
    ...options,
    mutationKey: ['add-to-cart'],
    mutationFn: (body: AddProductToCartBody) => {
      return useCustomFetch.post<ResponseAddProductToCartBody>(
        `${RESOURCES.USER}${RESOURCES.CART}`,
        body
      );
    },
  });
}

export function useUpdateCart(
  options?: MutationOptions<ResponseUpdateCart, FetchError, UpdateCartBody>
) {
  const toast = useToast();
  return useMutation({
    onError() {
      toast.add({
        ...toastCustom.error,
        title: 'Update cart failed',
      });
    },
    ...options,
    mutationFn: (body: UpdateCartBody) => {
      return useCustomFetch.patch<ResponseUpdateCart>(
        `${RESOURCES.USER}${RESOURCES.CART}`,
        body
      );
    },
  });
}

export function useDeleteProductCart(
  id: ProductInventory['id'],
  options?: MutationOptions<ResponseDeleteProductCart>
) {
  const toast = useToast();
  return useMutation({
    onError: () => {
      toast.add({
        ...toastCustom.error,
        title: 'Delete product cart failed',
      });
    },
    ...options,
    mutationFn: () => {
      return useCustomFetch.delete<ResponseDeleteProductCart>(
        `${RESOURCES.USER}${RESOURCES.CART}`,
        { inventory_id: id },
        undefined
      );
    },
  });
}
