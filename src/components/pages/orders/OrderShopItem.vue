<script setup lang="ts">
import dayjs from 'dayjs';
import type { ResponseGetOrderShops } from '~/types/order';
import OrderActions from '~/components/pages/orders/OrderActions.vue';
import OrderProduct from '~/components/pages/orders/OrderProduct.vue';

const { orderShop } = defineProps<{
  orderShop: ResponseGetOrderShops['orderShop']
}>();

const orderedAt = computed(() => {
  if (dayjs(orderShop.createdAt).isValid()) {
    return dayjs(orderShop.createdAt).format('MMM DD, YYYY');
  }
  return '';
});
</script>

<template>
  <div class="mb-16 grid grid-cols-12 gap-16">
    <div class="col-span-8">
      <UCard class="relative">
        <div class="shadow-border absolute -left-1 -top-4 flex w-[101%] justify-between rounded-md border border-zinc-200/50 bg-[#f5f5f5] px-4 py-3 text-zinc-500">
          <div>
            Ordered from {{ orderShop.shop.shop_name }} on {{ orderedAt }}
          </div>
          <div>
            {{ convertCurrency(orderShop.total) }}
          </div>
        </div>

        <div
          v-for="(product, idx) of orderShop.products"
          :key="idx"
        >
          <OrderProduct :data="product" />
        </div>

        <UDivider
          v-if="orderShop.note"
          class="mb-3 mt-6"
        />

        <div v-if="orderShop.note">
          <div>Shop note</div>
          <div class="text-zinc-500/80">
            {{ orderShop.note }}
          </div>
        </div>
      </UCard>
    </div>

    <OrderActions
      :order-shop="orderShop"
      class="col-span-3 -mt-5"
    />
  </div>
</template>

<style scoped>

</style>
