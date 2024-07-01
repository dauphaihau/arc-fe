<script setup lang="ts">
/*
  use in 2 cart, cart/checkout page
 */
import type { ItemCartPopulated } from '~/types/cart';
import { ORDER_CONFIG } from '~/config/enums/order';

const { data } = defineProps<{
  data: ItemCartPopulated
}>();

const cartStore = useCartStore();

const state = reactive({
  showNoteInput: false,
  note: '',
});

onMounted(() => {
  const orderShop = cartStore.additionInfoOrderShops.get(data.shop.id);
  if (orderShop && orderShop.note) {
    state.showNoteInput = true;
    state.note = orderShop.note;
  }
});

watchDebounced(
  () => state.note,
  () => {
    if (data?.shop?.id) {
      const orderShop = cartStore.additionInfoOrderShops.get(data.shop.id);
      if (orderShop) {
        orderShop.note = state.note;
        cartStore.additionInfoOrderShops.set(data.shop.id, orderShop);
      }
    }
  },
  { debounce: 500, maxWait: 1000 }
);

watch(() => state.showNoteInput, () => {
  const additionInfoOrderShop = cartStore.additionInfoOrderShops.get(data.shop.id);
  if (!state.showNoteInput && additionInfoOrderShop) {
    cartStore.additionInfoOrderShops.set(data.shop.id, {
      ...additionInfoOrderShop,
      note: '',
    });
    state.note = '';
  }
});
</script>

<template>
  <div>
    <UButton
      variant="ghost"
      icon="i-heroicons-clipboard-document-list"
      color="gray"
      class="mb-1 w-fit"
      @click="state.showNoteInput = !state.showNoteInput"
    >
      Add a note to
      {{ data.shop?.shop_name }}
    </UButton>

    <UFormGroup
      v-if="state.showNoteInput"
      name="description"
      required
    >
      <UTextarea
        v-model="state.note"
        autoresize
        :maxlength="ORDER_CONFIG.MAX_CHAR_NOTE"
        :rows="3"
        size="lg"
      />
    </UFormGroup>
  </div>
</template>
