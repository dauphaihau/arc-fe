<script setup lang="ts">
import type { ItemCartPopulated } from '~/types/cart';

const { data } = defineProps<{
  data: ItemCartPopulated
}>();

const products = ref(data.products || []);
</script>

<template>
  <UCard
    v-if="products.length > 0"
    :ui="{ base: 'overflow-visible' }"
    class="mb-4"
  >
    <div class="flex flex-col">
      <h3 class="mb-3 text-lg font-medium">
        {{ data.shop?.shop_name }}
      </h3>

      <div>
        <div
          v-for="(product) of products"
          :key="product.id"
        >
          <CartProduct
            v-if="product.is_select_order"
            :data="product"
            :shop-id="data.shop?.id"
          />
        </div>
      </div>

      <UDivider />

      <div class="mt-6 flex w-fit flex-col gap-4">
        <CartAddRemoveCoupons :shop-id="data.shop?.id" />
        <CartAddRemoveNote :data="data" />
      </div>
    </div>
  </UCard>
</template>
