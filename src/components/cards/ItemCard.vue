<script setup lang="ts">
import type { IItemCartPopulated } from '~/interfaces/cart';

const emit = defineEmits<{(e: 'onProductsEmpty', value: number): void }>();

const { data, indexItem } = defineProps<{
  data: IItemCartPopulated,
  indexItem: number
}>();

const products = ref(data.products || []);

const onDelete = (index: number) => {
  products.value.splice(index, 1);
  if (products.value.length === 0) {
    emit('onProductsEmpty', indexItem);
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
        <div v-for="(product, index) of products" :key="index">
          <ProductCartCard
            :index="index"
            :data="product"
            @on-delete-product="onDelete"
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
