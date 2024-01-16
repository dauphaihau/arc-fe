<script setup lang="ts">
import type { IProduct } from '~/interfaces/product';

const { checked, productId } = defineProps<{ checked: boolean, productId: IProduct['id'] }>();

const { $api } = useNuxtApp();
const toast = useToast();

const selectedCheckbox = ref(checked);

watch(() => selectedCheckbox.value, async () => {
  const { error } = await $api.cart.updateProduct({
    product: productId,
    is_select_order: selectedCheckbox.value,
  });
  if (error.value) {
    toast.add({ title: 'Something Wrong' });
  }
});

</script>

<template>
  <UCheckbox
    v-model="selectedCheckbox"
    class="mb-2"
  />
</template>
