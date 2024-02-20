import type { IShop } from '~/interfaces/shop';
import type {
  CreateProductPayload, GetProductsQueryParams, IProduct, IProductVirtualFields
} from '~/interfaces/product';
import type { GetListResponse } from '~/interfaces/common';
import { RESOURCES } from '~/config/enums/resources';
import type { GetCouponsParams, CreateCouponPayload, ICoupon } from '~/interfaces/coupon';

export class ShopModule {
  private shopId: string | undefined;

  constructor() {
    useRouter().beforeEach(() => {
      const authStore = useAuthStore();
      this.shopId = authStore.getUser?.shop?.id;
    });
  }

  async createShop(payload: Pick<IShop, 'shop_name'>) {
    return await useAsyncData<{ shop: IShop }, ErrorServer>(
      'createShop',
      () => useCustomOFetch.post(`${RESOURCES.SHOPS}`, payload)
    );
  }

  async createProduct(payload: CreateProductPayload) {
    return await useCustomFetch.post<{ product: IProduct }>(
      `${RESOURCES.SHOPS}/${this.shopId}${RESOURCES.PRODUCTS}`,
      payload
    );
  }

  async deleteProduct(productId: IProduct['id']) {
    return await useCustomFetch.delete(
      `${RESOURCES.SHOPS}/${this.shopId}${RESOURCES.PRODUCTS}/${productId}`
    );
  }

  async getProducts(queryParams: GetProductsQueryParams) {
    return await useCustomFetch.get<GetListResponse<IProduct & IProductVirtualFields>>(
      `${RESOURCES.SHOPS}/${this.shopId}${RESOURCES.PRODUCTS}`,
      queryParams
    );
  }

  async createCoupon(payload: CreateCouponPayload) {
    return await useCustomFetch.post<{ product: IProduct }>(
      `${RESOURCES.SHOPS}/${this.shopId}${RESOURCES.COUPONS}`,
      payload
    );
  }

  async getCoupons(queryParams: GetCouponsParams) {
    return await useCustomFetch.get<GetListResponse<ICoupon>>(
      `${RESOURCES.SHOPS}/${this.shopId}${RESOURCES.COUPONS}`,
      queryParams
    );
  }
}
