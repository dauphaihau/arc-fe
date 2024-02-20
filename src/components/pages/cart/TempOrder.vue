<script setup lang="ts">
import type { ITempOrder } from '~/interfaces/order';
import { PAYMENT_TYPES } from '~/config/enums/order';

const { data } = defineProps<{ data: ITempOrder }>();
const { $api } = useNuxtApp();
const toast = useToast();
const cartStore = useCartStore();

const paymentSelected = ref(PAYMENT_TYPES.CARD);

const paymentTypes = [
  { value: PAYMENT_TYPES.CARD, label: 'Card' },
  { value: PAYMENT_TYPES.CASH, label: 'Cash on delivery' },
];

const checkout = async () => {
  const { data, error } = await $api.order.createOrder({
    payment_type: paymentSelected.value,
    address: '65bc85321fb403b1d2cda326',
    shops_codes: cartStore.shopCodes,
  });
  if (error.value) {
    toast.add({ title: 'Order failed' });
    return;
  }

  if (paymentSelected.value === PAYMENT_TYPES.CARD && data.value?.checkoutSessionUrl) {
    navigateTo(data.value.checkoutSessionUrl, {
      external: true,
    });
  } else {
    // navigator('success page')
  }
};

</script>

<template>
  <div class="space-y-7">
    <div class="flex flex-col gap-4">
      <URadioGroup
        v-model="paymentSelected"
        legend="How you'll pay"
        :options="paymentTypes"
        :ui="{
          legend: 'text-base font-bold'
        }"
      />
    </div>
    <div class="flex flex-col">
      <div class="flex justify-between">
        <div class="text-lg font-bold">
          <div> Product(s) total</div>
          <div> Shop discount</div>
        </div>
        <div class="text-lg">
          <div>
            {{ formatCurrency(data.subTotalPrice) }}
          </div>
          <div class="text-right">
            {{ formatCurrency(data.totalDiscount) }}
          </div>
        </div>
      </div>
      <UDivider class="my-2" />
      <div class="flex justify-between gap-3">
        <div class="text-lg">
          <div> Subtotal</div>
          <div> Shipping</div>
        </div>
        <div class="text-lg">
          <div>
            {{ formatCurrency(data.subTotalAppliedDiscountPrice) }}
          </div>
          <div class="text-right">
            {{ formatCurrency(data.shippingFee) }}
          </div>
        </div>
      </div>
      <UDivider class="my-2" />
      <div class="flex justify-between gap-3">
        <div class="text-lg font-bold">
          Total ({{ data.totalProducts }} {{ data.totalProducts > 1 ? 'products' : 'product' }})
        </div>
        <div class="text-lg text-right">
          {{ formatCurrency(data.totalPrice) }}
        </div>
      </div>

      <UButton
        class="mx-auto mt-4"
        block
        size="xl"
        :disabled="data.totalProducts === 0"
        @click="checkout"
      >
        Proceed to checkout
      </UButton>
    </div>
  </div>
</template>
