<script lang="ts" setup>
import { useSessionStorage } from '@vueuse/core';
import type { ICategory } from '~/interfaces/category';

definePageMeta({ layout: 'home' });

const { $api } = useNuxtApp();
const route = useRoute();

const pageCount = 10;
const page = ref(1);

interface ICategorySessionStorage extends ICategory {
  to?: string
}

const categoryId = computed(() => {
  const categoriesInSS = parseJSON<ICategorySessionStorage[]>(sessionStorage.getItem('categories'));
  const categoryInSS = parseJSON<ICategorySessionStorage>(sessionStorage.getItem('category'));

  if (!categoryInSS) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      fatal: true,
    });
  }
  const categoryInSSByPath = categoriesInSS && categoriesInSS.find(c => c.to === route.fullPath);
  if (categoryInSSByPath) {
    return categoryInSSByPath.id;
  }
  return categoryInSS.id;
});

const { data: dataCategories, pending: pendingDataCategories } = await $api.category.getCategories({
  parent: categoryId.value,
});

const { pending: pendingProducts, data, error } = await $api.product.getProducts({
  page,
  category: categoryId.value,
});

if (error.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true,
  });
}

const state = reactive({
  currentCategory: route.params.categories[route.params.categories.length - 1],
  categoriesBreadcrumb: computed(() => {
    let categoriesInSS = parseJSON<ICategorySessionStorage[]>(sessionStorage.getItem('categories'));

    // Clear tail breadcrumb by current path ( include case refresh page without click redirect )
    const categoryInSSByPath = categoriesInSS && categoriesInSS.find(c => c.to === route.fullPath);
    if (categoryInSSByPath) {
      // Clear childs by parent
      const newCategories = categoriesInSS && categoriesInSS.filter((c) => {
        return c.parent !== categoryInSSByPath.id;
      });
      categoriesInSS = newCategories;
      useSessionStorage('categories', newCategories);
    }
    return categoriesInSS && categoriesInSS.map(c => ({ label: c.name, to: c.to }));
  }),
});

const redirectPage = (category: ICategorySessionStorage) => {
  sessionStorage.removeItem('category');
  useSessionStorage('category', category);

  let categoriesInSS = parseJSON<ICategorySessionStorage[]>(sessionStorage.getItem('categories'));

  categoriesInSS = categoriesInSS && categoriesInSS.filter(c => c.parent !== category.parent);

  const to = route.fullPath + '/' + category.name.replaceAll(' ', '-').toLowerCase();

  categoriesInSS?.push({ ...category, to });

  if (categoriesInSS) {
    const newCategories = [...categoriesInSS];
    sessionStorage.removeItem('categories');
    useSessionStorage('categories', newCategories);
  }

  navigateTo(to);
};

watch(() => route, () => {
  const categoriesInSS = parseJSON<ICategorySessionStorage[]>(sessionStorage.getItem('categories'));
  const root = categoriesInSS && categoriesInSS.find(c => !c.parent);
  if (root && root.to === route.fullPath) {
    sessionStorage.removeItem('categories');
    useSessionStorage('categories', [root]);
  }
}, { deep: true, immediate: true });

</script>

<template>
  <div class="mt-10">
    <div class="space-y-8 mb-8">
      <UBreadcrumb
        v-if="route.params.categories.length > 1"
        :links="state.categoriesBreadcrumb"
        :ui="{
          wrapper: 'flex justify-center',
          base: 'capitalize flex justify-center',
          active: 'text-gray-700' }"
      />
      <div class="capitalize text-3xl font-light text-center">
        {{ state.currentCategory }}
      </div>
      <div class="flex justify-center gap-3">
        <div v-if="pendingDataCategories">
          loading...
        </div>
        <div v-else>
          <div class="flex justify-center gap-3">
            <div v-for="cg of dataCategories?.categories" :key="cg.id">
              <div
                class="capitalize text-xl font-semibold cursor-pointer"
                @click="() => redirectPage(cg)"
              >
                {{ cg.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="flex gap-4">
      <!--  filters  -->
      <div class="min-w-[200px]">
        <div class="text-xl font-medium">
          Filters
        </div>
      </div>

      <div v-if="pendingProducts">
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
