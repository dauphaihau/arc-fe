<script lang="ts" setup>

import { ROUTES } from '~/config/enums/routes';

definePageMeta({ layout: 'shop', middleware: ['auth'] });

const { $api } = useNuxtApp();

const selected = ref([]);
const pageCount = 10;
const page = ref(1);

const { pending, data } = await $api.product.getProductsByShop({
  page,
});

const columns = [
  {
    key: 'title',
    label: 'Title',
  }, {
    key: 'category',
    label: 'Category',
  }, {
    key: 'price',
    label: 'Price',
    class: 'text-center',
  }, {
    key: 'stock',
    label: 'Stock',
    class: 'text-center',
  },
  {
    key: 'actions',
  },
];

const rows = computed(() => {
  return data.value?.results.map(prod => ({
    id: prod.id,
    title: prod.title,
    category: prod.category,
    price: { value: prod.price, class: 'text-center' },
    stock: { value: prod.quantity, class: 'text-center' },
    actions: { class: 'text-right' },
  }));
});

const items = (row: { id: string }) => [
  [
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil-square-20-solid',
      click: () => row,
      // click: () => console.log('Edit', row.id),
    },
    {
      label: 'Duplicate',
      icon: 'i-heroicons-document-duplicate-20-solid',
    },
  ],
  [
    {
      label: 'Archive',
      icon: 'i-heroicons-archive-box-20-solid',
    },
    {
      label: 'Preview',
      icon: 'i-heroicons-arrow-right-circle-20-solid',
      click: () => {
        navigateTo(`${ROUTES.PRODUCTS}/${row.id}`, {
          open: { target: '_blank' },
        });
      },
    },
  ],
  [
    {
      label: 'Delete',
      icon: 'i-heroicons-trash-20-solid',
    },
  ],
];

// const selectedCheckbox = ref(false);

</script>

<template>
  <div>
    <div class="flex justify-between mb-6">
      <!--      <h1 class="text-2xl font-semibold text-customGray-950">-->
      <h1 class="shop-dashboard-title">
        Products
      </h1>

      <NuxtLink to="/account/shop/products/new">
        <UButton size="md" type="submit">
          + Create product
        </UButton>
      </NuxtLink>
    </div>


    <!--    <div class="w-fit">-->
    <!--      <UPopover>-->
    <!--    <UButton-->
    <!--      color="white"-->
    <!--      label="Status"-->
    <!--      trailing-icon="i-heroicons-chevron-down-20-solid"-->
    <!--    />-->

    <!--        <template #panel>-->
    <!--          <div class="p-4">-->
    <!--            <Placeholder class="h-20 w-48"/>-->
    <!--            <h3 class="font-semibold mb-3">-->
    <!--              Filter by status-->
    <!--            </h3>-->
    <!--            <div v-for="status of productStates">-->
    <!--              <UCheckbox-->
    <!--                  :id="status"-->
    <!--                  v-model="selectedCheckbox"-->
    <!--                  name="status"-->
    <!--                  :label="status"-->
    <!--                  :value="status"-->
    <!--                  class="mb-2"-->
    <!--              />-->
    <!--            </div>-->
    <!--          </div>-->
    <!--        </template>-->
    <!--      </UPopover>-->
    <!--    </div>-->

    <UTable
      v-model="selected"
      :rows="rows"
      :columns="columns"
      :loading="pending"
      :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
    >
      <template #stock-data="{ row }">
        {{ row.stock.value }}
      </template>
      <template #price-data="{ row }">
        {{ row.price.value }}
      </template>

      <template #actions-data="{ row }">
        <div class="flex items-center justify-end">
          <UTooltip text="Edit">
            <UButton
              color="gray"
              variant="ghost"
              class="p-1.5"
            >
              <Icon name="i-material-symbols:ink-pen-rounded" class=" cursor-pointer" />
            </UButton>
          </UTooltip>
          <UDropdown :items="items(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </div>
      </template>
    </UTable>

    <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
      <UPagination
        v-model="page"
        :page-count="pageCount"
        :total="data?.totalResults ?? 0"
        :inactive-button="{ color: 'gray' }"
      />
    </div>
  </div>
</template>
