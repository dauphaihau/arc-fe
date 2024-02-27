<script setup lang="ts">
import { watchDebounced } from '@vueuse/core';
import type { IUpdateProductCart, IProductCart } from '~/interfaces/cart';
import { useCartStore } from '~/stores/cart';

const { data: { quantity, inventory } } = defineProps<{
  data: IProductCart
}>();

const { $api } = useNuxtApp();
const cartStore = useCartStore();
const toast = useToast();

const stateInput = ref(quantity);

const decreaseQty = () => {
  if (stateInput.value === 1) {
    return;
  }
  stateInput.value--;
};

watch(() => stateInput.value, () => {
  if (stateInput.value > inventory.stock) {
    stateInput.value = inventory.stock;
  }
}, { immediate: true });

watchDebounced(
  stateInput,
  async () => {
    const body: IUpdateProductCart = {
      inventory: inventory.id,
      quantity: Number(stateInput.value),
    };
    if (cartStore.mapAdditionInfoItems) {
      body.additionInfoItems = Array
        .from(cartStore.mapAdditionInfoItems)
        .map(([keyShopId, value]) => ({
          shop: keyShopId,
          coupon_codes: value?.coupon_codes || [],
        }));
    }

    const { error, data } = await $api.cart.updateProduct(body);
    if (error.value) {
      toast.add({ title: 'Something Wrong' });
    } else {
      cartStore.summaryOrder = data.value?.summaryOrder || null;
    }
  },
  { debounce: 500, maxWait: 1000 }
);

</script>

<template>
  <UButtonGroup size="lg" orientation="horizontal">
    <UButton
      icon="i-heroicons-minus"
      color="white"
      class="rounded-l-[0.375rem] rounded-r-none"
      @click="decreaseQty"
    />
    <UInput
      v-model.number="stateInput"
      class="rounded-l-none"
      type="number"
      :ui="{ base: 'text-center rounded-l-none' }"
      @keypress="keyPressIsNumber($event)"
    />
    <UButton
      icon="i-heroicons-plus"
      color="white"
      class="rounded-r-[0.375rem] rounded-l-none"
      @click="() => stateInput++"
    />
  </UButtonGroup>
</template>
