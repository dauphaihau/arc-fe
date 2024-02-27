import { RESOURCES } from '~/config/enums/resources';
import type {
  IUpdateCouponsItem, IUpdateProductCart,
  IAddProductCart,
  IResponseGetCart,
  IResponseGetCartForHeaders
} from '~/interfaces/cart';
import type { IProductInventory } from '~/interfaces/product';
import type { ISummaryOrder } from '~/interfaces/order';

export const cartModule = {

  async getCart() {
    return await useCustomFetch.get<IResponseGetCart>(
      `${RESOURCES.USER}${RESOURCES.CART}`
    );
  },

  async getProductsForHeader() {
    return await useCustomFetch.get<IResponseGetCartForHeaders>(
      `${RESOURCES.USER}${RESOURCES.CART}`,
      { type: 'header' }
    );
  },

  async addProduct(payload: IAddProductCart) {
    return await useCustomFetch.post<{ summaryOrder: ISummaryOrder }>(
      `${RESOURCES.USER}${RESOURCES.CART}`,
      payload
    );
  },

  async updateProduct(body: IUpdateProductCart) {
    return await useCustomFetch.patch<{ summaryOrder: ISummaryOrder }>(
      `${RESOURCES.USER}${RESOURCES.CART}`,
      body
    );
  },

  async updateCouponsItem(payload: IUpdateCouponsItem[]) {
    return await useCustomFetch.put<{ summaryOrder: ISummaryOrder }>(
      `${RESOURCES.USER}${RESOURCES.CART}`,
      payload
    );
  },

  async deleteProduct(id: IProductInventory['id']) {
    return await useCustomFetch.delete<{ summaryOrder: ISummaryOrder }>(
      `${RESOURCES.USER}${RESOURCES.CART}`,
      { inventory: id }
    );
  },
};
