<script setup lang="ts">

import { PRODUCT_CATEGORIES } from '~/config/enums/product';

const categories = Object.values(PRODUCT_CATEGORIES);

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
          <div v-for="(cg, index) of categories" :key="index">
            <NuxtLink
              :to="'/c/' + cg"
              @click="close"
            >
              <UButton
                color="gray"
                variant="ghost"
                class="icon-button capitalize w-full"
              >
                {{ cg }}
              </UButton>
            </NuxtLink>
          </div>
        </div>
      </template>
    </UPopover>
  </div>
</template>
