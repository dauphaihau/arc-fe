<script setup lang="ts">
import type { IProduct } from '~/interfaces/product';
import { useCartStore } from '~/stores/cart';

const { checked, inventoryId } = defineProps<{ checked: boolean, inventoryId: IProduct['id'] }>();

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
    toast.add({ title: 'Something Wrong' });
  } else {
    cartStore.tempOrder = data.value?.tempOrder || null;
  }
});

</script>

<template>
  <UCheckbox
    v-model="selectedCheckbox"
    class="mb-2"
  />
</template>
