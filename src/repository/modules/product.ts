import type {
  ResponseGetProducts, GetProductsQueryParams, IProduct,
  GetProductsLowestPriceQueries,
  ResponseGetDetailProduct
} from '~/interfaces/product';
import type { GetListResponse } from '~/interfaces/common';
import { RESOURCES } from '~/config/enums/resources';

export class productModule {
  async getProducts(queryParams: GetProductsQueryParams | Ref<GetProductsQueryParams>) {
    return await useCustomFetch.get<GetListResponse<ResponseGetProducts>>(
      `${RESOURCES.PRODUCTS}`,
      queryParams
    );
  }

  async getProductsLowestPrice(
    queryParams: GetProductsLowestPriceQueries | Ref<GetProductsLowestPriceQueries>) {
    return await useCustomFetch.delete<GetListResponse<ResponseGetProducts>>(
      `${RESOURCES.PRODUCTS}`,
      queryParams
    );
  }

  async getDetailProduct(id: IProduct['id']) {
    return await useCustomFetch.get<ResponseGetDetailProduct>(
      `${RESOURCES.PRODUCTS}/${id}`
    );
  }
}
