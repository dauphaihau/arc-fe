<script setup lang="ts">
import { SESSION_STORAGE_KEYS } from '~/config/enums/session-storage-keys';
import type { CategorySessionStorage, Category } from '~/types/category';
import type { UserActivitiesSessionStorage } from '~/types/common';
import { useGetCategories } from '~/services/category';

const state = reactive({
  category: computed(() => {
    const userActivities = parseJSON<UserActivitiesSessionStorage>(
      sessionStorage.getItem(SESSION_STORAGE_KEYS.USER_ACTIVITIES
      ));
    return userActivities?.rootCategoryVisited || null;
  }),
  categories: [] as Category[],
  loading: false,
});

const {
  data,
  isPending: isPendingGetCategories,
  isFetching: isFetchingGetCategories,
} = useGetCategories(state.category?.id ? { parent: state.category.id } : undefined);

const redirectPage = (category: CategorySessionStorage) => {
  sessionStorage.removeItem(SESSION_STORAGE_KEYS.CATEGORY);
  useSessionStorage(SESSION_STORAGE_KEYS.CATEGORY, category);

  const categoriesInSS = parseJSON<CategorySessionStorage[]>(
    sessionStorage.getItem(SESSION_STORAGE_KEYS.CATEGORIES)
  );

  if (categoriesInSS && state.category?.name) {
    const newCategories = categoriesInSS.filter(c => c.parent !== category.parent);

    const lower = (str: string) => str.replaceAll(' ', '-').toLowerCase();
    const to = `c/${lower(state.category.name)}/${lower(category.name)}`;

    newCategories.push({ ...category, to });

    sessionStorage.removeItem(SESSION_STORAGE_KEYS.CATEGORIES);
    useSessionStorage(SESSION_STORAGE_KEYS.CATEGORIES, newCategories);

    navigateTo(to);
  }
};
</script>

<template>
  <div>
    <div
      v-if="isFetchingGetCategories && isPendingGetCategories"
      class="flex gap-16"
    >
      <div
        v-for="index in 4"
        :key="index"
      >
        <USkeleton
          class="size-28"
          :ui="{ rounded: 'rounded-full' }"
        />
      </div>
    </div>
    <div v-else-if="data?.categories && data.categories.length > 0">
      <div class="mb-6">
        <h3 class="text-lg font-medium">
          Recommended categories for you
        </h3>
        <p class="text-md text-customGray-900">
          Based on your activity
        </p>
      </div>
      <div class="flex gap-16">
        <div
          v-for="cg of data.categories"
          :key="cg.id"
        >
          <div @click="() => redirectPage(cg)">
            <div v-if="cg?.relative_url_image">
              <NuxtImg
                :src="`domainAwsS3/${cg.relative_url_image}`"
                width="100"
                height="100"
                class="cursor-pointer rounded-full"
              />
            </div>
            <div
              class="mt-2 cursor-pointer text-center text-[13px] font-semibold capitalize"
            >
              {{ cg.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
