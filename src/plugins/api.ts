import { shopModule } from '~/repository/modules/shop';
import { productModule } from '~/repository/modules/product';
import { uploadModule } from '~/repository/modules/upload';

export default defineNuxtPlugin(() => {
  const modules = {
    shop: shopModule,
    product: productModule,
    upload: uploadModule,
  };

  return {
    provide: {
      api: modules,
    },
  };
});
