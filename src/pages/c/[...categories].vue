<script lang="ts" setup>
import { useSessionStorage } from '@vueuse/core';
import type { ICategorySessionStorage } from '~/interfaces/category';
import { SESSION_STORAGE_KEYS } from '~/config/enums/session-storage-keys';

definePageMeta({ layout: 'home' });

const { $api } = useNuxtApp();
const route = useRoute();

const limit = 30;
const page = ref(1);

const redirectErrorPage = () => {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true,
  });
};

const categoryId = computed(() => {
  const categoriesInSS = parseJSON<ICategorySessionStorage[]>(
    sessionStorage.getItem(SESSION_STORAGE_KEYS.CATEGORIES));

  const categoryInSS = parseJSON<ICategorySessionStorage>(
    sessionStorage.getItem(SESSION_STORAGE_KEYS.CATEGORY));

  if (!categoryInSS) {
    return redirectErrorPage();
  }

  const categoryInSSByPath = categoriesInSS && categoriesInSS.find(c => c.to === route.fullPath);
  if (categoryInSSByPath) {
    return categoryInSSByPath.id;
  }
  return categoryInSS.id;
});

const queriesGetProducts = computed(() => {
  let defaultParams = {
    category: categoryId.value,
    page: page.value,
    limit,
  };
  if (route.query) {
    defaultParams = { ...defaultParams, ...route.query };
  }
  return defaultParams;
});

const {
  pending: pendingProducts, data, error,
} = await $api.product.getProductsLowestPrice(queriesGetProducts);

if (error.value) {
  redirectErrorPage();
}

const state = reactive({
  currentCategory: route.params.categories[route.params.categories.length - 1],
  categoriesBreadcrumb: computed(() => {
    let categoriesInSS = parseJSON<ICategorySessionStorage[]>(
      sessionStorage.getItem(SESSION_STORAGE_KEYS.CATEGORIES));

    if (!categoriesInSS) {
      return null;
    }

    // Clear tail breadcrumb by current path ( include case refresh page without click redirect )
    const categoryInSSByPath = categoriesInSS.find(c => c.to === route.fullPath);
    if (categoryInSSByPath) {
      // Clear child's by parent
      const newCategories = categoriesInSS.filter((c) => {
        return c.parent !== categoryInSSByPath.id;
      });
      categoriesInSS = newCategories;
      useSessionStorage(SESSION_STORAGE_KEYS.CATEGORIES, newCategories);
    }

    return categoriesInSS.map(c => ({ label: c.name, to: c.to }));
  }),
});

// on root category change, reset categories in ss
watch(() => route.fullPath, () => {
  const categoriesInSS = parseJSON<ICategorySessionStorage[]>(
    sessionStorage.getItem(SESSION_STORAGE_KEYS.CATEGORIES)
  );

  if (categoriesInSS) {
    const root = categoriesInSS.find(c => !c.parent);

    if (root && root.to === route.fullPath) {
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.CATEGORIES);
      useSessionStorage(SESSION_STORAGE_KEYS.CATEGORIES, [root]);
    }
  }
}, { immediate: true });

</script>

<template>
  <div class="pt-12">
    <div class="flex items-center justify-between mb-4">
      <div>
        <UBreadcrumb
          v-if="state.categoriesBreadcrumb && route.params.categories.length > 1"
          :links="state.categoriesBreadcrumb"
          :ui="{ active: 'text-gray-700' }"
        />
        <div class="capitalize text-2xl font-semibold mb-2">
          {{ state.currentCategory }} ( {{ data?.totalResults || 0 }} )
        </div>
      </div>

      <SortProductsBy />
    </div>

    <div class="flex gap-12">
      <div class="min-w-[200px] max-w-[200px]">
        <SubCategories />
        <FilterProducts />
      </div>

      <div v-if="pendingProducts">
        loading...
      </div>
      <div v-else class="pb-20">
        <div v-if="data?.results" class="grid grid-cols-5 gap-3 mb-6">
          <div v-for="(product, i) of data.results" :key="i">
            <ProductCard :product="product" />
          </div>
        </div>
        <div v-if="data?.totalResults" class="flex justify-center">
          <UPagination
            v-model="page"
            size="xl"
            :page-count="limit"
            :total="data?.totalResults ?? 0"
            :inactive-button="{ color: 'gray' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
