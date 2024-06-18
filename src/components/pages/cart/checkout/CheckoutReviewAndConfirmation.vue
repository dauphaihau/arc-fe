<script lang="ts" setup>
import { useCartStore } from '~/stores/cart';
import type { IItemCartPopulated } from '~/interfaces/cart';

definePageMeta({ layout: 'market', middleware: ['auth'] });

const cartStore = useCartStore();

const itemsProductsSelected = computed(() => {
  const newItems = [] as IItemCartPopulated[];
  cartStore.itemsCart.forEach((item) => {
    const rawItem = toRaw(item);
    const productsSelected = rawItem.products.filter(prod => prod.is_select_order);
    newItems.push({
      ...rawItem, products: productsSelected,
    });
  });
  return newItems;
});
</script>

<template>
  <CheckoutReviewShippingAndPayment />
  <div class="mt-12">
    <div
      v-for="item of itemsProductsSelected"
      :key="item.id"
    >
      <CartItem :data="item" />
    </div>
  </div>
</template>

<style scoped>

</style>
