<script lang="ts" setup>

import { useCartStore } from '~/stores/cart';

definePageMeta({ layout: 'home' });

const { $api } = useNuxtApp();
const cartStore = useCartStore();

const { pending, data } = await $api.cart.getCart();

const items = ref(data.value?.cart?.items || []);

const onProductsEmpty = (index: number) => {
  items.value.splice(index, 1);
};

</script>


<template>
  <div class="mt-2 py-12">
    <div v-if="pending">
      loading...
    </div>
    <div v-else>
      <div v-if="data?.cart && data.cart.items.length > 0">
        <h1 class="text-2xl font-medium mb-4">
          {{ cartStore.tempOrder?.totalProducts || data.totalProducts }} items in your card
        </h1>

        <div class="flex gap-4">
          <div class="grow">
            <div
              v-for="(item, index) of items"
              :key="index"
            >
              <ItemCard
                :index-item="index"
                :data="item"
                @on-products-empty="onProductsEmpty"
              />
            </div>
          </div>

          <TempOrder
            v-if="data?.tempOrder"
            :data="cartStore.tempOrder || data.tempOrder"
            class="min-w-[400px] mx-8"
          />
        </div>
      </div>

      <div v-else class="text-center">
        <h3 class="text-3xl text-customGray-950">
          Your cart is empty.
        </h3>
      </div>
    </div>
  </div>
</template>
