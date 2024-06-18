<script setup lang="ts">
import type { IItemCartPopulated } from '~/interfaces/cart';
import { ORDER_CONFIG } from '~/config/enums/order';

const emit = defineEmits<{ (e: 'onProductsEmpty'): void }>();

const { data } = defineProps<{
  data: IItemCartPopulated
  disabledDelete?: boolean
}>();

const cartStore = useCartStore();

const products = ref(data.products || []);

const state = reactive({
  showNoteInput: false,
  note: '',
});

onMounted(() => {
  const item = cartStore.mapAdditionInfoItems.get(data.shop.id);
  if (item && item.note) {
    state.showNoteInput = true;
    state.note = item.note;
  }
});

const onDelete = (index: number) => {
  products.value.splice(index, 1);
  if (products.value.length === 0) {
    emit('onProductsEmpty');
  }
};

watchDebounced(
  () => state.note,
  () => {
    if (data?.shop?.id) {
      const item = cartStore.mapAdditionInfoItems.get(data.shop.id);
      if (item) {
        item.note = state.note;
        cartStore.mapAdditionInfoItems.set(data.shop.id, item);
      }
    }
  },
  { debounce: 500, maxWait: 1000 }
);

watch(() => state.showNoteInput, () => {
  if (!state.showNoteInput) {
    cartStore.mapAdditionInfoItems.set(data.shop.id, {
      ...cartStore.mapAdditionInfoItems.get(data.shop.id),
      note: '',
    });
    state.note = '';
  }
});
</script>

<template>
  <UCard
    v-if="products.length > 0"
    :ui="{ base: 'overflow-visible' }"
    class="mb-4"
  >
    <div class="flex flex-col">
      <h3 class="mb-3 text-lg font-medium">
        {{ data.shop?.shop_name }}
      </h3>

      <div>
        <div
          v-for="(product, index) of products"
          :key="product.id"
        >
          <CartProduct
            :data="product"
            :shop-id="data.shop?.id"
            @on-delete-product="() => onDelete(index)"
          />
        </div>
      </div>

      <UDivider />

      <div class="mt-6 flex w-fit flex-col gap-4">
        <CartAddCoupons :shop-id="data.shop?.id" />
        <div>
          <UButton
            variant="ghost"
            icon="i-heroicons-clipboard-document-list"
            color="gray"
            class="w-fit"
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
      </div>
    </div>
  </UCard>
</template>
