import { ShopModule } from '~/repository/modules/shop';
import { productModule } from '~/repository/modules/product';
import { UploadModule } from '~/repository/modules/upload';
import { cartModule } from '~/repository/modules/cart';
import { OrderModule } from '~/repository/modules/order';
import { CategoryModule } from '~/repository/modules/category';

export default defineNuxtPlugin(() => {
  const modules = {
    cart: cartModule,
    order: new OrderModule(),
    product: productModule,
    category: new CategoryModule(),
    shop: new ShopModule(),
    upload: new UploadModule(),
  };

  return {
    provide: {
      api: modules,
    },
  };
});
