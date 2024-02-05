<script setup lang="ts">
import type { IProductCart } from '~/interfaces/cart';
import { useCartStore } from '~/stores/cart';

const { data: { quantity, inventory } } = defineProps<{
  data: IProductCart
}>();

const { $api } = useNuxtApp();
const cartStore = useCartStore();
const toast = useToast();

const selected = ref();
const initLoad = ref(true);

const quantityOpts = computed(() => {
  const result = new Array(inventory?.stock)
    .fill('')
    .map((_, index) => (index + 1).toString());
  selected.value = result[quantity - 1];
  return result;
});

watch(() => selected.value, async () => {
  if (initLoad.value) {
    initLoad.value = false;
    return;
  }
  const { error, data } = await $api.cart.updateProduct({
    inventory: inventory.id,
    quantity: Number(selected.value),
  });
  if (error.value) {
    toast.add({ title: 'Something Wrong' });
  } else {
    cartStore.tempOrder = data.value?.tempOrder || null;
  }
});

</script>

<template>
  <UFormGroup>
    <USelectMenu
      v-model="selected"
      size="lg"
      :options="quantityOpts"
    />
  </UFormGroup>
</template>
