<script setup lang="ts">

import avatarDefault from '../assets/images/avatar-default.jpg';
import { ROUTES } from '~/config/enums/routes';

const routes = useRoute();
const authStore = useAuthStore();

const {
  ACCOUNT, SHOP, PRODUCTS, COUPONS,
} = ROUTES;

const itemsLinkSidebar = [
  { title: 'Dashboard', route: `${ACCOUNT}${SHOP}/dashboard` },
  { title: 'Products', route: ACCOUNT + SHOP + PRODUCTS },
  { title: 'Messages', route: `${ACCOUNT}${SHOP}/messages` },
  { title: 'Orders & Shipping', route: `${ACCOUNT}${SHOP}/orders` },
  { title: 'Marketing', route: `${ACCOUNT}${SHOP}/marketing` },
  { title: 'Coupons', route: ACCOUNT + SHOP + COUPONS },
  { title: 'Finances', route: `${ACCOUNT}${SHOP}/finances` },
];

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

const shop = authStore.getShop;

const itemsShopDropdown = [
  [{
    label: 'Profile',
    avatar: {
      src: avatarDefault,
      // src: 'https://avatars.githubusercontent.com/u/739984?v=4',
    },
    click: () => {
      navigateTo(ROUTES.ACCOUNT);
    },
  }], [
    {
      label: 'Archive',
      icon: 'i-heroicons-archive-box-20-solid',
    },
    {
      label: 'Arc Marketplace',
      icon: 'i-heroicons-arrow-right-circle-20-solid',
      click: () => {
        navigateTo(ROUTES.HOME);
      },
    }], [{
    label: 'Logout',
    icon: 'i-heroicons-arrow-left-start-on-rectangle',
    click: () => {
      authStore.logout();
    },
  }],
];

</script>

<template>
  <div class="flex min-h-screen max-w-[1650px] xl:mx-auto">
    <aside
      class="
        w-[250px] bg-gradient-to-t from-[#f6f8fa] via-[#f6f8fa] to-[#fcfcfd] fixed h-full z-10"
    >
      <UDropdown
        :items="itemsShopDropdown"
        :popper="{ placement: 'bottom-start' }"
        class="mb-4 m-4 p-2 rounded  hover:bg-customGray-200/50 duration-200"
      >
        <div class="flex items-center gap-2">
          <UButton
            color="gray"
            class="p-2"
          >
            <Icon name="uil:shop" class="h-4 w-4" />
          </UButton>
          <div class="text-sm font-medium text-customGray-950">
            {{ shop?.shop_name }}
          </div>
        </div>
      </UDropdown>

      <div class="flex flex-col gap-3">
        <div v-for="(item, index) of itemsLinkSidebar" :key="index">
          <ULink
            :to="item.route"
            active-class="text-primary border-l-2 border-primary"
            inactive-class="text-customGray-800 hover:text-customGray-900 border-l-2 border-white"
            :class="[
              'font-medium w-full text-sm pl-5',
              routes.path.includes(item.route) && 'text-primary border-l-2 !border-primary'
            ]"
          >
            {{ item.title }}
          </ULink>
        </div>
      </div>
    </aside>
    <div class="h-full w-[250px] bg-red-300" />

    <div class="h-full grow">
      <header
        class="flex justify-between items-center pl-6 pr-10 py-3
               fixed bg-white z-[1] max-w-[1400px] w-[calc(100%-250px)]
               backdrop-blur-xl bg-white/50
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

      <div class="px-10 mt-24 min-h-screen">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>

.icon-button {
  padding: 8px;
}

</style>
