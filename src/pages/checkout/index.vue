<script lang="ts" setup>
import { useCartStore } from '~/stores/cart';
import { CHECKOUT_NOW_STEPS } from '~/types/pages/checkout';
import CheckoutCreateOrderBtn from '~/components/pages/checkout/CheckoutCreateOrderBtn.vue';

definePageMeta({ layout: 'market', middleware: ['auth', 'checkout'] });

const cartStore = useCartStore();

const steps = ['Billing Address', 'Payment', 'Review & Confirmation'];

onUnmounted(() => {
  cartStore.resetStateCheckoutNow();
});
</script>

<template>
  <div class="py-16">
    <CheckoutStepper
      v-model="cartStore.stateCheckoutNow.currentStep"
      class="mx-auto mb-24 max-w-[30rem]"
      :steps="steps"
      :disabled="cartStore.stateCheckoutNow.isPendingCreateOrder"
    />
    <div class="grid grid-cols-12 gap-16">
      <div class="col-span-8">
        <CheckoutAddressShipping
          v-if="cartStore.stateCheckoutNow.currentStep === CHECKOUT_NOW_STEPS.ADDRESS_SHIPPING"
          class="mb-10"
        />

        <CheckoutPaymentOptions
          v-if="cartStore.stateCheckoutNow.currentStep === CHECKOUT_NOW_STEPS.PAYMENT"
        />

        <div
          v-if="cartStore.stateCheckoutNow.currentStep === CHECKOUT_NOW_STEPS.REVIEW_CONFIRMATION
            || cartStore.stateCheckoutNow.currentStep === CHECKOUT_NOW_STEPS.ORDER"
        >
          <CheckoutReviewShippingAndPayment class="mb-12" />
          <CheckoutOrderShop />
        </div>
      </div>

      <div class="col-span-4">
        <CheckoutSummaryOrder />
        <CheckoutCreateOrderBtn />
      </div>
    </div>
  </div>
</template>
