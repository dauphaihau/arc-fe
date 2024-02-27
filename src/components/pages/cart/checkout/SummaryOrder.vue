<script setup lang="ts">
import type { ISummaryOrder } from '~/interfaces/order';

const { data } = defineProps<{
  data: ISummaryOrder
}>();

</script>

<template>
  <UCard>
    <div class="space-y-7">
      <legend class="text-gray-700 dark:text-gray-200 mb-1 text-xl font-bold">
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
              {{ formatCurrency(data.subTotalPrice) }}
            </div>
            <div class="text-right">
              {{ formatCurrency(data.totalDiscount) }}
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
              {{ formatCurrency(data.subTotalAppliedDiscountPrice) }}
            </div>
            <div v-if="data.shippingFee === 0" class="text-right text-green-600 font-normal">
              FREE
            </div>
            <div v-else class="text-right">
              {{ formatCurrency(data.shippingFee) }}
            </div>
          </div>
        </div>
        <UDivider class="my-3" />
        <div class="flex justify-between gap-3">
          <div class="text-lg font-medium">
            Total ({{ data.totalProducts }} {{ data.totalProducts > 1 ? 'products' : 'product' }})
          </div>
          <div :class="['price', data.totalPrice > 0 && 'text-red-500']">
            {{ formatCurrency(data.totalPrice) }}
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
