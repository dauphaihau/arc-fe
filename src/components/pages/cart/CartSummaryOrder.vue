<script setup lang="ts">
import { ROUTES } from '~/config/enums/routes';
import { ORDER_CONFIG } from '~/config/enums/order';
import { useGetCart } from '~/services/cart';

const {
  isPending: isPendingGetCart,
  data: dataGetCart,
} = useGetCart();

const isTotalOrderInvalid = computed(() => {
  if (dataGetCart.value) {
    return !(dataGetCart.value.summaryOrder.totalPrice < ORDER_CONFIG.MAX_ORDER_TOTAL);
  }
  return true;
});
</script>

<template>
  <div class="space-y-8">
    <UCard>
      <div class="space-y-7">
        <legend class="mb-1 text-xl font-bold text-gray-700 dark:text-gray-200">
          Order Summary
        </legend>
        <div
          v-if="isPendingGetCart"
          class="grid h-48 place-content-center"
        >
          <LoadingSvg :child-class="'!w-9 !h-9'" />
        </div>
        <div
          v-else-if="dataGetCart?.summaryOrder"
          class="flex flex-col"
        >
          <div class="flex justify-between">
            <div class="title">
              <div> Product(s) total</div>
              <div> Shop discount</div>
            </div>
            <div class="price">
              <div>
                {{ convertCurrency(dataGetCart.summaryOrder?.subTotalPrice) }}
              </div>
              <div class="text-right">
                {{ convertCurrency(dataGetCart.summaryOrder?.totalDiscount) }}
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
                {{ convertCurrency(dataGetCart.summaryOrder?.subTotalAppliedDiscountPrice) }}
              </div>
              <div
                v-if="dataGetCart.summaryOrder?.shippingFee === 0 && dataGetCart.summaryOrder?.totalProducts"
                class="text-right font-normal text-green-600"
              >
                FREE
              </div>
              <div
                v-else
                class="text-right"
              >
                {{ convertCurrency(dataGetCart.summaryOrder?.shippingFee) }}
              </div>
            </div>
          </div>
          <UDivider class="my-3" />
          <div class="flex justify-between gap-3">
            <div class="text-lg font-medium">
              Total ({{ dataGetCart.summaryOrder?.totalProducts }} {{ dataGetCart.summaryOrder?.totalProducts > 1 ? 'products' : 'product' }})
            </div>
            <div :class="['price', dataGetCart.summaryOrder?.totalPrice > 0 && 'text-red-500']">
              {{ convertCurrency(dataGetCart.summaryOrder?.totalPrice) }}
            </div>
          </div>
        </div>
      </div>
    </UCard>
    <div
      v-if="isTotalOrderInvalid"
      class="text-red-500"
    >
      The total amount due must be no more than
      {{ formatCurrency(ORDER_CONFIG.MAX_ORDER_TOTAL) }}
    </div>

    <UButton
      :disabled="isTotalOrderInvalid || dataGetCart?.summaryOrder.totalProducts === 0"
      :ui="{
        rounded: 'shadow-border',
      }"
      block
      class="mx-auto"
      size="xl"
      :to="`${ROUTES.CART}${ROUTES.CHECKOUT}`"
    >
      Proceed to checkout
    </UButton>
  </div>
</template>

<style scoped>
.title {
  @apply text-lg font-normal text-customGray-900
}

.price {
  @apply text-lg font-medium
}
</style>
