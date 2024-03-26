<script setup lang="ts">

import { useSessionStorage } from '@vueuse/core';
import type { ICategory } from '~/interfaces/category';
import { SESSION_STORAGE_KEYS } from '~/config/enums/session-storage-keys';
import type { IUserActivitiesSessionStorage } from '~/interfaces/common';

const { $api } = useNuxtApp();

const { data, pending } = await $api.category.getCategories();

const redirectCategoriesPage = (category: ICategory) => {
  const to = '/c/' + category.name.replaceAll(' ', '-').toLowerCase();

  sessionStorage.removeItem(SESSION_STORAGE_KEYS.CATEGORY);
  useSessionStorage(SESSION_STORAGE_KEYS.CATEGORY, category);

  sessionStorage.removeItem(SESSION_STORAGE_KEYS.CATEGORIES);
  useSessionStorage(SESSION_STORAGE_KEYS.CATEGORIES, [{ ...category, to }]);

  const userActivities = parseJSON<IUserActivitiesSessionStorage>(
    sessionStorage.getItem(SESSION_STORAGE_KEYS.USER_ACTIVITIES
    ));
  sessionStorage.removeItem(SESSION_STORAGE_KEYS.USER_ACTIVITIES);
  useSessionStorage(
    SESSION_STORAGE_KEYS.USER_ACTIVITIES,
    { ...userActivities, rootCategoryVisited: category }
  );
  navigateTo(to);
};

</script>

<template>
  <div>
    <!--    <UPopover :popper="{ offsetDistance: 0 }">-->
    <!--      <UButton-->
    <!--        color="gray"-->
    <!--        variant="ghost"-->
    <!--        class="icon-button"-->

    <!--      >-->
    <!--        <Icon name="i-material-symbols:menu" color="black" />-->
    <!--        Categories-->
    <!--      </UButton>-->

    <!--      <template #panel="{ close }">-->
    <!--        <div class="p-2 flex flex-col gap-3">-->
    <!--          <div v-if="pending">-->
    <!--            loading...-->
    <!--          </div>-->
    <!--          <div v-else>-->
    <!--            <div v-for="(cg, index) of data?.categories" :key="index">-->
    <!--              <UButton-->
    <!--                color="gray"-->
    <!--                variant="ghost"-->
    <!--                class="icon-button capitalize w-full"-->
    <!--                @click="() => {-->
    <!--                  redirectCategoriesPage(cg)-->
    <!--                  close()-->
    <!--                }"-->
    <!--              >-->
    <!--                {{ cg.name }}-->
    <!--              </UButton>-->
    <!--            </div>-->
    <!--          </div>-->
    <!--        </div>-->

    <!--      </template>-->
    <!--    </UPopover>-->

    <div class="">
      <div v-if="pending">
        loading...
      </div>
      <div v-else>
        <div class="flex gap-3">
          <div v-for="(cg, index) of data?.categories" :key="index">
            <UButton
              color="gray"
              variant="ghost"
              class="icon-button capitalize w-full"
              @click="() => redirectCategoriesPage(cg)"
            >
              {{ cg.name }}
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
