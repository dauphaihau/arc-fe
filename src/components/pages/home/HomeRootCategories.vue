<script setup lang="ts">
import { useSessionStorage } from '@vueuse/core';
import type { ICategory } from '~/interfaces/category';
import { SESSION_STORAGE_KEYS } from '~/config/enums/session-storage-keys';
import type { IUserActivitiesSessionStorage } from '~/interfaces/common';
import { ROUTES } from '~/config/enums/routes';

const config = useRuntimeConfig();

const categories = computed(() => {
  const rootCategories = parseJSON<ICategory[]>(sessionStorage[SESSION_STORAGE_KEYS.ROOT_CATEGORIES]);
  return rootCategories || [];
});

const redirectByCategory = (category: ICategory) => {
  const to = `${ROUTES.C}/${category.name.replaceAll(' ', '-').toLowerCase()}`;

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
  <div v-if="categories.length > 0">
    <h3 class="text-3xl font-normal mb-6 text-center">
      Shop by category
    </h3>
    <div class="flex justify-center gap-8">
      <div v-for="(cg, index) of categories" :key="index">
        <div @click="() => redirectByCategory(cg)">
          <NuxtImg
            v-if="cg?.relative_url_image"
            :src="config.public.awsHostBucket + '/' + cg.relative_url_image"
            width="140"
            height="210"
            class="rounded max-w-[140px] max-h-[210px] cursor-pointer"
          />
          <div
            class="capitalize text-[13px] font-semibold cursor-pointer text-center mt-2"
          >
            {{ cg.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
