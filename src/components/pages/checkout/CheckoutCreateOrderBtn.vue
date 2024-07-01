<script setup lang="ts">
import consola from 'consola';
import type { CreateOrderForBuyNowBody } from '~/types/order';
import { PAYMENT_TYPES } from '~/config/enums/order';
import type { User } from '~/types/user';
import { type IExchangeRate, LOCAL_STORAGE_KEYS } from '~/config/enums/local-storage-keys';
import { toastCustom } from '~/config/toast';
import { MARKET_CONFIG } from '~/config/enums/market';
import { ROUTES } from '~/config/enums/routes';
import { useCartStore } from '~/stores/cart';
import { useCreateOrderForBuyNow } from '~/services/order';
import { CHECKOUT_NOW_STEPS } from '~/types/pages/checkout';

const cartStore = useCartStore();
const toast = useToast();
const store = useStore();

const {
  mutateAsync: createOrder,
} = useCreateOrderForBuyNow();

const onCreateOrder = async () => {
  cartStore.stateCheckoutNow.currentStep++;
  if (cartStore.stateCheckoutNow.currentStep !== CHECKOUT_NOW_STEPS.ORDER) {
    return;
  }
  cartStore.stateCheckoutNow.loadingSubmit = true;

  const addressId = cartStore.stateCheckoutNow.address?.id;
  const product = cartStore.stateCheckoutNow.product;
  if (!product.inventory || !addressId) {
    consola.error('Some fields be undefined');
    return;
  }

  const body: CreateOrderForBuyNowBody = {
    payment_type: cartStore.stateCheckoutNow.payment_type,
    address: addressId,
    inventory: product.inventory,
    quantity: product.quantity,
    coupon_codes: product.coupon_codes,
    note: product.note,
  };

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
  if (currencySelected !== MARKET_CONFIG.BASE_CURRENCY) {
    // validate currency
    const exchangeRate = parseJSON<IExchangeRate>(localStorage[LOCAL_STORAGE_KEYS.EXCHANGE_RATE]);
    const prevRate = exchangeRate?.rates[currencySelected];
    await store.getExchangeRates();
    if (!store.rates) {
      toast.add({
        ...toastCustom.error,
        title: 'Oops',
        description: 'Something wrong',
      });
      return;
    }
    const newRate = store.rates[currencySelected];
    if (prevRate !== newRate) {
      toast.add({
        ...toastCustom.info,
        title: 'Currency have a update, please recheck',
      });
      cartStore.stateCheckoutNow.loadingSubmit = false;
      cartStore.stateCheckoutNow.countRefreshConvertCurrency++;
      return;
    }
  }

  try {
    // const response: ResponseCreateOrderForBuyNow<typeof cartStore.stateCheckoutNow.payment_type> = await createOrder(body);
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
    }
  }
  catch (error) {
    toast.add({
      ...toastCustom.error,
      title: 'Order failed',
    });
  }
};
</script>

<template>
  <UButton
    class="mx-auto mt-8"
    block
    size="xl"
    :disabled="!cartStore.stateCheckoutNow.address"
    :loading="cartStore.stateCheckoutNow.loadingSubmit"
    :ui="{
      rounded: 'shadow-border',
    }"
    @click="onCreateOrder"
  >
    {{ cartStore.stateCheckoutNow.currentStep === CHECKOUT_NOW_STEPS.REVIEW_CONFIRMATION ? 'Complete Order' : 'Continue' }}
  </UButton>
</template>

<style scoped>

</style>
