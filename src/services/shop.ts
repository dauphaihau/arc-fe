import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack';
import { RESOURCES } from '~/config/enums/resources';
import type {
  CreateProductBody, GetProductsQueryParams,
  Product,
  ProductVirtualFields, ResponseShopGetDetailProduct,
  UpdateProductBody
} from '~/types/product';
import type { Shop } from '~/types/shop';
import type { GetListResponse } from '~/types/common';
import type { Coupon, CreateCouponBody, GetCouponsParams } from '~/types/coupon';
import { toastCustom } from '~/config/toast';

export function useCreateShop() {
  return useMutation({
    mutationKey: ['create-shop'],
    mutationFn: (body: Pick<Shop, 'shop_name'>) => {
      return useCustomFetchTemp.post<{ shop: Shop }>(
        RESOURCES.SHOPS,
        body
      );
    },
  });
}

export function useShopGetDetailProduct(
  id: Product['id'],
  options?: NitroFetchOptions<NitroFetchRequest>
) {
  const authStore = useAuthStore();
  return useQuery({
    queryKey: ['shop-get-detail-product'],
    queryFn: () => {
      return useCustomFetchTemp.get<ResponseShopGetDetailProduct>(
        `${RESOURCES.SHOPS}/${authStore?.user?.shop?.id}${RESOURCES.PRODUCTS}/${id}`,
        undefined,
        options
      );
    },
  });
}

export function useShopCreateProduct() {
  const authStore = useAuthStore();
  return useMutation({
    mutationKey: ['shop-create-product'],
    mutationFn: (body: CreateProductBody) => {
      return useCustomFetchTemp.post<{ product: Product }>(
        `${RESOURCES.SHOPS}/${authStore?.user?.shop?.id}${RESOURCES.PRODUCTS}`,
        body
      );
    },
  });
}

export function useShopUpdateProduct() {
  const authStore = useAuthStore();
  return useMutation({
    mutationKey: ['shop-update-product'],
    mutationFn: (body: UpdateProductBody) => {
      const { id, ...resBody } = body;
      return useCustomFetchTemp.patch<{ product: Product }>(
        `${RESOURCES.SHOPS}/${authStore?.user?.shop?.id}${RESOURCES.PRODUCTS}/${id}`,
        resBody
      );
    },
  });
}

export function useShopDeleteProduct() {
  const authStore = useAuthStore();
  const toast = useToast();
  return useMutation({
    mutationKey: ['shop-delete-product'],
    mutationFn: (id: Product['id']) => {
      return useCustomFetchTemp.delete(
        `${RESOURCES.SHOPS}/${authStore?.user?.shop?.id}${RESOURCES.PRODUCTS}/${id}`
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

export function useShopGetProducts(queryParams: GetProductsQueryParams) {
  const authStore = useAuthStore();
  return useQuery({
    queryKey: ['shop-get-products'],
    queryFn: () => {
      return useCustomFetchTemp.get<GetListResponse<Product & ProductVirtualFields>>(
        `${RESOURCES.SHOPS}/${authStore?.user?.shop?.id}${RESOURCES.PRODUCTS}`,
        queryParams
      );
    },
  });
}

export function useShopCreateCoupon() {
  const authStore = useAuthStore();
  return useMutation({
    mutationKey: ['shop-create-coupon'],
    mutationFn: (body: CreateCouponBody) => {
      return useCustomFetchTemp.post<{ product: Product }>(
        `${RESOURCES.SHOPS}/${authStore?.user?.shop?.id}${RESOURCES.COUPONS}`,
        body
      );
    },
  });
}

export function useShopGetCoupons(queryParams: GetCouponsParams) {
  const authStore = useAuthStore();
  return useQuery({
    queryKey: ['shop-get-coupons'],
    queryFn: () => {
      return useCustomFetchTemp.get<GetListResponse<Coupon>>(
        `${RESOURCES.SHOPS}/${authStore?.user?.shop?.id}${RESOURCES.COUPONS}`,
        queryParams
      );
    },
  });
}
