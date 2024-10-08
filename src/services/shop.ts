import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack';
import type { ComputedRef } from 'vue';
import { RESOURCES } from '~/config/enums/resources';
import type {
  ShopGetProductsQueryParams,
  ResponseShopGetProducts,
  RequestCreateProductBody, RequestUpdateProductBody
} from '~/types/request-api/shop-product';
import type { Shop } from '~/types/shop';
import type { ResponseBaseGetList } from '~/types/common';
import type {
  Coupon, CreatePromoCodeBody, CreateSaleBody, GetCouponsParams
} from '~/types/coupon';
import { toastCustom } from '~/config/toast';
import type { UserAuthenticated } from '~/types/auth';
import { useGetCurrentUser } from '~/services/user';
import type { Product } from '~/types/product';

export function useCreateShop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['create-shop'],
    mutationFn: (body: Pick<Shop, 'shop_name'>) => {
      return useCustomFetch.post<{ shop: Shop }>(
        RESOURCES.SHOPS,
        body
      );
    },
    onSuccess(data) {
      const dataUserAuth = queryClient.getQueryData<{ user: UserAuthenticated }>(['current-user']);
      if (dataUserAuth) {
        dataUserAuth.user.shop = data.shop;
      }
    },
  });
}

export function useShopGetDetailProduct(
  id: Product['id'],
  options?: NitroFetchOptions<NitroFetchRequest>
) {
  const { data } = useGetCurrentUser();
  return useQuery({
    queryKey: ['shop-get-detail-product', id],
    queryFn: () => {
      // return useCustomFetch.get<ResponseShopGetDetailProduct>(
      return useCustomFetch.get(
        `${RESOURCES.SHOPS}/${data.value?.user?.shop?.id}${RESOURCES.PRODUCTS}/${id}`,
        undefined,
        options
      );
    },
  });
}

export function useShopCreateProduct() {
  const { data } = useGetCurrentUser();
  return useMutation({
    mutationKey: ['shop-create-product'],
    mutationFn: (body: RequestCreateProductBody) => {
      return useCustomFetch.post<{ product: Product }>(
        `${RESOURCES.SHOPS}/${data.value?.user?.shop?.id}${RESOURCES.PRODUCTS}`,
        body
      );
    },
  });
}

export function useShopUpdateProduct() {
  const { data } = useGetCurrentUser();
  return useMutation({
    mutationKey: ['shop-update-product'],
    mutationFn: (body: RequestUpdateProductBody & { id: Product['id'] }) => {
      const { id, ...resBody } = body;
      return useCustomFetch.patch<{ product: Product }>(
        `${RESOURCES.SHOPS}/${data.value?.user?.shop?.id}${RESOURCES.PRODUCTS}/${id}`,
        resBody
      );
    },
  });
}

export function useShopDeleteProduct() {
  const { data } = useGetCurrentUser();
  const toast = useToast();
  return useMutation({
    mutationKey: ['shop-delete-product'],
    mutationFn: (id: Product['id']) => {
      return useCustomFetch.delete(
        `${RESOURCES.SHOPS}/${data.value?.user?.shop?.id}${RESOURCES.PRODUCTS}/${id}`
      );
    },
    onSuccess() {
      toast.add({
        ...toastCustom.success,
        title: 'Delete product success',
      });
    },
    onError() {
      toast.add({
        ...toastCustom.error,
        title: 'Delete product failed',
      });
    },
  });
}

export function useShopGetProducts(
  queryParams: Ref<ShopGetProductsQueryParams> | ComputedRef<ShopGetProductsQueryParams>
) {
  const { data } = useGetCurrentUser();
  return useQuery({
    queryKey: ['shop-get-products', queryParams],
    queryFn: () => {
      return useCustomFetch.get<ResponseBaseGetList<ResponseShopGetProducts>>(
        `${RESOURCES.SHOPS}/${data.value?.user?.shop?.id}${RESOURCES.PRODUCTS}`,
        queryParams.value
      );
    },
  });
}

export function useShopCreateCoupon() {
  const { data } = useGetCurrentUser();
  return useMutation({
    mutationKey: ['shop-create-coupon'],
    mutationFn: (body: CreatePromoCodeBody | CreateSaleBody) => {
      return useCustomFetch.post<{ product: Product }>(
        `${RESOURCES.SHOPS}/${data.value?.user?.shop?.id}${RESOURCES.COUPONS}`,
        body
      );
    },
  });
}

export function useShopDeleteCoupon() {
  const { data } = useGetCurrentUser();
  const toast = useToast();
  return useMutation({
    mutationKey: ['shop-delete-coupon'],
    mutationFn: (id: Product['id']) => {
      return useCustomFetch.delete(
        `${RESOURCES.SHOPS}/${data.value?.user?.shop?.id}${RESOURCES.COUPONS}/${id}`
      );
    },
    onSuccess() {
      toast.add({
        ...toastCustom.success,
        title: 'Delete coupon success',
      });
    },
    onError() {
      toast.add({
        ...toastCustom.error,
        title: 'Delete coupon failed',
      });
    },
  });
}

export function useShopGetCoupons(queryParams: ComputedRef<GetCouponsParams>) {
  const { data } = useGetCurrentUser();
  return useQuery({
    queryKey: ['shop-get-coupons', queryParams],
    queryFn: () => {
      return useCustomFetch.get<ResponseBaseGetList<Coupon>>(
        `${RESOURCES.SHOPS}/${data.value?.user?.shop?.id}${RESOURCES.COUPONS}`,
        queryParams.value
      );
    },
  });
}
