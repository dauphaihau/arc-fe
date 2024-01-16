import { shopModule } from '~/repository/modules/shop';
import { productModule } from '~/repository/modules/product';
import { uploadModule } from '~/repository/modules/upload';
import { cartModule } from '~/repository/modules/cart';

export default defineNuxtPlugin(() => {
  const modules = {
    shop: shopModule,
    product: productModule,
    upload: uploadModule,
    cart: cartModule,
  };

  return {
    provide: {
      api: modules,
    },
  };
});
