import { RESOURCES } from '~/config/enums/resources';
import type {
  IUpdateCouponsItem, IUpdateProductCart,
  IAddProductCart,
  IResponseGetCart,
  IResponseGetCartForHeaders
} from '~/interfaces/cart';
import type { IProductInventory } from '~/interfaces/product';
import type { ITempOrder } from '~/interfaces/order';

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
    return await useCustomFetch.post<{ tempOrder: ITempOrder }>(
      `${RESOURCES.USER}${RESOURCES.CART}`,
      payload
    );
  },

  async updateProduct(payload: IUpdateProductCart) {
    return await useCustomFetch.patch<{ tempOrder: ITempOrder }>(
      `${RESOURCES.USER}${RESOURCES.CART}`,
      payload
    );
  },

  async updateCouponsItem(payload: IUpdateCouponsItem[]) {
    return await useCustomFetch.put<{ tempOrder: ITempOrder }>(
      `${RESOURCES.USER}${RESOURCES.CART}`,
      payload
    );
  },

  async deleteProduct(id: IProductInventory['id']) {
    return await useCustomFetch.delete<{ tempOrder: ITempOrder }>(
      `${RESOURCES.USER}${RESOURCES.CART}`,
      { inventory: id }
    );
  },
};
