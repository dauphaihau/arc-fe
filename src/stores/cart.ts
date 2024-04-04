import type { ILineItemOrder, ISummaryOrder } from '~/interfaces/order';
import type { IAddress } from '~/interfaces/address';
import type { IItemCartPopulated, IStateProductCheckoutNow } from '~/interfaces/cart';

export const useCartStore = defineStore('cart', () => {
  const summaryOrderPrev = ref<ISummaryOrder | null>(null);
  const summaryOrder = ref<ISummaryOrder | null>(null);

  const totalProductsCart = ref(0);
  const productCheckoutNow = ref<IStateProductCheckoutNow>();
  const itemsCart = ref<IItemCartPopulated[]>([]);

  const stateCheckout = ref({
    payment_type: '',
    address: {} as IAddress,
  });

  const mapAdditionInfoItems = ref(new Map<string, Partial<Pick<ILineItemOrder, 'note' | 'coupon_codes'>>>());
  const additionInfoItems = ref({});

  watch(() => summaryOrder.value, (_, oldVal) => {
    if (oldVal) {
      summaryOrderPrev.value = oldVal;
    }
  });

  const cartHeader = reactive({
    products: [] as Record<'id' | 'title' | 'image_url', string>[],
    restProducts: 0,
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
    totalProductsCart,
    cartHeader,
    summaryOrder,
    getCountAllProducts,
    getCartHeader,
    productCheckoutNow,
    additionInfoItems,
    stateCheckout,
    summaryOrderPrev,
    mapAdditionInfoItems,
    itemsCart,
  };
});
