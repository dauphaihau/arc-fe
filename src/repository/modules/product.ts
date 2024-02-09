import type { ResponseGetProducts, GetProductsParams, IProduct } from '~/interfaces/product';
import type { GetListResponse } from '~/interfaces/common';
import { RESOURCES } from '~/config/enums/resources';

export const productModule = {

  async getProducts(params: GetProductsParams) {
    return await useCustomFetch.get<GetListResponse<ResponseGetProducts>>(
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
