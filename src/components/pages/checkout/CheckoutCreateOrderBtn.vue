<script setup lang="ts">
import { consola } from 'consola';
import { PAYMENT_TYPES } from '~/config/enums/order';
import { toastCustom } from '~/config/toast';
import { ROUTES } from '~/config/enums/routes';
import { useCartStore } from '~/stores/cart';
import { useCreateOrderForBuyNow } from '~/services/order';
import { CHECKOUT_NOW_STEPS } from '~/types/pages/checkout';
import { useGetCurrentUser } from '~/services/user';
import { useGetExchangeRates } from '~/services/market';
import type { CreateOrderForBuyNowBody } from '~/types/request-api/order';
import type { Cart } from '~/types/cart';

const cartStore = useCartStore();
const toast = useToast();
const marketStore = useMarketStore();
const { data: dataUserAuth } = useGetCurrentUser();

const route = useRoute();
const tempCartId = route.query['c'] as Cart['id'];

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

    if (!addressId) {
      consola.error('addressId be undefined');
      throw new Error();
    }

    const body: CreateOrderForBuyNowBody = {
      cart_id: tempCartId,
      payment_type: cartStore.stateCheckoutNow.payment_type,
      user_address_id: addressId,
      promo_codes: cartStore.stateCheckoutNow.promo_codes,
      note: cartStore.stateCheckoutNow.note,
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
      const { checkout_session_url } = await createOrder(body);
      if (!checkout_session_url) {
        consola.error('checkout_session_url be undefined', checkout_session_url);
        throw new Error();
      }
      navigateTo(checkout_session_url, {
        external: true,
      });
    }
    else {
      const { order_shops } = await createOrder(body);
      cartStore.orderShops = order_shops;
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
