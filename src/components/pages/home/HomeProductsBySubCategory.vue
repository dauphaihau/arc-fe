<script lang="ts" setup>
import { SESSION_STORAGE_KEYS } from '~/config/enums/session-storage-keys';
import type { UserActivitiesSessionStorage } from '~/types/common';
import { useGetMultiProductsLowestPrice } from '~/services/product';
import type { Category } from '~/types/category';

const groupSkeletons = 2;
const limit = 7;

const categories = new Map<Category['id'], Category['name']>();

const queries = computed(() => {
  const userActivities = parseJSON<UserActivitiesSessionStorage>(
    sessionStorage.getItem(SESSION_STORAGE_KEYS.USER_ACTIVITIES)
  );
  if (userActivities?.subCategories) {
    return userActivities.subCategories.map((cg) => {
      categories.set(cg.id, cg.name);
      return {
        limit,
        category: cg.id,
      };
    });
  }
  return undefined;
});

const result = useGetMultiProductsLowestPrice(queries.value);

const subCategories = computed(() => {
  const filtered = result.value.filter(value => value.status === 'success');
  if (filtered.length > 0) {
    return filtered.map(val => ({
      ...toRaw(val.data),
      categoryName: val.data?.categoryId ? categories.get(val.data.categoryId) : '',
    }));
  }
  return [];
});
</script>

<template>
  <div>
    <!--  Skeletons loading -->
    <div
      v-if="queries && subCategories.length === 0"
      class="space-y-12"
    >
      <div
        v-for="index in groupSkeletons"
        :key="index"
      >
        <div>
          <div class="mb-6">
            <USkeleton class="mb-3 h-7 w-20" />
            <USkeleton class="h-7 w-32" />
          </div>
          <div class="grid grid-cols-6 gap-6">
            <USkeleton class="col-span-2 h-full" />
            <div class="col-span-4">
              <div class="grid grid-cols-3 gap-6">
                <USkeleton class="h-[160px]" />
                <USkeleton class="h-[160px]" />
                <USkeleton class="h-[160px]" />
                <USkeleton class="h-[160px]" />
                <USkeleton class="h-[160px]" />
                <USkeleton class="h-[160px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-else-if="subCategories && subCategories.length > 0"
      class="space-y-12"
    >
      <div
        v-for="(cg, i) of subCategories"
        :key="i"
      >
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
            <HomeProductCard
              :product="cg.results[0]"
              class="col-span-2"
            />
            <div class="col-span-4">
              <div class="grid grid-cols-3 gap-6">
                <div
                  v-for="product of cg.results.slice(1)"
                  :key="product.id"
                >
                  <HomeProductCard :product="product" />
                </div>
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
