<script lang="ts" setup>
import type { IShop } from '~/interfaces/shop';

const { $api } = useNuxtApp();

const state = reactive({
  pending: false,
  limit: 6,
});

const { shopId } = defineProps<{
  shopId: IShop['id']
}>();

const { data } = await $api.product.getProductsLowestPrice({
  limit: state.limit,
  shop: shopId,
});
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
