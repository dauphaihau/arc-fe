<script lang="ts" setup>
import { SESSION_STORAGE_KEYS } from '~/config/enums/session-storage-keys';
import type { ResponseGetProducts } from '~/interfaces/product';
import type { IUserActivitiesSessionStorage } from '~/interfaces/common';

const { $api } = useNuxtApp();

const state = reactive({
  loading: true,
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
    const { data, error, pending } = await $api.product.getProductsLowestPrice({
      limit: state.limit,
      category: categoryId.value,
    });
    state.loading = pending.value;
    if (!error.value && data.value?.results) {
      state.products = data.value?.results;
    }
  }
});
</script>

<template>
  <div v-if="categoryId">
    <div v-if="state.products && state.products.length > 0 && !state.loading">
      <h3 class="mb-3 text-lg font-medium">
        Recently viewed & more
      </h3>
      <div
        class="mb-6 grid grid-cols-5 gap-4"
      >
        <div
          v-for="(product, i) of state.products"
          :key="i"
        >
          <HomeProductCard :product="product" />
        </div>
      </div>
    </div>

    <div v-else-if="state.loading">
      <h3 class="mb-3 text-lg font-medium">
        Recently viewed & more
      </h3>
      <div
        class="mb-6 grid grid-cols-5 gap-4"
      >
        <div
          v-for="index in state.limit"
          :key="index"
        >
          <USkeleton class="h-[160px]" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
