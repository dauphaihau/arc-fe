<script setup lang="ts">
import { ORDER_CONFIG } from '~/config/enums/order';
import { useGetCart } from '~/services/cart';
import { ROUTES } from '~/config/enums/routes';

const {
  isPending: isPendingGetCart,
  data: dataGetCart,
} = useGetCart();
const router = useRouter();

const isTotalOrderInvalid = computed(() => {
  if (dataGetCart.value) {
    return !(dataGetCart.value.summary_order.total_price < ORDER_CONFIG.MAX_ORDER_TOTAL);
  }
  return true;
});
</script>

<template>
  <div class="space-y-8">
    <SummaryOrderCard
      :loading="isPendingGetCart"
      :summary-order="dataGetCart?.summary_order"
    />
    <div
      v-if="isTotalOrderInvalid"
      class="text-red-500"
    >
      The total amount due must be no more than
      {{ formatCurrency(ORDER_CONFIG.MAX_ORDER_TOTAL) }}
    </div>

    <UButton
      :disabled="isTotalOrderInvalid || dataGetCart?.summary_order.total_products === 0"
      :ui="{
        rounded: 'shadow-border',
      }"
      block
      class="mx-auto"
      size="xl"
      @click="router.push(`${ROUTES.CART}${ROUTES.CHECKOUT}`)"
    >
      Proceed to checkout
    </UButton>
  </div>
</template>

<style scoped>
</style>
