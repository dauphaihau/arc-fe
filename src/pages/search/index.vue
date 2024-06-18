<script lang="ts" setup>
definePageMeta({ layout: 'market' });

const { $api } = useNuxtApp();
const route = useRoute();

const redirectErrorPage = () => {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true,
  });
};

if (!route.query?.s) {
  redirectErrorPage();
}

const limit = 30;
const page = ref(1);

const queryParams = computed(() => {
  let defaultParams = {
    page: page.value,
    limit,
    title: route.query.s as string,
  };
  if (route.query) {
    defaultParams = { ...defaultParams, ...route.query };
  }
  return defaultParams;
});

const {
  pending, data, error, refresh,
} = await $api.product.getProductsLowestPrice(queryParams);

if (error.value) {
  redirectErrorPage();
}

watch(() => route.query.s, () => {
  refresh();
});
</script>

<template>
  <div class="pt-12">
    <div class="mb-4 flex items-center justify-between">
      <div />
      <SortProductsBy />
    </div>
    <div class="flex gap-12">
      <div class="min-w-[200px] max-w-[200px]">
        <FilterProducts />
      </div>

      <div v-if="pending">
        loading...
      </div>
      <div
        v-else
        class="pb-20"
      >
        <div v-if="data?.results">
          <div class="mb-6 grid grid-cols-5 gap-3">
            <div
              v-for="product of data.results"
              :key="product.id"
            >
              <ProductCard :product="product" />
            </div>
          </div>
        </div>
        <div
          v-if="data?.totalResults"
          class="flex justify-center"
        >
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
