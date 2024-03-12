<script setup lang="ts">
import { ROUTES } from '~/config/enums/routes';

const {
  ACCOUNT, SHOP, PRODUCTS, COUPONS,
} = ROUTES;

const itemsHeaderDropdown = [
  [{
    label: 'Product',
    icon: 'i-heroicons-cube',
    shortcuts: ['P'],
    click: () => {
      navigateTo(`${ACCOUNT}${SHOP}${PRODUCTS}/new`);
    },
  }, {
    label: 'Coupon',
    icon: 'i-heroicons-ticket',
    shortcuts: ['C'],
    // disabled: true,
    click: () => {
      navigateTo(`${ACCOUNT}${SHOP}${COUPONS}/new`);
    },
  }],
];

</script>


<template>
  <header
    class="flex justify-between items-center pl-6 pr-10 2xl:pr-4 py-3
               fixed bg-white z-[1] w-shop-layout-content
               backdrop-blur-xl 2xl:backdrop-blur-sm bg-white/50
              "
  >
    <div class="hover:bg-customGray-100 h-fit rounded-lg">
      <UInput
        icon="i-heroicons-magnifying-glass-20-solid"
        placeholder="Search"
        variant="none"
        class="w-full text-customGray-800"
        :ui="{
          placeholder: 'placeholder-customGray-800',
          icon: {
            base: 'text-customGray-800'
          }
        }"
        size="md"
      />
    </div>

    <div class="flex items-center gap-4">
      <UTooltip text="Notifications">
        <UButton
          color="gray"
          variant="ghost"
          class="icon-button"
        >
          <Icon name="i-heroicons-bell" class="heroicon-sw-2" />
        </UButton>
      </UTooltip>
      <UTooltip text="Setting">
        <UButton
          color="gray"
          variant="ghost"
          class="icon-button"
        >
          <Icon name="i-heroicons-cog-8-tooth" class="heroicon-sw-2" />
        </UButton>
      </UTooltip>
      <UDropdown :items="itemsHeaderDropdown">
        <UTooltip text="Create">
          <UButton
            :ui="{ rounded: 'rounded-full' }"
            icon="i-heroicons-plus"
            size="xs"
            color="primary"
            square
            variant="solid"
          />
        </UTooltip>
      </UDropdown>
    </div>
  </header>
</template>


<style scoped>

</style>
