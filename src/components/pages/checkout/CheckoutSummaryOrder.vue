<script setup lang="ts">
import { useGetSummaryOder } from '~/services/order';

const cartStore = useCartStore();

const bodyComputed = computed(() => {
  const product = cartStore.stateCheckoutNow.product;
  if (product?.inventory) {
    return {
      inventory: product.inventory,
      quantity: product.quantity,
    };
  }
  return undefined;
});

const {
  isPending: isPendingGetSummaryOder,
  data: dataGetSummaryOder,
} = useGetSummaryOder(bodyComputed);
</script>

<template>
  <UCard>
    <div class="space-y-7">
      <legend class="mb-1 text-xl font-bold text-gray-700 dark:text-gray-200">
        Order Summary
      </legend>
      <div
        v-if="isPendingGetSummaryOder"
        class="grid h-48 place-content-center"
      >
        <LoadingSvg :child-class="'!w-9 !h-9'" />
      </div>
      <div
        v-else-if="dataGetSummaryOder?.summaryOrder"
        class="flex flex-col"
      >
        <div class="flex justify-between">
          <div class="title">
            <div> Product(s) total</div>
            <div> Shop discount</div>
          </div>
          <div class="price">
            <div>
              {{ convertCurrency(dataGetSummaryOder?.summaryOrder?.subTotalPrice) }}
            </div>
            <div class="text-right">
              {{ convertCurrency(dataGetSummaryOder?.summaryOrder?.totalDiscount) }}
            </div>
          </div>
        </div>
        <UDivider class="my-3" />
        <div class="flex justify-between gap-3">
          <div class="title">
            <div> Subtotal</div>
            <div> Shipping</div>
          </div>
          <div class="price">
            <div>
              {{ convertCurrency(dataGetSummaryOder?.summaryOrder?.subTotalAppliedDiscountPrice) }}
            </div>
            <div
              v-if="dataGetSummaryOder?.summaryOrder?.shippingFee === 0
                && dataGetSummaryOder?.summaryOrder?.totalProducts"
              class="text-right font-normal text-green-600"
            >
              FREE
            </div>
            <div
              v-else
              class="text-right"
            >
              {{ convertCurrency(dataGetSummaryOder?.summaryOrder?.shippingFee) }}
            </div>
          </div>
        </div>
        <UDivider class="my-3" />
        <div class="flex justify-between gap-3">
          <div class="text-lg font-medium">
            Total ({{ dataGetSummaryOder?.summaryOrder?.totalProducts }} {{ dataGetSummaryOder?.summaryOrder?.totalProducts > 1 ? 'products' : 'product' }})
          </div>
          <div :class="['price', dataGetSummaryOder?.summaryOrder?.totalPrice > 0 && 'text-red-500']">
            {{ convertCurrency(dataGetSummaryOder?.summaryOrder?.totalPrice) }}
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<style scoped>
.title {
  @apply text-lg font-normal text-customGray-900
}

.price {
  @apply text-lg font-medium
}
</style>
