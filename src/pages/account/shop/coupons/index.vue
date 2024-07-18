<script lang="ts" setup>
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import type { DropdownItem } from '#ui/types';
import { ROUTES } from '~/config/enums/routes';
import { COUPON_APPLIES_TO, COUPON_TYPES } from '~/config/enums/coupon';
import { useShopGetCoupons } from '~/services/shop';
import { CREATE_COUPON_PAGE_TYPES } from '~/config/enums/shop';

dayjs.extend(localizedFormat);

definePageMeta({ layout: 'shop', middleware: ['auth'] });

const selected = ref([]);
const pageCount = 10;
const page = ref(1);

const {
  isPending: isPendingShopGetCoupons,
  data: dataShopGetCoupons,
} = useShopGetCoupons({
  page: page.value,
});

const columns = [
  {
    key: 'code',
    label: 'Code',
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
  if (dataShopGetCoupons.value?.results && dataShopGetCoupons.value.results.length > 0) {
    return dataShopGetCoupons.value.results.map(coupon => ({
      ...coupon,
      start_date: dayjs(coupon.start_date).format('hh:mm - L'),
      end_date: dayjs(coupon.end_date).format('hh:mm - L'),
      actions: { class: 'text-right' },
    }));
  }
  return [];
});

const itemsDropdownWithRow = (row: { id: string }): DropdownItem[][] => [
  [
    {
      label: 'Edit',
      icon: 'i-heroicons-pencil-square-20-solid',
      click: () => row,
      // click: () => console.log('Edit', row.id),
    },
    {
      label: 'Duplicate',
      disabled: true,
      icon: 'i-heroicons-document-duplicate-20-solid',
    },
  ],
  [
    {
      label: 'Archive',
      disabled: true,
      icon: 'i-heroicons-archive-box-20-solid',
    },
    {
      label: 'Preview',
      icon: 'i-heroicons-arrow-right-circle-20-solid',
      disabled: true,
    },
  ],
  [
    {
      label: 'Delete',
      disabled: true,
      icon: 'i-heroicons-trash-20-solid',
    },
  ],
];
</script>

<template>
  <LayoutShopWrapperContent>
    <template #title>
      Coupons
    </template>
    <template #actions>
      <div class="space-x-3">
        <UButton
          :to="`${ROUTES.ACCOUNT}${ROUTES.SHOP}${ROUTES.COUPONS}${ROUTES.NEW}?type=${CREATE_COUPON_PAGE_TYPES.PROMO_CODE}`"
          size="sm"
        >
          + Create a promo code
        </UButton>
        <UButton
          :to="`${ROUTES.ACCOUNT}${ROUTES.SHOP}${ROUTES.COUPONS}${ROUTES.NEW}?type=${CREATE_COUPON_PAGE_TYPES.SALE}`"
          size="sm"
        >
          + Run sale
        </UButton>
      </div>
    </template>

    <template #content>
      <UTable
        v-model="selected"
        :empty-state="{ icon: 'i-heroicons-archive-box-20-solid', label: 'No coupons.' }"
        :rows="rows"
        :columns="columns"
        :loading="isPendingShopGetCoupons"
        :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
      >
        <template #code-data="{ row }">
          <div>
            <div class="text-xs">
              {{ row.is_auto_sale ? 'Sale' : 'Promo code' }}
            </div>
            <div class="text-xs">
              {{ row.code }}
            </div>
          </div>
        </template>

        <template #applies-to-data="{ row }">
          <div class="text-center">
            {{ row.applies_to === COUPON_APPLIES_TO.ALL ? 'All' : `${row.applies_product_ids.length}` }} products
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
            <UTooltip text="Feature not available">
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
            <UTooltip text="Feature not available">
              <UDropdown
                disabled
                :items="itemsDropdownWithRow(row)"
              >
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-ellipsis-horizontal-20-solid"
                />
              </UDropdown>
            </UTooltip>
          </div>
        </template>
      </UTable>
      <FixedPagination
        :page="page"
        :page-count="pageCount"
        :total="dataShopGetCoupons?.totalResults"
        @on-change-page="(val) => page = val"
      />
    </template>
  </LayoutShopWrapperContent>
</template>
