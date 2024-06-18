import { ShopModule } from '~/repository/modules/shop';
import { productModule } from '~/repository/modules/product';
import { UploadModule } from '~/repository/modules/upload';
import { cartModule } from '~/repository/modules/cart';
import { OrderModule } from '~/repository/modules/order';
import { AddressModule } from '~/repository/modules/address';
import { CategoryModule } from '~/repository/modules/category';

export default defineNuxtPlugin(() => {
  const modules = {
    shop: new ShopModule(),
    cart: cartModule,
    address: new AddressModule(),
    order: new OrderModule(),
    product: new productModule(),
    category: new CategoryModule(),
    upload: new UploadModule(),
  };

  return {
    provide: {
      api: modules,
    },
  };
});
