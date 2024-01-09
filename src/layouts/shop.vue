<script setup lang="ts">

import { ROUTES } from '~/config/enums/routes';

const links = [
  { title: 'Dashboard', route: '/account/shop/dashboard' },
  { title: 'Products', route: '/account/shop/products' },
  { title: 'Messages', route: '/account/shop/messages' },
  { title: 'Orders & Shipping', route: '/account/shop/orders' },
  { title: 'Marketing', route: '/account/shop/marketing' },
  // { title: 'Vouchers', route: '/account/shop/vouchers' },
  { title: 'Finances', route: '/account/shop/finances' },
  { title: 'Settings', route: '/account/shop/settings' },
  { title: 'Help', route: '/account/shop/help' },
];

const authStore = useAuthStore();
const shop = authStore.getShop;

const items = [
  [{
    label: 'Profile',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/739984?v=4',
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
        :items="items"
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
        <div v-for="(item, index) of links" :key="index">
          <ULink
            :to="item.route"
            active-class="text-primary border-l-2 border-primary"
            inactive-class="text-customGray-800 hover:text-customGray-900 border-l-2 border-white"
            class="font-medium w-full text-sm pl-5"
          >
            {{ item.title }}
          </ULink>
        </div>
      </div>
    </aside>
    <div class="h-full w-[250px] bg-red-300" />

    <div class="h-full grow">
      <header
        class="flex justify-between items-center pr-8 pl-4
      w-full py-3 fixed bg-white z-10 w-[calc(100%-250px)]"
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
              <Icon name="uil:bell" />
            </UButton>
          </UTooltip>
        </div>
      </header>

      <div class="px-8 mt-16 min-h-screen">
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
