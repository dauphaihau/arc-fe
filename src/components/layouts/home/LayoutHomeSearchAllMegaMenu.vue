<script lang="ts" setup>
import type { ResponseGetProducts } from '~/interfaces/product';

const props = defineProps<{ show: boolean }>();

const { $api } = useNuxtApp();
const route = useRoute();
const router = useRouter();

const state = reactive({
  search: '',
  products: [] as ResponseGetProducts[],
  pending: false,
  limit: 5,
});

watch(() => [route.query.s, props.show], () => {
  if (!route.query?.s || !props.show) {
    state.search = '';
    state.products = [];
  }
});

const redirectSearch = () => {
  router.push({
    path: '/search',
    query: {
      s: state.search,
    },
  });
};

watchDebounced(
  () => state.search,
  async () => {
    const { data, error } = await $api.product.getProducts({
      limit: state.limit,
      title: state.search,
      select: 'title,category',
    });
    if (!error.value && data.value && data.value.results.length > 0) {
      state.products = data.value.results;
    }
  },
  { debounce: 500, maxWait: 1000 }
);

function highlightText(text: string) {
  const re = new RegExp(state.search, 'gi');
  return text.replace(re, match => `<span class="font-bold">${match}</span>`);
}

</script>

<template>
  <transition name="slide-down">
    <div v-if="props.show">
      <div class="mx-auto pb-12 ml-1.5">
        <UInput
          v-model="state.search"
          icon="i-heroicons-magnifying-glass-20-solid"
          :padded="false"
          placeholder="Search..."
          variant="none"
          autofocus
          class="w-full"
          size="xl"
          :ui="{
            size: {
              xl: 'text-2xl',
            }
          }"
          @keypress.enter="redirectSearch"
        />

        <transition name="slide-down">
          <div v-if="state.products.length > 0" class="mt-8">
            <div class="text-gray-500 text-[12px] mb-2  ml-4">
              Suggested Searches
            </div>

            <div class="flex flex-col gap-1 ml-2">
              <div v-for="prod of state.products" :key="prod.id">
                <div
                  class="product"
                  @click="redirectSearch"
                >
                  <Icon name="uil:search" class="w-3" />
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div v-html="highlightText(prod.title)" />
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<style scoped>

.slide-down-enter-active,
.slide-down-leave-active {
  transition: max-height 0.3s ease-in-out;
}

.slide-down-enter-to,
.slide-down-leave-from {
  overflow: hidden;
  max-height: 1000px;
}

.slide-down-enter-from,
.slide-down-leave-to {
  overflow: hidden;
  max-height: 0;
}

.product {
  @apply flex items-center gap-1 text-gray-500 font-normal text-[12px]
  hover:bg-gray-100 px-2 rounded cursor-pointer
}

</style>
