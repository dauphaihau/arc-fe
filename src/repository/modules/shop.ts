import type { IShop } from '~/interfaces/shop';
import { RESOURCES } from '~/config/enums/resources';

export const shopModule = {
  async createShop(payload: Pick<IShop, 'shop_name'>) {
    return await useAsyncData<{ shop: IShop }, ErrorServer>(
      'createShop',
      () => useCustomOFetch.post(`${RESOURCES.SHOPS}`, payload)
    );
  },
};
