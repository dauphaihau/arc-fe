<script setup lang="ts">
import dayjs from 'dayjs';
import type { ResponseGetOrderShops } from '~/types/order';
import { ORDER_SHIPPING_STATUSES } from '~/config/enums/order';

const { orderShop } = defineProps<{
  orderShop: ResponseGetOrderShops['orderShop']
}>();

const shippingStatus = {
  [ORDER_SHIPPING_STATUSES.SHIPPED]: 'Shipped',
  [ORDER_SHIPPING_STATUSES.PRE_TRANSIT]: 'Pre-transit',
  [ORDER_SHIPPING_STATUSES.IN_TRANSIT]: 'In transit',
  [ORDER_SHIPPING_STATUSES.DELIVERED]: 'Delivered',
};

const estimatedDelivery = computed(() => {
  if (dayjs(orderShop.estimated_delivery).isValid()) {
    return dayjs(orderShop.estimated_delivery).format('MMM DD');
  }
  return '';
});

const fromCountries = computed(() => {
  if (!orderShop.from_countries) return;
  return orderShop.from_countries.toString().replace(',', ', ');
});
</script>

<template>
  <div>
    <div class="text-2xl font-medium">
      {{ shippingStatus[orderShop.shipping_status] }}
    </div>
    <div class="mt-2 space-y-1.5 text-[15px] text-zinc-500">
      <!--      <div> -->
      <!--        on Nov 11, 2024 -->
      <!--      </div> -->
      <div>
        From {{ fromCountries }}
      </div>
      <div>
        Estimated delivery: {{ estimatedDelivery }}
      </div>
    </div>
    <div class="mt-4 flex w-5/6 flex-col gap-4">
      <UTooltip text="Feature not available">
        <UButton
          block
          size="md"
        >
          Track package
        </UButton>
      </UTooltip>
      <UTooltip text="Feature not available">
        <UButton
          block
          size="md"
          color="gray"
        >
          Help with order
        </UButton>
      </UTooltip>
      <UTooltip text="Feature not available">
        <UButton
          block
          size="md"
          color="gray"
        >
          View receipt
        </UButton>
      </UTooltip>
    </div>
  </div>
</template>

<style scoped>

</style>
