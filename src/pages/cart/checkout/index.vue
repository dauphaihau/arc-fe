<script lang="ts" setup>
import { useCartStore } from '~/stores/cart';
import { ROUTES } from '~/config/enums/routes';
import { PAYMENT_TYPES } from '~/config/enums/order';
import type { CreateOrderFromCartBody } from '~/interfaces/order';
import { type IExchangeRate, LOCAL_STORAGE_KEYS } from '~/config/enums/local-storage-keys';
import type { IUser } from '~/interfaces/user';
import { toastCustom } from '~/config/toast';

enum STEPS { ADDRESS_SHIPPING, PAYMENT, REVIEW_CONFIRMATION, ORDER }

definePageMeta({ layout: 'market', middleware: ['auth', 'cart-checkout'] });

const { $api } = useNuxtApp();
const cartStore = useCartStore();
const store = useStore();
const toast = useToast();

onBeforeUnmount(() => {
  if (cartStore.mapAdditionInfoItems.size) {
    cartStore.mapAdditionInfoItems.clear();
  }
});

const state = reactive({
  currentStep: STEPS.ADDRESS_SHIPPING,
  steps: ['Billing Address', 'Payment', 'Review & Confirmation'],
  loadingOrder: false,
  isAddressEmpty: false,
  countRefreshConvertCurrency: 0,
});

const onCreateOrder = async () => {
  state.currentStep++;
  if (state.currentStep !== STEPS.ORDER) {
    return;
  }

  state.loadingOrder = true;

  const { payment_type, address } = cartStore.stateCheckout;

  const body: CreateOrderFromCartBody = {
    payment_type: payment_type as PAYMENT_TYPES,
    address: address.id,
  };

  if (payment_type === PAYMENT_TYPES.CARD) {
    const currencySelected = parseJSON<IUser['market_preferences']>(
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
      state.loadingOrder = false;
      state.countRefreshConvertCurrency++;
      return;
    }
  }

  if (cartStore.mapAdditionInfoItems) {
    body.additionInfoItems = Array
      .from(cartStore.mapAdditionInfoItems)
      .map(([keyShopId, value]) => ({
        shop: keyShopId,
        coupon_codes: value?.coupon_codes || [],
        note: value?.note || '',
      }));
  }

  const { data, error } = await $api.order.createOrderFromCart(body);

  if (error.value) {
    toast.add({
      ...toastCustom.error,
      title: 'Order failed',
    });
    return;
  }

  if (payment_type === PAYMENT_TYPES.CARD && data.value?.checkoutSessionUrl) {
    navigateTo(data.value.checkoutSessionUrl, {
      external: true,
    });
  }
  else {
    navigateTo(ROUTES.SUCCESS);
    cartStore.getCartHeader();
  }
};
</script>

<template>
  <div class="py-16">
    <CheckoutStepper
      class="mx-auto mb-24 max-w-[30rem]"
      :steps="state.steps"
      :step="state.currentStep"
    />
    <div class="grid grid-cols-12 gap-16">
      <div class="col-span-8">
        <CheckoutAddressShipping
          v-if="state.currentStep === STEPS.ADDRESS_SHIPPING"
          class="mb-10"
          @on-address-empty="(val) => state.isAddressEmpty = val"
        />
        <CheckoutPaymentOptions v-if="state.currentStep === STEPS.PAYMENT" />

        <CheckoutReviewAndConfirmation
          v-if="state.currentStep === STEPS.REVIEW_CONFIRMATION
            || state.currentStep === STEPS.ORDER"
          :key="state.countRefreshConvertCurrency"
        />
      </div>

      <div class="col-span-4">
        <CheckoutSummaryOrder
          v-if="cartStore.summaryOrder"
          :key="state.countRefreshConvertCurrency"
          :data="cartStore.summaryOrder"
        />

        <UButton
          class="mx-auto mt-8"
          block
          size="xl"
          :disabled="state.isAddressEmpty"
          :loading="state.loadingOrder"
          :ui="{
            rounded: 'shadow-border',
          }"
          @click="onCreateOrder"
        >
          {{ state.currentStep === STEPS.REVIEW_CONFIRMATION ? 'Complete Order' : 'Continue' }}
        </UButton>
      </div>
    </div>
  </div>
</template>
