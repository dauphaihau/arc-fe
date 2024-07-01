<script lang="ts" setup>
import { SESSION_STORAGE_KEYS } from '~/config/enums/session-storage-keys';
import type { UserActivitiesSessionStorage } from '~/types/common';
import { useGetProductsLowestPrice } from '~/services/product';

const limit = 10;

const queryParams = computed(() => {
  const userActivities = parseJSON<UserActivitiesSessionStorage>(
    sessionStorage.getItem(SESSION_STORAGE_KEYS.USER_ACTIVITIES
    ));
  if (userActivities?.categoryProductVisited) {
    return {
      category: userActivities?.categoryProductVisited,
      limit,
    };
  }
  return undefined;
});

const {
  data,
  isPending: isPendingGetProducts,
} = useGetProductsLowestPrice(queryParams);
</script>

<template>
  <div v-if="queryParams">
    <div>
      <h3 class="mb-3 text-lg font-medium">
        Recently viewed & more
      </h3>
      <div>
        <div
          v-if="isPendingGetProducts"
          class="grid grid-cols-5 gap-4"
        >
          <div
            v-for="index in limit"
            :key="index"
          >
            <USkeleton class="h-[160px]" />
          </div>
        </div>
        <div
          v-else-if="data?.results && data.results.length > 0"
          class="grid grid-cols-5 gap-4"
        >
          <div
            v-for="(product, i) of data.results"
            :key="i"
          >
            <HomeProductCard :product="product" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
