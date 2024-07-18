<script setup lang="ts">
/*
  use in cart, cart/checkout page
 */
import { watchDebounced } from '@vueuse/core';
import type { UpdateCartProductBody, ProductCartPopulated, ResponseGetCart } from '~/types/cart';
import { useCartStore } from '~/stores/cart';
import { useUpdateCartProduct } from '~/services/cart';

const props = defineProps<{
  data: ProductCartPopulated
}>();

const cartStore = useCartStore();
const queryClient = useQueryClient();

const tempProductQty = ref(props.data.quantity);

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
  if (tempProductQty.value === 1) return;
  tempProductQty.value--;
};

watchDebounced(
  tempProductQty,
  async () => {
    const body: UpdateCartProductBody = {
      inventory: props.data.inventory.id,
      quantity: tempProductQty.value,
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
      :disabled="isPendingUpdateProductCart || cartStore.stateCheckoutNow.isPendingCreateOrder"
      @click="decreaseQty"
    />
    <UInput
      v-model.number="tempProductQty"
      v-numeric
      v-max-number="props.data.inventory.stock"
      class="rounded-l-none"
      :disabled="isPendingUpdateProductCart || cartStore.stateCheckoutNow.isPendingCreateOrder"
      :ui="{ base: 'text-center rounded-l-none' }"
    />
    <UButton
      icon="i-heroicons-plus"
      color="white"
      class="rounded-l-none rounded-r-md"
      :disabled="isPendingUpdateProductCart || cartStore.stateCheckoutNow.isPendingCreateOrder"
      @click="() => tempProductQty++"
    />
  </UButtonGroup>
</template>
