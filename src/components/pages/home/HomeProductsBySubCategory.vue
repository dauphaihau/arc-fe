<script lang="ts" setup>

import { toRaw } from 'vue';
import { SESSION_STORAGE_KEYS } from '~/config/enums/session-storage-keys';
import type { GetListResponse, IUserActivitiesSessionStorage } from '~/interfaces/common';
import type { ResponseGetProducts } from '~/interfaces/product';

const { $api } = useNuxtApp();

type ISubCategories = {
    categoryName: string,
} & Partial<GetListResponse<ResponseGetProducts>>

const state = reactive({
  pending: false,
  limit: 7,
  subCategories: [] as ISubCategories[],
});

function isFulfilled<T>(val: PromiseSettledResult<T>): val is PromiseFulfilledResult<T> {
  return val.status === 'fulfilled';
}

onMounted(async () => {
  const userActivities = parseJSON<IUserActivitiesSessionStorage>(
    sessionStorage.getItem(SESSION_STORAGE_KEYS.USER_ACTIVITIES));

  if (userActivities) {
    const results = await Promise.allSettled(
      userActivities.subCategories.map(async (cg) => {
        const { data } = await $api.product.getProductsLowestPrice({
          limit: state.limit,
          category: cg.id,
        });
        return {
          ...toRaw(data.value),
          categoryName: cg.name,
        };
      })
    );
    state.subCategories = results.filter(isFulfilled).map(sub => sub.value);
  }
});


</script>

<template>
  <div v-if="state.subCategories && state.subCategories.length > 0" class="space-y-12">
    <div v-for="(cg, i) of state.subCategories" :key="i">
      <div v-if="cg.results && cg.results.length > 0">
        <div class="mb-6">
          <h3 class="text-lg font-medium">
            {{ cg.categoryName }}
          </h3>
          <p class="text-md text-customGray-900">
            Based on your activity
          </p>
        </div>
        <div class="grid grid-cols-6 gap-6">
          <HomeProductCard :product="cg.results[0]" class="col-span-2" />
          <div class="col-span-4">
            <div class="grid grid-cols-3 gap-6">
              <div v-for="product of cg.results.slice(1)" :key="product.id">
                <HomeProductCard :product="product" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
