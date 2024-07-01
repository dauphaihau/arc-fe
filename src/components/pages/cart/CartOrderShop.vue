<script setup lang="ts">
import type { ItemCartPopulated } from '~/types/cart';
import CartAddRemoveNote from '~/components/pages/cart/CartAddRemoveNote.vue';

const emit = defineEmits<{ onProductsEmpty: [] }>();

const { data } = defineProps<{
  data: ItemCartPopulated
}>();

const products = ref(data.products || []);

const onDelete = (index: number) => {
  products.value.splice(index, 1);
  if (products.value.length === 0) {
    emit('onProductsEmpty');
  }
};
</script>

<template>
  <UCard
    v-if="products.length > 0"
    :ui="{ base: 'overflow-visible' }"
    class="mb-4"
  >
    <div class="flex flex-col">
      <h3 class="mb-3 text-lg font-medium">
        {{ data.shop?.shop_name }}
      </h3>

      <div>
        <div
          v-for="(product, index) of products"
          :key="product.id"
        >
          <CartProduct
            :data="product"
            :shop-id="data.shop?.id"
            @on-delete-product="() => onDelete(index)"
          />
        </div>
      </div>

      <UDivider />

      <div class="mt-6 flex w-fit flex-col gap-4">
        <CartAddRemoveCoupons :shop-id="data.shop?.id" />
        <CartAddRemoveNote :data="data" />
      </div>
    </div>
  </UCard>
</template>
