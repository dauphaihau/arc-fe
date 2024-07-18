<script lang="ts" setup>
import { useGetProducts } from '~/services/product';

definePageMeta({ layout: 'market' });

const route = useRoute();
const marketStore = useMarketStore();

const limit = 20;
const page = ref(1);

const params = computed(() => {
  const category = marketStore.categoriesBreadcrumb.find(c => c.to === route.path);
  if (!category) {
    return undefined;
  }
  let defaultParams = {
    category: category.id,
    page: page.value,
    limit,
  };
  if (route.query) {
    defaultParams = { ...defaultParams, ...route.query };
  }
  return defaultParams;
});

const {
  data: dataGetProducts,
  isPending: isPendingGetProducts,
} = useGetProducts(params);
</script>

<template>
  <div class="pt-12">
    <div class="mb-4 flex items-center justify-between">
      <CategoriesBreadcrumb :total-products="dataGetProducts?.totalResults || 0" />
      <SortProductsBy />
    </div>

    <div class="flex gap-12">
      <div class="min-w-[200px] max-w-[200px]">
        <CategoriesSubCategories />
        <FilterProducts />
      </div>

      <div
        v-if="isPendingGetProducts"
        class="grid h-[80vh] w-full place-content-center"
      >
        <LoadingSvg :child-class="'!w-12 !h-12'" />
      </div>
      <div v-else>
        <div
          v-if="dataGetProducts?.results"
          class="mb-16 grid grid-cols-4 gap-x-3 gap-y-8"
        >
          <div
            v-for="(product, i) of dataGetProducts.results"
            :key="i"
          >
            <ProductCard :product="product" />
          </div>
        </div>
        <div
          v-if="dataGetProducts?.totalResults && dataGetProducts.totalResults > limit"
          class="flex justify-center"
        >
          <UPagination
            v-model="page"
            size="xl"
            :page-count="limit"
            :total="dataGetProducts?.totalResults ?? 0"
            :inactive-button="{ color: 'gray' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
