<script lang="ts" setup>
import { PRODUCT_CATEGORIES } from '~/config/enums/product';

definePageMeta({ layout: 'home' });

const { $api } = useNuxtApp();
const route = useRoute();

const routesValid = Object.values(PRODUCT_CATEGORIES);

if (!routesValid.includes(route.params.category as PRODUCT_CATEGORIES)) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true,
  });
}

const pageCount = 10;
const page = ref(1);

const { pending, data } = await $api.product.getProducts({
  page,
  category: route.params.category as PRODUCT_CATEGORIES,
});

</script>

<template>
  <div class="mt-10">
    <div class="flex justify-center capitalize text-2xl font-base mt-4 mb-8">
      {{ route.params.category }}
    </div>
    <div class="flex gap-4">
      <!--  filters  -->
      <div class="min-w-[200px]">
        <div class="text-xl font-medium">
          Sub categories
        </div>
      </div>

      <div v-if="pending">
        loading...
      </div>
      <div v-else>
        <div v-if="data?.results" class="grid grid-cols-5 gap-3 mb-6">
          <div v-for="product of data.results" :key="product.id">
            <ProductCard :product="product" />
          </div>
        </div>
        <div v-if="data?.totalResults" class="flex justify-center">
          <UPagination
            v-model="page"
            size="xl"
            :page-count="pageCount"
            :total="data?.totalResults ?? 0"
            :inactive-button="{ color: 'gray' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
