import type { IShop } from '~/interfaces/shop';
import type {
  CreateProductBody,
  GetProductsQueryParams,
  IProduct,
  IProductVirtualFields,
  ResponseGetDetailProductByShop,
  UpdateProductBody
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

  async createShop(body: Pick<IShop, 'shop_name'>) {
    return await useAsyncData<{ shop: IShop }, ErrorServer>(
      'createShop',
      () => useCustomOFetch.post(`${RESOURCES.SHOPS}`, body)
    );
  }

  async createProduct(body: CreateProductBody) {
    return await useCustomFetch.post<{ product: IProduct }>(
      `${RESOURCES.SHOPS}/${this.shopId}${RESOURCES.PRODUCTS}`,
      body
    );
  }

  async updateProduct(bodyParam: UpdateProductBody) {
    const { id, ...body } = bodyParam;
    return await useCustomFetch.patch<{ product: IProduct }>(
      `${RESOURCES.SHOPS}/${this.shopId}${RESOURCES.PRODUCTS}/${id}`,
      body
    );
  }

  async deleteProduct(id: IProduct['id']) {
    return await useCustomFetch.delete(
      `${RESOURCES.SHOPS}/${this.shopId}${RESOURCES.PRODUCTS}/${id}`
    );
  }

  async getDetailProduct(id: IProduct['id']) {
    return await useCustomFetch.get<{product: ResponseGetDetailProductByShop}>(
    // return await useCustomFetch.get<{product: ResponseGetDetailProductByShop}>(
      `${RESOURCES.SHOPS}/${this.shopId}${RESOURCES.PRODUCTS}/${id}`
    );
  }

  async getProducts(queryParams: GetProductsQueryParams) {
    return await useCustomFetch.get<GetListResponse<IProduct & IProductVirtualFields>>(
      `${RESOURCES.SHOPS}/${this.shopId}${RESOURCES.PRODUCTS}`,
      queryParams
    );
  }

  async createCoupon(body: CreateCouponPayload) {
    return await useCustomFetch.post<{ product: IProduct }>(
      `${RESOURCES.SHOPS}/${this.shopId}${RESOURCES.COUPONS}`,
      body
    );
  }

  async getCoupons(queryParams: GetCouponsParams) {
    return await useCustomFetch.get<GetListResponse<ICoupon>>(
      `${RESOURCES.SHOPS}/${this.shopId}${RESOURCES.COUPONS}`,
      queryParams
    );
  }
}
