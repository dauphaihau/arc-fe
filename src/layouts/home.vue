<script setup lang="ts">

import { ROUTES } from '~/config/enums/routes';

const route = useRoute();

const links = [
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

</script>

<template>
  <HeaderMain />
  <div class="max-w-[1300px] mx-auto mt-[62px]">
    <div
      v-if="route.path.includes(ROUTES.ACCOUNT)"
      class="flex gap-20 max-w-[900px] mx-auto mt-28"
    >
      <UVerticalNavigation :links="links" />
      <slot />
    </div>
    <slot v-else />
  </div>
  <!--    <footer>footer</footer>-->
  <RegisterLoginDialog />
</template>
