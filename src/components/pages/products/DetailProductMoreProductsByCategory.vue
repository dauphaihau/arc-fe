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
    <h3 class="mb-4 text-3xl font-medium">
      You may also like
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
