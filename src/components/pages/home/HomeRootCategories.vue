<script setup lang="ts">
import { useSessionStorage } from '@vueuse/core';
import type { Category } from '~/types/category';
import { SESSION_STORAGE_KEYS } from '~/config/enums/session-storage-keys';
import type { UserActivitiesSessionStorage } from '~/types/common';
import { ROUTES } from '~/config/enums/routes';

const store = useStore();

const redirectByCategory = (category: Category) => {
  const to = `${ROUTES.C}/${category.name.replaceAll(' ', '-').toLowerCase()}`;

  sessionStorage.removeItem(SESSION_STORAGE_KEYS.CATEGORY);
  useSessionStorage(SESSION_STORAGE_KEYS.CATEGORY, category);

  sessionStorage.removeItem(SESSION_STORAGE_KEYS.CATEGORIES);
  useSessionStorage(SESSION_STORAGE_KEYS.CATEGORIES, [{ ...category, to }]);

  const userActivities = parseJSON<UserActivitiesSessionStorage>(
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
  <div v-if="store.rootCategories.length > 0">
    <h3 class="mb-6 text-center text-3xl font-normal">
      Shop by category
    </h3>
    <div class="flex justify-center gap-8">
      <div
        v-for="(cg, index) of store.rootCategories"
        :key="index"
      >
        <div @click="() => redirectByCategory(cg)">
          <NuxtImg
            v-if="cg?.relative_url_image"
            :src="`domainAwsS3/${cg.relative_url_image}`"
            width="140"
            height="210"
            class="cursor-pointer rounded"
          />
          <div
            class="mt-2 cursor-pointer text-center text-[13px] font-semibold capitalize"
          >
            {{ cg.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
