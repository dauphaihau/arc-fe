<script setup lang="ts">
import { ROUTES } from '~/config/enums/routes';
const isOpen = ref(false);

const emit = defineEmits<{ (e: 'openSlide', value: boolean): void }>();

const routes = useRoute();

watch(isOpen, () => {
  emit('openSlide', isOpen.value);
});

const {
  ACCOUNT, SHOP, COUPONS,
} = ROUTES;

const itemsLinkSidebar = [
  {
    icon: 'i-mage-broadcast-fill',
    title: 'Arc Ads',
    description: 'Make your products more prominent for millions of buyers searching',
    disabled: true,
    route: `${ACCOUNT}${SHOP}/ads`,
  },
  {
    icon: 'i-mdi-sale-outline',
    title: 'Run Sales',
    description: 'Set lower prices for all or few products',
    route: `${ACCOUNT}${SHOP}/sales`,
  },
  {
    icon: 'i-heroicons-ticket',
    title: 'Manage Coupons',
    description: 'Share your coupons with customers',
    route: ACCOUNT + SHOP + COUPONS,
  },
];

const itemsLinkRoutes = itemsLinkSidebar.map(item => item.route);

</script>

<template>
  <div
    :class="[
      'border-l-2 border-transparent font-medium w-full text-sm pl-5 cursor-pointer',
      new RegExp(itemsLinkRoutes.join('|')).test(routes.path) ?
        'text-primary border-l-2 !border-primary' : 'text-customGray-900 hover:text-customGray-950'
    ]"
    @click="isOpen = !isOpen"
  >
    Marketing +
  </div>

  <USlideover
    v-model="isOpen"
    side="left"
    :ui="{
      wrapper: 'z-[2]',
      width: 'max-w-[560px]',
    }"
  >
    <div class="flex">
      <div class="w-shop-layout-sidebar relative" />
      <div class="p-4 flex-1 w-sub-sidebar">
        <div class="flex justify-between mt-2 mb-4">
          <h3 class="font-medium text-customGray-900">
            Marketing
          </h3>
          <UButton
            :padded="false"
            color="gray"
            variant="link"
            icon="i-heroicons-x-mark-20-solid"
            @click="isOpen = false"
          />
        </div>
        <div v-for="item in itemsLinkSidebar" :key="item.title">
          <ULink
            :to="item.route"
            :disabled="item?.disabled"
            class="flex items-center gap-3 mb-6 hover:bg-zinc-100
            rounded-md px-1.5 py-2 cursor-pointer"
            @click="isOpen = false"
          >
            <Icon :name="item.icon" class="h-8 w-8 flex-none" />
            <div>
              <div class="font-medium text-customGray-900 text-sm">
                {{ item.title }}
              </div>
              <div class="text-zinc-500 text-xs">
                {{ item.description }}
              </div>
            </div>
          </ULink>
        </div>
      </div>
    </div>
  </USlideover>
</template>


<style scoped>

.w-sub-sidebar {
  width: 340px;
}

</style>
