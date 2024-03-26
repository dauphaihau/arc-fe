<script setup lang="ts">

import avatarDefault from '~/assets/images/avatar-default.jpg';
import { ROUTES } from '~/config/enums/routes';

const routes = useRoute();
const authStore = useAuthStore();

const {
  ACCOUNT, SHOP, PRODUCTS, COUPONS, SALES,
} = ROUTES;

type ILinkBase = {
  title: string
  route?: string
  disabled?: boolean
}

export type ILink = {
  sub?: ILinkBase[]
} & ILinkBase

const itemsLinkSidebar: ILink[] = [
  { title: 'Dashboard', route: `${ACCOUNT}${SHOP}/dashboard` },
  { title: 'Products', route: ACCOUNT + SHOP + PRODUCTS },
  {
    title: 'Messages', route: `${ACCOUNT}${SHOP}/messages`, disabled: true,
  },
  {
    title: 'Orders & Shipping', route: `${ACCOUNT}${SHOP}/orders`, disabled: true,
  },
  {
    title: 'Marketing',
    sub: [
      {
        title: 'Ads',
        disabled: true,
        route: `${ACCOUNT}${SHOP}/ads`,
      },
      {
        title: 'Sales',
        route: `${ACCOUNT}${SHOP}${SALES}`,
      },
      {
        title: 'Coupons',
        route: `${ACCOUNT}${SHOP}${COUPONS}`,
      },
    ],
  },
  {
    title: 'Finances', route: `${ACCOUNT}${SHOP}/finances`, disabled: true,
  },
];

const isOpen = ref(false);

const itemsShopDropdown = [
  [{
    label: 'Profile',
    avatar: {
      src: avatarDefault,
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
  <aside
    class="w-shop-layout-sidebar fixed h-full z-[3]"
    :class="[{ 'bg-layout-shop': !isOpen }]"
  >
    <UDropdown
      :items="itemsShopDropdown"
      :popper="{ placement: 'bottom-start', offsetDistance: 20, offsetSkid: -8 }"
      class="mb-6 mx-4 mt-3 p-2 pr-3 rounded-md  hover:bg-customGray-200/50 duration-200"
    >
      <div class="flex items-center gap-2">
        <UButton
          color="gray"
          class="p-2"
        >
          <Icon name="uil:shop" class="h-4 w-4" />
        </UButton>
        <div class="text-sm font-medium text-customGray-950">
          {{ authStore.getShop?.shop_name }}
        </div>
      </div>
    </UDropdown>

    <div class="flex flex-col gap-1 relative">
      <div v-for="(item, index) of itemsLinkSidebar" :key="index">
        <LayoutShopSidebarSubLinks v-if="item?.sub || !item.route" :data="item" />

        <div
          v-else
          class="flex"
          :class="[item.disabled && 'opacity-50']"
        >
          <UDivider
            :ui="{ border: { base: routes.path.indexOf(item.route) > -1 ? 'border-primary' : 'border-transparent'}}"
            orientation="vertical"
            class="w-[3px] h-auto"
            size="sm"
          />

          <NuxtLink
            :to="item?.disabled ? '' : item.route"
            prefetch
            class="w-full link-default link-theme ml-2 mr-4"
            :class="[
              'pl-5',
              routes.path.includes(item.route) ? 'link-active' : 'link-inactive'
            ]"
          >
            {{ item.title }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>

@import url("src/assets/css/layout-shop.css");

</style>
