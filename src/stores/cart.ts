import type { ITempOrder } from '~/interfaces/order';
import type { IUpdateCouponsItem } from '~/interfaces/cart';

export const useCartStore = defineStore('cart', () => {
  const shopCodes = ref<IUpdateCouponsItem[]>([]);
  const tempOrder = ref<ITempOrder | null>(null);
  const totalProducts = ref(0);

  const cartHeader = reactive({
    products: [] as Record<'id' | 'title' | 'image_url', string>[],
    restProducts: 0,
  });

  const getShopCodes = computed(() => {
    return shopCodes.value;
  });

  const getCountAllProducts = computed(() => {
    return cartHeader.products.length + cartHeader.restProducts;
  });

  const { $api } = useNuxtApp();
  const config = useRuntimeConfig();

  async function getCartHeader() {
    const { data, error } = await $api.cart.getProductsForHeader();
    if (!error.value && data.value?.cart) {
      cartHeader.products = data.value.cart.products.map((item) => {
        const variant = item.inventory?.variant ?
          ` - ${item.inventory?.variant && item.inventory.variant.replaceAll('-', ' ')}` :
          null;
        return {
          id: item.product._id,
          title: item.product.title + variant,
          image_url: config.public.awsHostBucket + '/' + item.product.image.relative_url,
        };
      });
      cartHeader.restProducts = data.value.cart.restProducts;
    }
  }

  return {
    totalProducts,
    cartHeader,
    shopCodes,
    tempOrder,
    getShopCodes,
    getCountAllProducts,
    getCartHeader,
  };
});
