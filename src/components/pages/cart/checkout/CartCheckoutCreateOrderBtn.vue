<script setup lang="ts">
import consola from 'consola';
import { CHECKOUT_CART_STEPS } from '~/types/pages/cart/checkout';
import type { CreateOrderFromCartBody } from '~/types/order';
import { PAYMENT_TYPES } from '~/config/enums/order';
import type { User } from '~/types/user';
import { type IExchangeRate, LOCAL_STORAGE_KEYS } from '~/config/enums/local-storage-keys';
import { toastCustom } from '~/config/toast';
import { ROUTES } from '~/config/enums/routes';
import { useCreateOrderFromCart } from '~/services/order';
import { useCartStore } from '~/stores/cart';

const store = useStore();
const toast = useToast();
const cartStore = useCartStore();

const {
  mutateAsync: createOrder,
} = useCreateOrderFromCart();

const onCreateOrder = async () => {
  cartStore.stateCheckoutCart.currentStep++;
  if (cartStore.stateCheckoutCart.currentStep !== CHECKOUT_CART_STEPS.ORDER) {
    return;
  }

  cartStore.stateCheckoutCart.isPendingCreateOrder = true;

  const addressId = cartStore.stateCheckoutCart.address?.id;
  if (!addressId) {
    consola.error('Some fields be undefined');
    return;
  }

  const body: CreateOrderFromCartBody = {
    payment_type: cartStore.stateCheckoutCart.payment_type,
    address: addressId,
  };

  if (cartStore.stateCheckoutCart.payment_type === PAYMENT_TYPES.CARD) {
    const currencySelected = parseJSON<User['market_preferences']>(
      localStorage[LOCAL_STORAGE_KEYS.USER_PREFERENCES]
    )?.currency;
    if (!currencySelected) {
      toast.add({
        ...toastCustom.error,
        title: 'Oops',
        description: 'Something wrong',
      });
      return;
    }
    body.currency = currencySelected;

    // validate currency
    const exchangeRate = parseJSON<IExchangeRate>(localStorage[LOCAL_STORAGE_KEYS.EXCHANGE_RATE]);
    const ratePrev = exchangeRate?.rates[currencySelected];
    await store.getExchangeRates();
    if (!store.rates) {
      toast.add({
        ...toastCustom.error,
        title: 'Oops',
        description: 'Something wrong',
      });
      return;
    }
    const rateNew = store.rates[currencySelected];
    if (ratePrev !== rateNew) {
      toast.add({
        ...toastCustom.info,
        title: 'Currency have a update, please recheck',
      });
      cartStore.stateCheckoutCart.isPendingCreateOrder = false;
      cartStore.stateCheckoutCart.countRefreshConvertCurrency++;
      return;
    }
  }

  body.additionInfoItems = Array
    .from(cartStore.additionInfoOrderShops)
    .map(([shopId, value]) => ({
      shop: shopId,
      coupon_codes: value.coupon_codes,
      note: value.note,
    }));

  try {
    if (body.payment_type === PAYMENT_TYPES.CARD) {
      const { checkoutSessionUrl } = await createOrder(body);
      if (!checkoutSessionUrl) {
        consola.error('checkoutSessionUrl be undefined', checkoutSessionUrl);
        toast.add({
          ...toastCustom.error,
          title: 'Oops',
          description: 'Something wrong',
        });
        return;
      }
      navigateTo(checkoutSessionUrl, {
        external: true,
      });
    }
    else {
      const { orderShops } = await createOrder(body);
      cartStore.orderShops = orderShops;
      navigateTo(ROUTES.SUCCESS);
      cartStore.getCartHeader();
    }
  }
  catch (error) {
    toast.add({
      ...toastCustom.error,
      title: 'Order failed',
    });
  }
  cartStore.stateCheckoutCart.isPendingCreateOrder = false;
};
</script>

<template>
  <UButton
    class="mx-auto mt-8"
    block
    size="xl"
    :disabled="!cartStore.stateCheckoutCart.address"
    :loading="cartStore.stateCheckoutCart.isPendingCreateOrder"
    :ui="{
      rounded: 'shadow-border',
    }"
    @click="onCreateOrder"
  >
    {{ cartStore.stateCheckoutCart.currentStep === CHECKOUT_CART_STEPS.REVIEW_CONFIRMATION ? 'Complete Order' : 'Continue' }}
  </UButton>
</template>

<style scoped>

</style>
