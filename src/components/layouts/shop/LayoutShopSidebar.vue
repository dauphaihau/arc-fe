<script setup lang="ts">

import avatarDefault from '~/assets/images/avatar-default.jpg';
import { ROUTES } from '~/config/enums/routes';

const routes = useRoute();
const authStore = useAuthStore();

const { ACCOUNT, SHOP, PRODUCTS } = ROUTES;

const itemsLinkSidebar = [
  { id: 'db', title: 'Dashboard', route: `${ACCOUNT}${SHOP}/dashboard` },
  { id: 'pd', title: 'Products', route: ACCOUNT + SHOP + PRODUCTS },
  {
    id: 'ms', title: 'Messages', route: `${ACCOUNT}${SHOP}/messages`, disabled: true,
  },
  {
    id: 'os', title: 'Orders & Shipping', route: `${ACCOUNT}${SHOP}/orders`, disabled: true,
  },
  { id: 'mt', title: 'Marketing +', route: `${ACCOUNT}${SHOP}/marketing` },
  {
    id: 'fc', title: 'Finances', route: `${ACCOUNT}${SHOP}/finances`, disabled: true,
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
      class="mb-4 mx-4 mt-3 p-2 pr-3 rounded  hover:bg-customGray-200/50 duration-200"
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

    <div class="flex flex-col gap-3 relative">
      <div v-for="(item, index) of itemsLinkSidebar" :key="index">
        <LayoutShopMarketingSlide v-if="item.id === 'mt'" @open-slide="(val) => isOpen = val " />
        <ULink
          v-else
          prefetch
          :to="item.route"
          :disabled="item?.disabled"
          active-class="text-primary border-l-2 border-primary"
          inactive-class="text-customGray-900 hover:text-customGray-950 border-l-2 border-transparent"
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
</template>

<style scoped>

.icon-button {
  padding: 8px;
}

</style>
