<script setup lang="ts">

import { useSessionStorage } from '@vueuse/core';
import type { ICategory } from '~/interfaces/category';

const { $api } = useNuxtApp();

const { data, pending } = await $api.category.getCategories();

const redirect = (category: ICategory) => {
  const to = '/c/' + category.name.replaceAll(' ', '-').toLowerCase();
  sessionStorage.removeItem('category');
  sessionStorage.removeItem('categories');

  useSessionStorage('category', category);
  useSessionStorage('categories', [{ ...category, to }]);
  navigateTo(to);
};

</script>

<template>
  <div>
    <UPopover :popper="{ offsetDistance: 0 }">
      <UButton
        color="gray"
        variant="ghost"
        class="icon-button"
      >
        <Icon name="i-material-symbols:menu" color="black" />
        Categories
      </UButton>

      <template #panel="{ close }">
        <div class="p-2 flex flex-col gap-3">
          <div v-if="pending">
            loading...
          </div>
          <div v-else>
            <div v-for="(cg, index) of data?.categories" :key="index">
              <UButton
                color="gray"
                variant="ghost"
                class="icon-button capitalize w-full"
                @click="() => {
                  redirect(cg)
                  close()
                }"
              >
                {{ cg.name }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>
