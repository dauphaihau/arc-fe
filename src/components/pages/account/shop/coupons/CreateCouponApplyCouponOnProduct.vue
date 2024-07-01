<script setup lang="ts">
import type { Product } from '~/types/product';
import { PRODUCT_VARIANT_TYPES } from '~/config/enums/product';
import { useShopGetProducts } from '~/services/shop';

const emit = defineEmits<{ (e: 'onSelectProd', value: Product['id'][]): void }>();

const isOpen = ref(false);
const selectedRows = ref<Product[]>([]);
const page = ref(1);


const {
  isPending: isPendingShopGetProducts,
  data: dataShopGetProducts,
} = useShopGetProducts({
  page: page.value,
});

defineShortcuts({
  escape: {
    usingInput: true,
    whenever: [isOpen],
    handler: () => { isOpen.value = false },
  },
});

const columnsDialog = [
  {
    key: 'title',
    label: 'Title',
  },
  {
    key: 'price',
    label: 'Price',
    class: 'text-left',
  }, {
    key: 'stock',
    label: 'Stock',
    class: 'text-center',
  },
];

const columnsPreviewTable = [
  ...columnsDialog,
  {
    key: 'actions',
    label: 'Actions',
    class: 'text-center',
  },
];

const rowsDialog = computed(() => {
  if (!dataShopGetProducts.value) {
    return [];
  }
  return dataShopGetProducts.value.results.map(prod => ({
    id: prod.id,
    title: prod.title,
    summary_inventory: prod.summary_inventory,
    variant_type: prod.variant_type,
    inventory: prod.variant_type === PRODUCT_VARIANT_TYPES.NONE ? prod.inventory : null,
  }));
});

const applyProducts = () => {
  emit('onSelectProd', selectedRows.value.map(prod => prod.id));
  isOpen.value = false;
};

const removeProd = (id: Product['id']) => {
  selectedRows.value = selectedRows.value.filter(row => row.id !== id);
};
</script>

<template>
  <div>
    <UButton
      color="gray"
      variant="solid"
      @click="isOpen = true"
    >
      Add product
    </UButton>

    <UModal v-model="isOpen">
      <div class="space-y-5 p-6">
        <h1 class="text-xl font-medium">
          Select Products
        </h1>
        <UTable
          v-model="selectedRows"
          :rows="rowsDialog"
          :columns="columnsDialog"
          :loading="isPendingShopGetProducts"
          :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
        >
          <template #price-data="{ row }">
            <div v-if="row.variant_type === PRODUCT_VARIANT_TYPES.NONE">
              {{ formatCurrency(row.inventory.price) }}
            </div>
            <div v-else>
              {{ formatCurrency(row.summary_inventory.lowest_price) }} -
              {{ formatCurrency(row.summary_inventory.highest_price) }}
            </div>
          </template>
          <template #stock-data="{ row }">
            <div class="text-center">
              <div v-if="row.variant_type === PRODUCT_VARIANT_TYPES.NONE">
                {{ row.inventory.stock }}
              </div>
              <div v-else>
                {{ row.summary_inventory.stock }}
              </div>
            </div>
          </template>
        </UTable>

        <div class="flex items-center justify-end gap-2">
          <UButton
            size="sm"
            color="gray"
            @click="() => isOpen = false"
          >
            Cancel
          </UButton>
          <UButton
            size="sm"
            @click="applyProducts"
          >
            Save
          </UButton>
        </div>
      </div>
    </UModal>
    <div v-if="selectedRows.length > 0">
      <UTable
        :columns="columnsPreviewTable"
        :rows="selectedRows"
        :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
      >
        <template #price-data="{ row }">
          <div v-if="row.variant_type === PRODUCT_VARIANT_TYPES.NONE">
            {{ formatCurrency(row.inventory.price) }}
          </div>
          <div v-else>
            {{ formatCurrency(row.summary_inventory.lowest_price) }} -
            {{ formatCurrency(row.summary_inventory.highest_price) }}
          </div>
        </template>

        <template #stock-data="{ row }">
          <div class="text-center">
            <div v-if="row.variant_type === PRODUCT_VARIANT_TYPES.NONE">
              {{ row.inventory.stock }}
            </div>
            <div v-else>
              {{ row.summary_inventory.stock }}
            </div>
          </div>
        </template>

        <template #actions-data="{ row }">
          <div class="text-center">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-trash"
              @click="() => removeProd(row.id)"
            />
          </div>
        </template>
      </UTable>
    </div>
  </div>
</template>
