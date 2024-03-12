<script lang="ts" setup>

import { useCartStore } from '~/stores/cart';
import { ROUTES } from '~/config/enums/routes';
import { PAYMENT_TYPES } from '~/config/enums/order';
import type { CreateOrderFromCartBody } from '~/interfaces/order';

definePageMeta({ layout: 'home', middleware: ['auth', 'cart-checkout'] });

const { $api } = useNuxtApp();
const cartStore = useCartStore();
const toast = useToast();

enum STEPS { ADDRESS_SHIPPING, PAYMENT, REVIEW_CONFIRMATION, ORDER }

onBeforeUnmount(() => {
  if (cartStore.mapAdditionInfoItems.size) {
    cartStore.mapAdditionInfoItems.clear();
  }
});

const state = reactive({
  currentStep: STEPS.ADDRESS_SHIPPING,
  steps: ['Billing Address', 'Payment', 'Review & Confirmation'],
  loadingOrder: false,
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
      title: 'Order failed',
      icon: 'i-heroicons-x-circle',
      color: 'red',
    });
    return;
  }

  if (payment_type === PAYMENT_TYPES.CARD && data.value?.checkoutSessionUrl) {
    navigateTo(data.value.checkoutSessionUrl, {
      external: true,
    });
  } else {
    navigateTo(ROUTES.SUCCESS);
    cartStore.getCartHeader();
  }
};

</script>

<template>
  <div class="py-16">
    <CheckoutStepper
      class="mb-24 max-w-[30rem] mx-auto"
      :steps="state.steps"
      :step="state.currentStep"
    />
    <div class="grid grid-cols-12 gap-16">
      <div class="col-span-8">
        <CheckoutAddressShipping
          v-if="state.currentStep === STEPS.ADDRESS_SHIPPING"
          class="mb-10"
        />
        <CheckoutPaymentOptions v-if="state.currentStep === STEPS.PAYMENT" />

        <ReviewAndConfirmation
          v-if="state.currentStep === STEPS.REVIEW_CONFIRMATION
            || state.currentStep === STEPS.ORDER"
        />
      </div>

      <div class="col-span-4">
        <CheckoutSummaryOrder
          v-if="cartStore.summaryOrder"
          :data="cartStore.summaryOrder"
        />

        <UButton
          class="mx-auto mt-8"
          block
          size="xl"
          :loading="state.loadingOrder"
          :ui="{
            rounded: 'shadow-border'
          }"
          @click="onCreateOrder"
        >
          {{ state.currentStep === STEPS.REVIEW_CONFIRMATION ? 'Complete Order' : 'Continue' }}
        </UButton>
      </div>
    </div>
  </div>
</template>
