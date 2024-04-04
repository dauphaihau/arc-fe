<script lang="ts" setup>

import { PAYMENT_TYPES } from '~/config/enums/order';

definePageMeta({ layout: 'market', middleware: ['auth'] });

const cartStore = useCartStore();

const paymentOptions = [
  { value: PAYMENT_TYPES.CARD, label: 'Credit / Debit Card', description: 'We support Mastercard, Visa and Stripe' },
  { value: PAYMENT_TYPES.CASH, label: 'Cash on delivery', description: 'Pay with cash when your order is delivered' },
];

const payment_type = ref(PAYMENT_TYPES.CARD);

onMounted(() => {
  cartStore.stateCheckout.payment_type = PAYMENT_TYPES.CARD;
});

watch(() => payment_type.value, () => {
  cartStore.stateCheckout.payment_type = payment_type.value;
});

</script>

<template>
  <UCard>
    <div class="flex flex-col gap-4">
      <legend class="text-gray-700 dark:text-gray-200 mb-1 text-xl font-bold">
        Payment options
      </legend>
      <URadioGroup
        v-model="payment_type"
        :options="paymentOptions"
        :ui="{
          legend: 'text-base font-bold',
        }"
      >
        <template #label="{ option }">
          <div class="flex flex-col gap-1 w-full mb-6">
            <div class="text-customGray-950 font-semibold leading-0">
              {{ option.label }}
            </div>
            <div class="text-gray-500 font-normal">
              {{ option.description }}
            </div>
          </div>
        </template>
      </URadioGroup>
    </div>
  </UCard>
</template>
