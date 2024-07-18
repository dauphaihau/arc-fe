<script setup lang="ts">
import { consola } from 'consola';
import { CHECKOUT_CART_STEPS } from '~/types/pages/cart/checkout';
import type { CreateOrderFromCartBody } from '~/types/order';
import { PAYMENT_TYPES } from '~/config/enums/order';
import { toastCustom } from '~/config/toast';
import { ROUTES } from '~/config/enums/routes';
import { useCreateOrderFromCart } from '~/services/order';
import { useCartStore } from '~/stores/cart';
import { useGetExchangeRates } from '~/services/market';
import { useGetCurrentUser } from '~/services/user';

const marketStore = useMarketStore();
const toast = useToast();
const cartStore = useCartStore();
const { data: dataUserAuth } = useGetCurrentUser();

const {
  mutateAsync: createOrder,
} = useCreateOrderFromCart();

const {
  refetch: refetchGetExchangeRates,
} = useGetExchangeRates({
  enabled: false,
});

const onCreateOrder = async () => {
  try {
    cartStore.stateCheckoutCart.currentStep++;
    if (cartStore.stateCheckoutCart.currentStep !== CHECKOUT_CART_STEPS.ORDER) {
      return;
    }

    cartStore.stateCheckoutCart.isPendingCreateOrder = true;

    const addressId = cartStore.stateCheckoutCart.address?.id;
    if (!addressId) {
      consola.error('addressId be undefined');
      throw Error();
    }

    const body: CreateOrderFromCartBody = {
      payment_type: cartStore.stateCheckoutCart.payment_type,
      address: addressId,
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
      cartStore.stateCheckoutCart.isPendingCreateOrder = false;
      cartStore.stateCheckoutCart.countRefreshConvertCurrency++;
      return;
    }
    // endregion validate currency

    body.additionInfoItems = Array
      .from(cartStore.additionInfoOrderShops)
      .map(([shopId, value]) => ({
        shop: shopId,
        coupon_codes: value.coupon_codes,
        note: value.note,
      }));

    if (body.payment_type === PAYMENT_TYPES.CARD) {
      const { checkoutSessionUrl } = await createOrder(body);
      if (!checkoutSessionUrl) {
        consola.error('checkoutSessionUrl be undefined', checkoutSessionUrl);
        throw Error();
      }
      navigateTo(checkoutSessionUrl, {
        external: true,
      });
    }
    else {
      const { orderShops } = await createOrder(body);
      cartStore.orderShops = orderShops;
      navigateTo(ROUTES.SUCCESS);
      cartStore.getProductsRecentlyAdded();
    }
  }
  catch (error) {
    cartStore.stateCheckoutCart.isPendingCreateOrder = false;
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
