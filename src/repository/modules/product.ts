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

  async getProducts(params: GetProductsParams) {
    const authStore = useAuthStore();
    const shopId = authStore.getUser?.shop?.id;
    return await useCustomFetch.get<GetListResponse<IProduct>>(
      `${RESOURCES.SHOPS}/${shopId}${RESOURCES.PRODUCTS}`,
      params
    );
  },
};
