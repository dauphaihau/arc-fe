import type { CreateProductPayload, GetProductsParams, IProduct } from '~/interfaces/product';
import type { GetListResponse } from '~/interfaces/common';
import { RESOURCES } from '~/config/enums/resources';

export const productModule = {

  async createProduct(payload: CreateProductPayload) {
    const authStore = useAuthStore();
    const shopId = authStore.getUser?.shop?.id;
    return await useCustomFetch.post<{ product: IProduct }>(
      `${RESOURCES.SHOPS}/${shopId}${RESOURCES.PRODUCTS}`,
      payload
    );
  },

  async getProductsByShop(params: GetProductsParams) {
    const authStore = useAuthStore();
    const shopId = authStore.getUser?.shop?.id;
    return await useCustomFetch.get<GetListResponse<IProduct>>(
      `${RESOURCES.SHOPS}/${shopId}${RESOURCES.PRODUCTS}`,
      params
    );
  },

  async getProducts(params: GetProductsParams) {
    return await useCustomFetch.get<GetListResponse<IProduct>>(
      `${RESOURCES.PRODUCTS}`,
      params
    );
  },

  async getDetailProduct(id: IProduct['id']) {
    return await useCustomFetch.get<{ product: IProduct }>(
      `${RESOURCES.PRODUCTS}/${id}`
    );
  },
};
