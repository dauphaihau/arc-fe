<script lang="ts" setup>
import type { DropdownItem } from '#ui/types';
import { ROUTES } from '~/config/enums/routes';
import { PRODUCT_VARIANT_TYPES } from '~/config/enums/product';
import type { IProduct } from '~/interfaces/product';
import type { ElementType } from '~/interfaces/utils';

definePageMeta({ layout: 'shop', middleware: ['auth'] });

const { $api } = useNuxtApp();
const config = useRuntimeConfig();
const toast = useToast();

const selected = ref([]);
const pageCount = 10;
const page = ref(1);

const { pending, data, refresh } = await $api.shop.getProducts({
  page,
});

const columns = [
  {
    key: 'title',
    label: 'Title',
  },
  {
    key: 'sku',
    label: 'SKU Variant',
  },
  {
    key: 'variant',
    label: 'Variant',
  },
  {
    key: 'price',
    label: 'Price',
    class: 'text-center',
  },
  {
    key: 'stock',
    label: 'Stock',
    class: 'text-center',
  },
  {
    label: 'Actions',
    key: 'actions',
    class: 'text-right',
  },
];

const rows = computed(() => {
  if (data.value?.results && data.value.results.length > 0) {
    return data.value.results.map(product => ({
      id: product.id,
      title: product.title,
      image: config.public.awsHostBucket + '/' + product?.images[0]?.relative_url,
      variants: product.variant_type !== PRODUCT_VARIANT_TYPES.NONE ? product.variants : null,
      inventory: product.variant_type === PRODUCT_VARIANT_TYPES.NONE ? product.inventory : null,
      variant_type: product.variant_type,
      price: { class: 'text-center' },
      stock: { class: 'text-center' },
      actions: { class: 'text-right' },
    }));
  }
  return [];
});

const itemsDropdownWithRow = (row: ElementType<typeof rows.value>): DropdownItem[][] => [
  [
    // {
    //   label: 'Edit',
    //   icon: 'i-heroicons-pencil-square-20-solid',
    //   click: () => row,
    //   // click: () => console.log('Edit', row.id),
    // },
    {
      label: 'Duplicate',
      icon: 'i-heroicons-document-duplicate-20-solid',
      disabled: true,
    },
  ],
  [
    {
      label: 'Archive',
      icon: 'i-heroicons-archive-box-20-solid',
      disabled: true,
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
      click: () => removeProduct(row.id),
    },
  ],
];

async function removeProduct(id: IProduct['id']) {
  const { error } = await $api.shop.deleteProduct(id);
  if (error.value) {
    toast.add({ title: 'Delete product success' });
  }
  else {
    toast.add({ title: 'Delete product success' });
    refresh();
  }
}
</script>

<template>
  <LayoutShopWrapperContent>
    <template #title>
      Products
    </template>
    <template #actions>
      <UButton
        :to="`${ROUTES.ACCOUNT}${ROUTES.SHOP}${ROUTES.PRODUCTS}${ROUTES.NEW}`"
        size="sm"
      >
        + Create product
      </UButton>
    </template>
    <template #content>
      <!--    <div class="w-fit"> -->
      <!--      <UPopover> -->
      <!--    <UButton -->
      <!--      color="white" -->
      <!--      label="Status" -->
      <!--      trailing-icon="i-heroicons-chevron-down-20-solid" -->
      <!--    /> -->

      <!--        <template #panel> -->
      <!--          <div class="p-4"> -->
      <!--            <Placeholder class="h-20 w-48"/> -->
      <!--            <h3 class="font-semibold mb-3"> -->
      <!--              Filter by status -->
      <!--            </h3> -->
      <!--            <div v-for="status of productStates"> -->
      <!--              <UCheckbox -->
      <!--                  :id="status" -->
      <!--                  v-model="selectedCheckbox" -->
      <!--                  name="status" -->
      <!--                  :label="status" -->
      <!--                  :value="status" -->
      <!--                  class="mb-2" -->
      <!--              /> -->
      <!--            </div> -->
      <!--          </div> -->
      <!--        </template> -->
      <!--      </UPopover> -->
      <!--    </div> -->

      <UTable
        v-model="selected"
        class="mb-20"
        :rows="rows"
        :empty-state="{ icon: 'i-heroicons-archive-box-20-solid', label: 'No products.' }"
        :columns="columns"
        :loading="pending"
        :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
      >
        <template #title-data="{ row }">
          <div class="flex max-w-[200px] gap-2">
            <NuxtImg
              :src="row.image"
              width="50"
              height="50"
              class="rounded"
              preload
            />
            <!--          <div class="inline-block max-w-[150px] break-words"> -->
            <div class="truncate">
              {{ row.title }}
            </div>
          </div>
        </template>

        <template #sku-data="{ row }">
          <div v-if="row.variant_type === PRODUCT_VARIANT_TYPES.NONE">
            {{ row?.inventory?.sku || '-' }}
          </div>
          <div v-else-if="row.variant_type === PRODUCT_VARIANT_TYPES.SINGLE">
            <div
              v-for="vari of row.variants"
              :key="vari.id"
            >
              {{ vari?.inventory?.sku || '-' }}
            </div>
          </div>
          <div v-else-if="row.variant_type === PRODUCT_VARIANT_TYPES.COMBINE">
            <div
              v-for="vari of row.variants"
              :key="vari.id"
            >
              <div
                v-for="variOpt of vari.variant_options"
                :key="variOpt.id"
              >
                {{ variOpt?.inventory?.sku || '-' }}
              </div>
            </div>
          </div>
        </template>

        <template #variant-data="{ row }">
          <div v-if="row.variant_type === PRODUCT_VARIANT_TYPES.NONE">
            None
          </div>
          <div v-else-if="row.variant_type === PRODUCT_VARIANT_TYPES.SINGLE">
            <div
              v-for="vari of row.variants"
              :key="vari.id"
            >
              {{ vari.variant_name }}
            </div>
          </div>
          <div v-else-if="row.variant_type === PRODUCT_VARIANT_TYPES.COMBINE">
            <div
              v-for="variant of row.variants"
              :key="variant.id"
            >
              <div
                v-for="variantOption of variant.variant_options"
                :key="variantOption.id"
              >
                {{ variant?.variant_name }}, {{ variantOption?.variant?.variant_name }}
              </div>
            </div>
          </div>
        </template>
        <template #price-data="{ row }">
          <div v-if="row.variant_type === PRODUCT_VARIANT_TYPES.NONE">
            {{ formatCurrency(row?.inventory?.price) }}
          </div>
          <div v-else-if="row.variant_type === PRODUCT_VARIANT_TYPES.SINGLE">
            <div
              v-for="vari of row.variants"
              :key="vari.id"
            >
              {{ formatCurrency(vari?.inventory?.price) }}
            </div>
          </div>
          <div v-else-if="row.variant_type === PRODUCT_VARIANT_TYPES.COMBINE">
            <div
              v-for="vari of row.variants"
              :key="vari.id"
            >
              <div
                v-for="variOpt of vari.variant_options"
                :key="variOpt.id"
              >
                {{ formatCurrency(variOpt.inventory.price) }}
              </div>
            </div>
          </div>
        </template>
        <template #stock-data="{ row }">
          <div v-if="row.variant_type === PRODUCT_VARIANT_TYPES.NONE">
            {{ row?.inventory?.stock ?? 0 }}
          </div>
          <div v-else-if="row.variant_type === PRODUCT_VARIANT_TYPES.SINGLE">
            <div
              v-for="vari of row.variants"
              :key="vari.id"
            >
              {{ vari?.inventory?.stock }}
            </div>
          </div>
          <div v-else-if="row.variant_type === PRODUCT_VARIANT_TYPES.COMBINE">
            <div
              v-for="vari of row.variants"
              :key="vari.id"
            >
              <div
                v-for="variOpt of vari.variant_options"
                :key="variOpt.id"
              >
                {{ variOpt.inventory.stock }}
              </div>
            </div>
          </div>
        </template>

        <template #actions-data="{ row }">
          <div class="flex items-center justify-end">
            <UTooltip text="Edit">
              <UButton
                :to="`${ROUTES.ACCOUNT}${ROUTES.SHOP}${ROUTES.PRODUCTS}/${row.id}`"
                color="gray"
                variant="ghost"
                class="p-1.5"
              >
                <Icon
                  name="i-material-symbols:ink-pen-rounded"
                  class=" cursor-pointer"
                />
              </UButton>
            </UTooltip>
            <UDropdown :items="itemsDropdownWithRow(row)">
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-ellipsis-horizontal-20-solid"
              />
            </UDropdown>
          </div>
        </template>
      </UTable>
      <FixedPagination
        :page="page"
        :page-count="pageCount"
        :total="data?.totalResults"
        @on-change-page="(val) => page = val"
      />
    </template>
  </LayoutShopWrapperContent>
</template>
