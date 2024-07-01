<script setup lang="ts">
/*
  use in cart, cart/checkout page
 */
import { watchDebounced } from '@vueuse/core';
import type { UpdateCartProductBody, ProductCartPopulated, ResponseGetCart } from '~/types/cart';
import { useCartStore } from '~/stores/cart';
import { useUpdateCartProduct } from '~/services/cart';

const { data: { quantity, inventory } } = defineProps<{
  data: ProductCartPopulated
}>();

const cartStore = useCartStore();
const queryClient = useQueryClient();

const stateInput = ref(quantity);

const {
  mutate: updateProductCart,
  isPending: isPendingUpdateProductCart,
} = useUpdateCartProduct({
  onSuccess: (data) => {
    const cacheGetCart = queryClient.getQueryData<ResponseGetCart>(['get-cart']);
    if (cacheGetCart) {
      cacheGetCart.summaryOrder = data.summaryOrder;
      cartStore.stateCheckoutCart.keyRefreshCartSummaryOrderComp++;
    }
  },
});

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
    const body: UpdateCartProductBody = {
      inventory: inventory.id,
      quantity: Number(stateInput.value),
    };
    if (cartStore.additionInfoOrderShops) {
      body.additionInfoItems = Array
        .from(cartStore.additionInfoOrderShops)
        .map(([keyShopId, value]) => ({
          shop: keyShopId,
          coupon_codes: value?.coupon_codes || [],
        }));
    }
    updateProductCart(body);
  },
  { debounce: 500, maxWait: 1000 }
);
</script>

<template>
  <UButtonGroup
    size="lg"
    orientation="horizontal"
  >
    <UButton
      icon="i-heroicons-minus"
      color="white"
      class="rounded-l-md rounded-r-none"
      :disabled="isPendingUpdateProductCart"
      @click="decreaseQty"
    />
    <UInput
      v-model.number="stateInput"
      class="rounded-l-none"
      :disabled="isPendingUpdateProductCart"
      type="number"
      :ui="{ base: 'text-center rounded-l-none' }"
      @keypress="keyPressIsNumber($event)"
    />
    <UButton
      icon="i-heroicons-plus"
      color="white"
      class="rounded-l-none rounded-r-md"
      :disabled="isPendingUpdateProductCart"
      @click="() => stateInput++"
    />
  </UButtonGroup>
</template>
