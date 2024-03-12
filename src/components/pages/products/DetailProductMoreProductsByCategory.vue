<script lang="ts" setup>

import type { ICategory } from '~/interfaces/category';

const { $api } = useNuxtApp();

const state = reactive({
  pending: false,
  limit: 12,
});

const { categoryId } = defineProps<{
  categoryId: ICategory['id']
}>();

const { data } = await $api.product.getProductsLowestPrice({
  limit: state.limit,
  category: categoryId,
});

</script>

<template>
  <div>
    <h3 class="text-3xl font-medium mb-4">
      You may also like
    </h3>
    <div v-if="data?.results" class="grid grid-cols-6 gap-4 mb-6">
      <div v-for="(product, i) of data.results" :key="i">
        <DetailProductCard :product="product" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
