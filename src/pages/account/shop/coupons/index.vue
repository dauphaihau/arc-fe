<script lang="ts" setup>

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { ROUTES } from '~/config/enums/routes';
import { COUPON_APPLIES_TO, COUPON_TYPES } from '~/config/enums/coupon';

// eslint-disable-next-line import/no-named-as-default-member
dayjs.extend(localizedFormat);

definePageMeta({ layout: 'shop', middleware: ['auth'] });

const { $api } = useNuxtApp();

const selected = ref([]);
const pageCount = 10;
const page = ref(1);
const { pending, data } = await $api.shop.getCoupons({
  page,
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
  return data.value?.results.map(prod => ({
    id: prod.id,
    title: prod.title,
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
});

const itemsDropdown = (row: { id: string }) => [
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
      Coupons
    </template>
    <template #actions>
      <UButton
        :to="`${ROUTES.ACCOUNT}${ROUTES.SHOP}${ROUTES.COUPONS}${ROUTES.NEW}`"
        size="md"
      >
        + Create a coupon
      </UButton>
    </template>

    <template #content>
      <UTable
        v-model="selected"
        :empty-state="{ icon: 'i-heroicons-archive-box-20-solid', label: 'No coupons.' }"
        :rows="rows"
        :columns="columns"
        :loading="pending"
        :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }"
      >
        <template #title-code-data="{ row }">
          <div>
            <div class="text-sm truncate max-w-80">
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
          <div v-if="row.type === COUPON_TYPES.FREE_SHIP" class="text-center">
            Freeship
          </div>
          <div v-if="row.type === COUPON_TYPES.PERCENTAGE" class="text-center">
            {{ row.percent_off }}%
          </div>
          <div v-if="row.type === COUPON_TYPES.FIXED_AMOUNT" class="text-center">
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
                <Icon name="i-material-symbols:ink-pen-rounded" class=" cursor-pointer" />
              </UButton>
            </UTooltip>
            <UDropdown :items="itemsDropdown(row)">
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
