// import type { IUser, LoginPayloadType } from '~/interfaces/user';

import type { ITempOrder } from '~/interfaces/order';
import type { IUpdateCouponsItem } from '~/interfaces/cart';

export const useCartStore = defineStore('cart', {
  state: () => ({
    shopCodes: [] as IUpdateCouponsItem[],
    tempOrder: null as ITempOrder | null,
  }),
  getters: {
    getShopCodes: state => state.shopCodes,
  },
  actions: {},
});
