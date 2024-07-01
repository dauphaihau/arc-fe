<script lang="ts" setup>
import type { Shop } from '~/types/shop';
import { useGetProductsLowestPrice } from '~/services/product';

const limit = 6;

const { shopId } = defineProps<{
  shopId: Shop['id']
}>();

const queryParams = computed(() => ({
  shop: shopId,
  limit,
}));

const { data } = useGetProductsLowestPrice(queryParams);
</script>

<template>
  <div>
    <h3 class="mb-4 text-2xl font-medium">
      More from this shop
    </h3>
    <div
      v-if="data?.results"
      class="mb-6 grid grid-cols-6 gap-4"
    >
      <div
        v-for="(product, i) of data.results"
        :key="i"
      >
        <DetailProductCard :product="product" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
