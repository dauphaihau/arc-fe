<script setup lang="ts">
import type { ISummaryOrder } from '~/interfaces/order';

const { data } = defineProps<{
  data: ISummaryOrder
}>();

const cartStore = useCartStore();
</script>

<template>
  <UCard>
    <div class="space-y-7">
      <legend class="mb-1 text-xl font-bold text-gray-700 dark:text-gray-200">
        Order Summary
      </legend>
      <div class="flex flex-col">
        <div class="flex justify-between">
          <div class="title">
            <div> Product(s) total</div>
            <div> Shop discount</div>
          </div>
          <div class="price">
            <div>
              {{ convertCurrency(data.subTotalPrice) }}
            </div>
            <div class="text-right">
              {{ convertCurrency(data.totalDiscount) }}
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
              {{ convertCurrency(data.subTotalAppliedDiscountPrice) }}
            </div>
            <div
              v-if="data.shippingFee === 0 && cartStore.summaryOrder?.totalProducts"
              class="text-right font-normal text-green-600"
            >
              FREE
            </div>
            <div
              v-else
              class="text-right"
            >
              {{ convertCurrency(data.shippingFee) }}
            </div>
          </div>
        </div>
        <UDivider class="my-3" />
        <div class="flex justify-between gap-3">
          <div class="text-lg font-medium">
            Total ({{ data.totalProducts }} {{ data.totalProducts > 1 ? 'products' : 'product' }})
          </div>
          <div :class="['price', data.totalPrice > 0 && 'text-red-500']">
            {{ convertCurrency(data.totalPrice) }}
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
