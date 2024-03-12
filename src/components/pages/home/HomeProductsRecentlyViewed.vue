<script lang="ts" setup>

import { SESSION_STORAGE_KEYS } from '~/config/enums/session-storage-keys';
import type { ResponseGetProducts } from '~/interfaces/product';
import type { IUserActivitiesSessionStorage } from '~/interfaces/common';

const { $api } = useNuxtApp();

const state = reactive({
  pending: false,
  limit: 10,
  products: [] as ResponseGetProducts[],
});

const categoryId = computed(() => {
  const userActivities = parseJSON<IUserActivitiesSessionStorage>(
    sessionStorage.getItem(SESSION_STORAGE_KEYS.USER_ACTIVITIES
    ));
  return userActivities?.categoryProductVisited || '';
});

onMounted(async () => {
  if (categoryId.value) {
    const { data, error } = await $api.product.getProductsLowestPrice({
      limit: state.limit,
      category: categoryId.value,
    });
    if (!error.value && data.value?.results) {
      state.products = data.value?.results;
    }
  }
});


</script>

<template>
  <div v-if="state.products && state.products.length > 0">
    <h3 class="text-lg font-medium mb-3">
      Recently viewed & more
    </h3>
    <div class="grid grid-cols-5 gap-4 mb-6">
      <div v-for="(product, i) of state.products" :key="i">
        <HomeProductCard :product="product" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
