<script setup lang="ts">
import { useSessionStorage } from '@vueuse/core';
import type { CategorySessionStorage } from '~/types/category';
import { SESSION_STORAGE_KEYS } from '~/config/enums/session-storage-keys';
import type { UserActivitiesSessionStorage } from '~/types/common';
import { useGetCategories } from '~/services/category';

const route = useRoute();

const redirectErrorPage = () => {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true,
  });
};

const categoryId = computed(() => {
  const categoriesInSS = parseJSON<CategorySessionStorage[]>(
    sessionStorage.getItem(SESSION_STORAGE_KEYS.CATEGORIES));

  const categoryInSS = parseJSON<CategorySessionStorage>(
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

const {
  isPending: isPendingGetCategories,
  data: dataCategories,
} = useGetCategories({
  parent: categoryId.value,
});

onMounted(() => {
  if (dataCategories.value) {
    const userActivities = parseJSON<UserActivitiesSessionStorage>(
      sessionStorage.getItem(SESSION_STORAGE_KEYS.USER_ACTIVITIES)
    );
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.USER_ACTIVITIES);
    useSessionStorage(
      SESSION_STORAGE_KEYS.USER_ACTIVITIES,
      { ...userActivities, subCategories: dataCategories.value.categories.slice(0, 2) }
    );
  }
});

const redirectPage = (category: CategorySessionStorage) => {
  sessionStorage.removeItem(SESSION_STORAGE_KEYS.CATEGORY);
  useSessionStorage(SESSION_STORAGE_KEYS.CATEGORY, category);

  const categoriesInSS = parseJSON<CategorySessionStorage[]>(
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
    <div v-if="isPendingGetCategories">
      <LoadingSvg :child-class="'!w-8 !h-8'" />
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
