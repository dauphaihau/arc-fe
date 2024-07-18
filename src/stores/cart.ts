import { StatusCodes } from 'http-status-codes';
import type { OrderShop, ResponseCreateOrder } from '~/types/order';
import type { ResponseGetProductsRecentlyAdded } from '~/types/cart';
import type { Shop } from '~/types/shop';
import { useGetProductsRecentlyAdded } from '~/services/cart';
import { CHECKOUT_NOW_STEPS, type StateCheckoutNow } from '~/types/pages/checkout';
import { PAYMENT_TYPES } from '~/config/enums/order';
import type { Coupon } from '~/types/coupon';
import { CHECKOUT_CART_STEPS, type StateCheckoutCart } from '~/types/pages/cart/checkout';
import { ROUTES } from '~/config/enums/routes';

export type AdditionInfoOrderShops = {
  key: Shop['id']
  value: {
    coupon_codes: Coupon['code'][]
    note: OrderShop['note']
  }
};

export const useCartStore = defineStore('cart', () => {
  const router = useRouter();

  const initStateCheckoutNow: StateCheckoutNow = {
    product: {
      quantity: 1,
      coupon_codes: [],
      note: '',
    },
    invalidCodes: new Map<Coupon['code'], string>(),
    currentStep: CHECKOUT_NOW_STEPS.ADDRESS_SHIPPING,
    countRefreshConvertCurrency: 0,
    isPendingCreateOrder: false,
    payment_type: PAYMENT_TYPES.CARD,
    address: null,
  };
  const stateCheckoutNow = reactive<StateCheckoutNow>({ ...initStateCheckoutNow });
  function resetStateCheckoutNow() {
    Object.assign(stateCheckoutNow, initStateCheckoutNow);
  }

  const initStateCheckoutCart: StateCheckoutCart = {
    invalidCodes: new Map<Coupon['code'], string>(),
    currentStep: CHECKOUT_CART_STEPS.ADDRESS_SHIPPING,
    countRefreshConvertCurrency: 0,
    keyRefreshCartSummaryOrderComp: 0,
    isPendingCreateOrder: false,
    payment_type: PAYMENT_TYPES.CARD,
    address: null,
  };
  const stateCheckoutCart = reactive<StateCheckoutCart>({ ...initStateCheckoutCart });
  function resetStateCheckoutCart() {
    Object.assign(stateCheckoutCart, initStateCheckoutCart);
  }

  // use in cart, cart/checkout page
  const additionInfoOrderShops = ref(new Map<AdditionInfoOrderShops['key'], AdditionInfoOrderShops['value']>());

  // use for checkout by cash
  const orderShops = ref<ResponseCreateOrder['orderShops']>([]);

  watch(router.currentRoute, () => {
    if (additionInfoOrderShops.value.size && router.currentRoute.value.path !== `${ROUTES.CART}${ROUTES.CHECKOUT}`) {
      additionInfoOrderShops.value.clear();
    }
  });

  const cartHeader = reactive({
    products: [] as Record<'id' | 'title' | 'image_url', string>[],
    restProducts: 0,
  });

  const getCountAllProducts = computed(() => {
    return cartHeader.products.length + cartHeader.restProducts;
  });

  const {
    refetch,
  } = useGetProductsRecentlyAdded({
    onResponse: ({ response }) => {
      const responseGetCart: ResponseGetProductsRecentlyAdded = response._data;
      if (response.status === StatusCodes.OK && responseGetCart) {
        cartHeader.products = responseGetCart.cart.products.map((item) => {
          const variant = item.inventory?.variant ?
            ` - ${item.inventory?.variant && item.inventory.variant.replaceAll('-', ' ')}` :
            null;
          return {
            id: item.product._id,
            title: item.product.title + variant,
            image_url: `domainAwsS3/${item.product.image.relative_url}`,
          };
        });
        cartHeader.restProducts = responseGetCart.cart.restProducts;
      }
    },
  });

  return {
    cartHeader,
    getCountAllProducts,
    getProductsRecentlyAdded: () => refetch(),
    resetStateCheckoutNow,
    orderShops,
    // itemsCart,
    stateCheckoutNow,
    stateCheckoutCart,
    resetStateCheckoutCart,
    additionInfoOrderShops,
  };
});
