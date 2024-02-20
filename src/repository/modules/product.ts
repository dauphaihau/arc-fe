import type {
  ResponseGetProducts, GetProductsQueryParams, IProduct,
  GetProductsLowsetPriceQueries
} from '~/interfaces/product';
import type { GetListResponse } from '~/interfaces/common';
import { RESOURCES } from '~/config/enums/resources';

export const productModule = {

  async getProducts(queryParams: GetProductsQueryParams | Ref<GetProductsQueryParams>) {
    return await useCustomFetch.get<GetListResponse<ResponseGetProducts>>(
      `${RESOURCES.PRODUCTS}`,
      queryParams
    );
  },

  async getProductsLowestPrice(
    queryParams: GetProductsLowsetPriceQueries | Ref<GetProductsLowsetPriceQueries>) {
    return await useCustomFetch.delete<GetListResponse<ResponseGetProducts>>(
      `${RESOURCES.PRODUCTS}`,
      queryParams
    );
  },

  async getDetailProduct(id: IProduct['id']) {
    return await useCustomFetch.get<{ product: IProduct }>(
      `${RESOURCES.PRODUCTS}/${id}`
    );
  },
};
