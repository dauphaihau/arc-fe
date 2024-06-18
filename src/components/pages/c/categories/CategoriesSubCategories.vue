<script setup lang="ts">
import { useSessionStorage } from '@vueuse/core';
import type { ICategorySessionStorage } from '~/interfaces/category';
import { SESSION_STORAGE_KEYS } from '~/config/enums/session-storage-keys';
import type { IUserActivitiesSessionStorage } from '~/interfaces/common';

const { $api } = useNuxtApp();
const route = useRoute();

const redirectErrorPage = () => {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true,
  });
};

const categoryId = computed(() => {
  const categoriesInSS = parseJSON<ICategorySessionStorage[]>(
    sessionStorage.getItem(SESSION_STORAGE_KEYS.CATEGORIES));

  const categoryInSS = parseJSON<ICategorySessionStorage>(
    sessionStorage.getItem(SESSION_STORAGE_KEYS.CATEGORY));

  if (!categoryInSS) {
    return redirectErrorPage();
  }
  const categoryInSSByPath = categoriesInSS && categoriesInSS.find(c => c.to === route.fullPath);
  if (categoryInSSByPath) {
    return categoryInSSByPath.id;
  }
  return categoryInSS.id;
});

const { data: dataCategories, pending: pendingDataCategories } = await $api.category.getCategories({
  parent: categoryId.value,
});

onMounted(() => {
  if (dataCategories.value) {
    const userActivities = parseJSON<IUserActivitiesSessionStorage>(
      sessionStorage.getItem(SESSION_STORAGE_KEYS.USER_ACTIVITIES)
    );
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.USER_ACTIVITIES);
    useSessionStorage(
      SESSION_STORAGE_KEYS.USER_ACTIVITIES,
      { ...userActivities, subCategories: dataCategories.value.categories.slice(0, 2) }
    );
  }
});

const redirectPage = (category: ICategorySessionStorage) => {
  sessionStorage.removeItem(SESSION_STORAGE_KEYS.CATEGORY);
  useSessionStorage(SESSION_STORAGE_KEYS.CATEGORY, category);

  const categoriesInSS = parseJSON<ICategorySessionStorage[]>(
    sessionStorage.getItem(SESSION_STORAGE_KEYS.CATEGORIES));

  if (categoriesInSS) {
    const newCategories = categoriesInSS.filter(c => c.parent !== category.parent);

    const to = route.fullPath + '/' + category.name.replaceAll(' ', '-').toLowerCase();

    newCategories.push({ ...category, to });

    sessionStorage.removeItem(SESSION_STORAGE_KEYS.CATEGORIES);
    useSessionStorage(SESSION_STORAGE_KEYS.CATEGORIES, newCategories);

    navigateTo(to);
  }
};
</script>

<template>
  <div class="mb-8 flex gap-3">
    <div v-if="pendingDataCategories">
      loading...
    </div>
    <div v-else>
      <div class="flex flex-col gap-2">
        <div
          v-for="cg of dataCategories?.categories"
          :key="cg.id"
        >
          <div
            class="cursor-pointer text-base font-medium capitalize"
            @click="() => redirectPage(cg)"
          >
            {{ cg.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
