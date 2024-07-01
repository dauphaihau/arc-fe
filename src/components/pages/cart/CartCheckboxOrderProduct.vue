<script setup lang="ts">
import type { ProductInventory } from '~/types/product';
import { useCartStore } from '~/stores/cart';
import type { Shop } from '~/types/shop';
import { useUpdateCartProduct } from '~/services/cart';
import type { ResponseGetCart } from '~/types/cart';

const { checked, inventoryId, shopId } = defineProps<{
  checked: boolean
  inventoryId: ProductInventory['id']
  shopId: Shop['id']
}>();

const cartStore = useCartStore();
const queryClient = useQueryClient();

const selectedCheckbox = ref(checked);

const {
  mutate: updateProductCart,
  isPending: isPendingUpdateProductCart,
} = useUpdateCartProduct({
  onSuccess(data) {
    const cacheGetCart = queryClient.getQueryData<ResponseGetCart>(['get-cart']);
    if (cacheGetCart) {
      cacheGetCart.summaryOrder = data.summaryOrder;
      cacheGetCart.cart.items.forEach((item) => {
        if (item.shop.id === shopId) {
          item.products.forEach((prod) => {
            if (prod.inventory.id === inventoryId) {
              prod.is_select_order = selectedCheckbox.value;
            }
          });
        }
      });
      cartStore.stateCheckoutCart.keyRefreshCartSummaryOrderComp++;
    }
  },
});

watch(() => selectedCheckbox.value, async () => {
  updateProductCart({
    inventory: inventoryId,
    is_select_order: selectedCheckbox.value,
  });
});
</script>

<template>
  <UCheckbox
    v-model="selectedCheckbox"
    :disabled="isPendingUpdateProductCart"
    class="mb-2"
  />
</template>
