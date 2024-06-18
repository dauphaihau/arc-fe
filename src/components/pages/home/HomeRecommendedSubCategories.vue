<script setup lang="ts">
import { SESSION_STORAGE_KEYS } from '~/config/enums/session-storage-keys';
import type { ICategorySessionStorage, ICategory } from '~/interfaces/category';
import type { IUserActivitiesSessionStorage } from '~/interfaces/common';

const config = useRuntimeConfig();
const { $api } = useNuxtApp();

const state = reactive({
  category: computed(() => {
    const userActivities = parseJSON<IUserActivitiesSessionStorage>(
      sessionStorage.getItem(SESSION_STORAGE_KEYS.USER_ACTIVITIES
      ));
    return userActivities?.rootCategoryVisited || null;
  }),
  categories: [] as ICategory[],
  loading: false,
});

onMounted(async () => {
  if (state.category?.id) {
    state.loading = true;
    const { data, pending, error } = await $api.category.getCategories({
      parent: state.category.id,
    });
    state.loading = pending.value;
    if (!error.value && data.value?.categories) {
      state.categories = data.value.categories;
    }
  }
});

const redirectPage = (category: ICategorySessionStorage) => {
  sessionStorage.removeItem(SESSION_STORAGE_KEYS.CATEGORY);
  useSessionStorage(SESSION_STORAGE_KEYS.CATEGORY, category);

  const categoriesInSS = parseJSON<ICategorySessionStorage[]>(
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
    <div v-if="state.loading">
      <div class="flex gap-16">
        <USkeleton
          class="size-28"
          :ui="{ rounded: 'rounded-full' }"
        />
        <USkeleton
          class="size-28"
          :ui="{ rounded: 'rounded-full' }"
        />
        <USkeleton
          class="size-28"
          :ui="{ rounded: 'rounded-full' }"
        />
        <USkeleton
          class="size-28"
          :ui="{ rounded: 'rounded-full' }"
        />
      </div>
    </div>
    <div v-else>
      <div v-if="state.categories && state.categories.length > 0">
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
            v-for="cg of state.categories"
            :key="cg.id"
          >
            <div @click="() => redirectPage(cg)">
              <div v-if="cg?.relative_url_image">
                <NuxtImg
                  :src="config.public.awsHostBucket + '/' + cg.relative_url_image"
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
  </div>
</template>
