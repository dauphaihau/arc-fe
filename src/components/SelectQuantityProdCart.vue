<script setup lang="ts">
import type { IProductCart } from '~/interfaces/cart';

const { data: { quantity, product } } = defineProps<{
  data: IProductCart
}>();

const { $api } = useNuxtApp();
const toast = useToast();

const selected = ref();
const initLoad = ref(true);

const quantityOpts = computed(() => {
  const result = new Array(product.quantity)
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
  const { error } = await $api.cart.updateProduct({
    product: product.id,
    quantity: Number(selected.value),
  });
  if (error.value) {
    toast.add({ title: 'Something Wrong' });
  }
});

</script>

<template>
  <UFormGroup label="Quantity">
    <USelectMenu
      v-model="selected"
      size="lg"
      :options="quantityOpts"
    />
  </UFormGroup>
</template>
