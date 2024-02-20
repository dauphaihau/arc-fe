<script setup lang="ts">
import type { IItemCartPopulated } from '~/interfaces/cart';

const emit = defineEmits<{(e: 'onProductsEmpty'): void }>();

const { data } = defineProps<{
  data: IItemCartPopulated,
}>();

const products = ref(data.products || []);

const onDelete = (index: number) => {
  products.value.splice(index, 1);
  if (products.value.length === 0) {
    emit('onProductsEmpty');
  }
};

</script>

<template>
  <UCard
    v-if="products.length > 0"
    :ui="{ base: 'overflow-visible' }"
    class="mb-4"
  >
    <div class="flex flex-col">
      <h3 class="text-lg font-medium mb-3">
        {{ data.shop?.shop_name }}
      </h3>

      <div>
        <div v-for="(product, index) of products" :key="product.id">
          <ProductCartCard
            :data="product"
            @on-delete-product="() => onDelete(index)"
          />
        </div>
      </div>

      <UDivider />

      <div class="flex flex-col gap-4 w-fit mt-6">
        <AddCouponItemCart :shop="data.shop?.id" />
        <UButton
          variant="ghost"
          icon="i-heroicons-clipboard-document-list"
          color="gray"
        >
          Add a note to
          {{ data.shop?.shop_name }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>
