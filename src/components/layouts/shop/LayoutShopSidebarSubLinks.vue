<script setup lang="ts">
import type { ILink } from './LayoutShopSidebar.vue';

const { data } = defineProps<{ data: ILink }>();

const routes = useRoute();

const isOpen = ref(false);

const itemsLinkRoutes = Array.isArray(data.sub) && data.sub.map(item => item.route);

</script>

<template>
  <div v-if="!itemsLinkRoutes" />
  <div v-else>
    <div
      :class="[
        'link-default border-l-2 border-transparent pr-3 w-full pl-2 cursor-pointer ',
        new RegExp(itemsLinkRoutes.join('|')).test(routes.path) && 'border-l-2 !border-primary'
      ]"
      @click="isOpen = !isOpen"
    >
      <div
        class="w-full flex justify-between link-theme"
        :class="[
          new RegExp(itemsLinkRoutes.join('|')).test(routes.path) ? 'link-active' : 'link-inactive'
        ]"
      >
        {{ data.title }}

        <UIcon
          name="i-heroicons-plus-20-solid"
          :class="[
            'transition-all transform',
            isOpen ? '-rotate-45' : 'rotate-90'
          ]"
        />
      </div>
    </div>

    <transition name="slide-down">
      <div v-if="isOpen">
        <div class="ml-3 pl-3 mt-3 pr-7">
          <div v-for="(item, index) in data.sub" :key="index">
            <div
              class="flex"
              :class="[item.disabled && 'opacity-50']"
            >
              <UDivider
                :ui="{ border: { base: routes.path.indexOf(item.route as string) > -1 && 'border-primary'}}"
                orientation="vertical"
                class="w-4 h-auto"
              />

              <NuxtLink
                :to="item?.disabled ? '' : item.route"
                class="w-full link-default link-theme"
                :class="[
                  routes.path.indexOf(item.route as string) > -1 ? 'link-active' : 'link-inactive',
                  item?.disabled && 'cursor-not-allowed'
                ]"
              >
                {{ item.title }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>

@import url("src/assets/css/layout-shop.css");
@import url("src/assets/css/animations.css");

</style>
