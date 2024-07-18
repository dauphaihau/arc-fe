<script setup lang="ts">
import { consola } from 'consola';
import type { CreateOrderForBuyNowBody } from '~/types/order';
import { PAYMENT_TYPES } from '~/config/enums/order';
import { toastCustom } from '~/config/toast';
import { ROUTES } from '~/config/enums/routes';
import { useCartStore } from '~/stores/cart';
import { useCreateOrderForBuyNow } from '~/services/order';
import { CHECKOUT_NOW_STEPS } from '~/types/pages/checkout';
import { useGetCurrentUser } from '~/services/user';
import { useGetExchangeRates } from '~/services/market';

const cartStore = useCartStore();
const toast = useToast();
const marketStore = useMarketStore();
const { data: dataUserAuth } = useGetCurrentUser();

const {
  mutateAsync: createOrder,
} = useCreateOrderForBuyNow();

const {
  refetch: refetchGetExchangeRates,
} = useGetExchangeRates({
  enabled: false,
});

const onCreateOrder = async () => {
  try {
    cartStore.stateCheckoutNow.currentStep++;
    if (cartStore.stateCheckoutNow.currentStep !== CHECKOUT_NOW_STEPS.ORDER) {
      return;
    }
    cartStore.stateCheckoutNow.isPendingCreateOrder = true;

    const addressId = cartStore.stateCheckoutNow.address?.id;
    const product = cartStore.stateCheckoutNow.product;
    if (!product.inventory || !addressId) {
      consola.error('addressId or inventoryId be undefined');
      throw new Error();
    }

    const body: CreateOrderForBuyNowBody = {
      payment_type: cartStore.stateCheckoutNow.payment_type,
      address: addressId,
      inventory: product.inventory,
      quantity: product.quantity,
      coupon_codes: product.coupon_codes,
      note: product.note,
    };

    // region validate currency
    const currencySelected = dataUserAuth?.value?.user?.market_preferences?.currency;
    if (!currencySelected || !marketStore.exchangeRate?.rates) {
      consola.error('currency or rates be undefined');
      throw Error();
    }
    body.currency = currencySelected;

    const ratePrev = marketStore.exchangeRate.rates[currencySelected];

    const {
      data: exchangeRates,
    } = await refetchGetExchangeRates();

    if (!exchangeRates?.rates) {
      consola.error('new rates be undefined');
      throw Error();
    }
    const rateNew = exchangeRates.rates[currencySelected];

    if (ratePrev !== rateNew) {
      toast.add({
        ...toastCustom.info,
        title: 'Currency have a update, please recheck',
      });
      cartStore.stateCheckoutNow.isPendingCreateOrder = false;
      cartStore.stateCheckoutNow.countRefreshConvertCurrency++;
      return;
    }
    // endregion validate currency

    if (body.payment_type === PAYMENT_TYPES.CARD) {
      const { checkoutSessionUrl } = await createOrder(body);
      if (!checkoutSessionUrl) {
        consola.error('checkoutSessionUrl be undefined', checkoutSessionUrl);
        throw new Error();
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
    cartStore.stateCheckoutNow.isPendingCreateOrder = false;
    toast.add({
      ...toastCustom.error,
      title: 'Create order failed',
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
    :loading="cartStore.stateCheckoutNow.isPendingCreateOrder"
    :ui="{
      rounded: 'shadow-border',
    }"
    @click="onCreateOrder"
  >
    {{
      cartStore.stateCheckoutNow.currentStep === CHECKOUT_NOW_STEPS.REVIEW_CONFIRMATION ? 'Complete Order' : 'Continue'
    }}
  </UButton>
</template>

<style scoped>

</style>
