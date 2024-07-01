<script lang="ts" setup>
import { useCartStore } from '~/stores/cart';
import { CHECKOUT_CART_STEPS } from '~/types/pages/cart/checkout';
import { useGetCart } from '~/services/cart';

definePageMeta({ layout: 'market', middleware: ['auth'] });

const cartStore = useCartStore();

const {
  data: dataGetCart,
} = useGetCart();

onBeforeUnmount(() => {
  cartStore.resetStateCheckoutCart();
  if (cartStore.additionInfoOrderShops.size) {
    cartStore.additionInfoOrderShops.clear();
  }
});

const steps = ['Billing Address', 'Payment', 'Review & Confirmation'];
</script>

<template>
  <div class="py-16">
    <CheckoutStepper
      v-model="cartStore.stateCheckoutCart.currentStep"
      class="mx-auto mb-24 max-w-[30rem]"
      :steps="steps"
    />
    <div class="grid grid-cols-12 gap-16">
      <div class="col-span-8">
        <CartCheckoutAddressShipping
          v-if="cartStore.stateCheckoutCart.currentStep === CHECKOUT_CART_STEPS.ADDRESS_SHIPPING"
          class="mb-10"
        />
        <CartCheckoutPaymentOptions
          v-if="cartStore.stateCheckoutCart.currentStep === CHECKOUT_CART_STEPS.PAYMENT"
        />

        <div
          v-if="cartStore.stateCheckoutCart.currentStep === CHECKOUT_CART_STEPS.REVIEW_CONFIRMATION
            || cartStore.stateCheckoutCart.currentStep === CHECKOUT_CART_STEPS.ORDER"
        >
          <CartCheckoutReviewShippingAndPayment class="mb-12" />
          <div
            v-for="item of dataGetCart?.cart.items"
            :key="item.id"
          >
            <CartCheckoutOrderShop :data="item" />
          </div>
        </div>
      </div>

      <div class="col-span-4">
        <CartCheckoutSummaryOrder :key="cartStore.stateCheckoutCart.keyRefreshCartSummaryOrderComp" />
        <CartCheckoutCreateOrderBtn />
      </div>
    </div>
  </div>
</template>
