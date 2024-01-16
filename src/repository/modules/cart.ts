import { RESOURCES } from '~/config/enums/resources';
import type { IUpdateProductCart, ICart, IAddProductCart } from '~/interfaces/cart';
import type { IProduct } from '~/interfaces/product';

export const cartModule = {

  async getCart() {
    return await useCustomFetch.get<{ cart: ICart }>(
      `${RESOURCES.USER}${RESOURCES.CART}`
    );
  },

  async addProduct(payload: IAddProductCart) {
    return await useCustomFetch.post<{ cart: ICart }>(
      `${RESOURCES.USER}${RESOURCES.CART}`,
      payload
    );
  },

  async updateProduct(payload: IUpdateProductCart) {
    return await useCustomFetch.patch<{ cart: ICart }>(
      `${RESOURCES.USER}${RESOURCES.CART}`,
      payload
    );
  },

  async deleteProduct(id: IProduct['id']) {
    return await useCustomFetch.delete(
      `${RESOURCES.USER}${RESOURCES.CART}`,
      { product: id }
    );
  },
};
