<script lang="ts" setup>
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import type { DropdownItem } from '#ui/types';
import { ROUTES } from '~/config/enums/routes';
import { COUPON_APPLIES_TO, COUPON_TYPES } from '~/config/enums/coupon';
import type { ElementType } from '~/types/utils';
import { useShopGetCoupons } from '~/services/shop';

dayjs.extend(localizedFormat);

definePageMeta({ layout: 'shop', middleware: ['auth'] });

const selected = ref([]);
const pageCount = 10;
const page = ref(1);

const {
  isPending: isPendingShopGetSales,
  data: dataShopGetSales,
} = useShopGetCoupons({
  page: page.value,
  is_auto_sale: true,
});

const columns = [
  {
    key: 'title-code',
    label: 'Title | Code',
  },
  {
    key: 'applies-to',
    label: 'Products apply',
    class: 'text-center',
  },
  {
    key: 'discount',
    label: 'Discount',
    class: 'text-center',
    // key: 'type',
    // label: 'Coupon type | Discount',
  },
  {
    key: 'max_uses',
    label: 'Max total uses',
    class: 'text-center',
  },
  {
    key: 'status',
    label: 'Status | Date',
    class: 'text-center',
  },
  {
    key: 'actions',
  },
];

const rows = computed(() => {
  if (dataShopGetSales.value?.results && dataShopGetSales.value.results.length > 0) {
    return dataShopGetSales.value.results.map(prod => ({
      id: prod.id,
      code: prod.code,
      type: prod.type,
      max_uses: prod.max_uses,
      applies_to: prod.applies_to,
      percent_off: prod.percent_off,
      amount_off: prod.amount_off,
      start_date: dayjs(prod.start_date).format('hh:mm - L'),
      end_date: dayjs(prod.end_date).format('hh:mm - L'),
      actions: { class: 'text-right' },
    }));
  }
  return [];
});

const itemsDropdownWithRow = (row: ElementType<typeof rows.value>): DropdownItem[][] => [
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
</script>

<template>
  <LayoutShopWrapperContent>
    <template #title>
      Sales
    </template>
    <template #actions>
      <UButton
        :to="`${ROUTES.ACCOUNT}${ROUTES.SHOP}${ROUTES.SALES}/new`"
        size="sm"
      >
        + Run a sale
      </UButton>
    </template>
    <template #content>
      <UTable
        v-model="selected"
        :empty-state="{ icon: 'i-heroicons-archive-box-20-solid', label: 'No coupons.' }"
        :rows="rows"
        :columns="columns"
        :loading="isPendingShopGetSales"
        :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
      >
        <template #title-code-data="{ row }">
          <div>
            <div class="max-w-80 truncate text-sm">
              {{ row.title }}
            </div>
            <div class="text-xs">
              CODE: {{ row.code }}
            </div>
          </div>
        </template>

        <template #applies-to-data="{ row }">
          <div class="text-center">
            {{ row.applies_to === COUPON_APPLIES_TO.ALL ? 'All' : 'specify products' }}
          </div>
        </template>

        <template #discount-data="{ row }">
          <div
            v-if="row.type === COUPON_TYPES.FREE_SHIP"
            class="text-center"
          >
            Freeship
          </div>
          <div
            v-if="row.type === COUPON_TYPES.PERCENTAGE"
            class="text-center"
          >
            {{ row.percent_off }}%
          </div>
          <div
            v-if="row.type === COUPON_TYPES.FIXED_AMOUNT"
            class="text-center"
          >
            {{ formatCurrency(row.amount_off) }}
          </div>
        </template>

        <template #max_uses-data="{ row }">
          <div class="text-center">
            {{ row.max_uses }}
          </div>
        </template>

        <template #status-data="{ row }">
          <div class="text-center">
            {{ row.start_date }} - {{ row.end_date }}
          </div>
        </template>

        <template #actions-data="{ row }">
          <div class="flex items-center justify-end">
            <UTooltip text="Edit">
              <UButton
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
        :total="dataShopGetSales?.totalResults"
        @on-change-page="(val) => page = val"
      />
    </template>
  </LayoutShopWrapperContent>
</template>
