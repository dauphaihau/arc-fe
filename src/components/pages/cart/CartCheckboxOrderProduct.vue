<script setup lang="ts">
import type { IProductInventory } from '~/interfaces/product';
import { useCartStore } from '~/stores/cart';
import type { IShop } from '~/interfaces/shop';

const { checked, inventoryId, shopId } = defineProps<{
  checked: boolean
  inventoryId: IProductInventory['id']
  shopId: IShop['id']
}>();

const { $api } = useNuxtApp();
const toast = useToast();
const cartStore = useCartStore();

const selectedCheckbox = ref(checked);

watch(() => selectedCheckbox.value, async () => {
  const { error, data } = await $api.cart.updateProduct({
    inventory: inventoryId,
    is_select_order: selectedCheckbox.value,
  });
  if (error.value) {
    toast.add({
      title: 'Something Wrong',
      icon: 'i-heroicons-x-circle',
      color: 'red',
    });
  }
  else {
    cartStore.summaryOrder = data.value?.summaryOrder || null;

    cartStore.itemsCart.forEach((item) => {
      if (item.shop.id === shopId) {
        item.products.forEach((prod) => {
          if (prod.inventory.id === inventoryId) {
            prod.is_select_order = selectedCheckbox.value;
          }
        });
      }
    });
  }
});
</script>

<template>
  <UCheckbox
    v-model="selectedCheckbox"
    class="mb-2"
  />
</template>
