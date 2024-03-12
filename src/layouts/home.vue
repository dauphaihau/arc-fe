<script setup lang="ts">

import { ROUTES } from '~/config/enums/routes';

const route = useRoute();

const linksAccountSidebar = [
  {
    label: 'Account',
    icon: 'i-heroicons-user',
    to: ROUTES.ACCOUNT,
  },
  {
    label: 'Shipping',
    icon: 'i-heroicons-map-pin',
    to: ROUTES.ACCOUNT + ROUTES.ADDRESSES,
  },
  {
    label: 'Preferences',
    disabled: true,
    icon: 'i-heroicons-cog',
    to: ROUTES.HOME,
  },
  {
    label: 'Payment',
    icon: 'i-heroicons-credit-card',
    to: ROUTES.HOME,
  },
  {
    label: 'Privacy',
    icon: 'i-heroicons-shield-check',
    to: ROUTES.HOME,
  },
];

const isAccountRoute = ref(false);

watch(() => route.path, () => {
  isAccountRoute.value = route.path.includes(ROUTES.ACCOUNT);
});

</script>

<template>
  <LayoutHomeHeader />
  <div class="max-w-home-layout mx-auto pt-14 pb-32 pb-[500px]">
    <div
      v-if="isAccountRoute"
      class="flex gap-10 max-w-[900px] min-h-[50vh] mx-auto mt-24"
    >
      <UVerticalNavigation
        class="w-1/5 flex-none h-fit"
        :links="linksAccountSidebar"
        :ui="{
          wrapper: 'border-s border-gray-200 dark:border-gray-800 space-y-2',
          base: 'group block border-s -ms-px leading-6 before:hidden py-2 flex items-center',
          padding: 'p-0 ps-4',
          rounded: '',
          font: '',
          ring: '',
          active: 'text-primary-500 dark:text-primary-400 border-current font-semibold',
          inactive: 'border-transparent hover:border-gray-400 text-gray-700 hover:text-gray-900',
          icon: {
            base: 'text-primary-500',
            active: '!text-primary-500 dark:text-primary-400 border-current font-semibold',
            inactive: 'border-transparent hover:border-gray-400 text-gray-700 hover:text-gray-900'
          }
        }"
      />
      <slot />
    </div>

    <div v-else>
      <slot />
    </div>
  </div>
  <LayoutHomeFooter />
</template>
