<script setup lang="ts">

import { useSessionStorage } from '@vueuse/core';
import type { ICategory } from '~/interfaces/category';
import { SESSION_STORAGE_KEYS } from '~/config/enums/session-storage-keys';
import type { IUserActivitiesSessionStorage } from '~/interfaces/common';
import { ROUTES } from '~/config/enums/routes';

const { $api } = useNuxtApp();

const categories = ref<ICategory[]>([]);

onMounted(async () => {
  const rootCategories = parseJSON<ICategory[]>(sessionStorage[SESSION_STORAGE_KEYS.ROOT_CATEGORIES]);
  if (rootCategories && rootCategories.length > 0) {
    categories.value = rootCategories;
    return;
  }
  const { data, error } = await $api.category.getCategories();
  if (!error.value && data.value) {
    categories.value = data.value.categories;
    useSessionStorage(SESSION_STORAGE_KEYS.ROOT_CATEGORIES, data.value.categories);
  }
});

const redirectByCategory = (category: ICategory) => {
  const to = `${ROUTES.C}/${category.name.replaceAll(' ', '-').toLowerCase()}`;

  sessionStorage.removeItem(SESSION_STORAGE_KEYS.CATEGORY);
  useSessionStorage(SESSION_STORAGE_KEYS.CATEGORY, category);

  sessionStorage.removeItem(SESSION_STORAGE_KEYS.CATEGORIES);
  useSessionStorage(SESSION_STORAGE_KEYS.CATEGORIES, [{ ...category, to }]);

  const userActivities = parseJSON<IUserActivitiesSessionStorage>(
    sessionStorage.getItem(SESSION_STORAGE_KEYS.USER_ACTIVITIES)
  );
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
    <div class="flex gap-3">
      <div v-for="(cg, index) of categories" :key="index">
        <UButton
          color="gray"
          variant="ghost"
          class="icon-button capitalize w-full"
          @click="() => redirectByCategory(cg)"
        >
          {{ cg.name }}
        </UButton>
      </div>

      <!--        <UPopover :popper="{ offsetDistance: 0 }">-->
      <!--          <UButton-->
      <!--            color="gray"-->
      <!--            variant="ghost"-->
      <!--            class="icon-button"-->
      <!--          >-->
      <!--&lt;!&ndash;            <Icon name="i-material-symbols:menu" color="black" />&ndash;&gt;-->
      <!--&lt;!&ndash;            Categories&ndash;&gt;-->

      <!--                        More-->

      <!--            <UPopover :popper="{ offsetDistance: 0 }">-->
      <!--              <UButton-->
      <!--                color="gray"-->
      <!--                variant="ghost"-->
      <!--                class="icon-button"-->
      <!--              >-->
      <!--                <Icon name="i-material-symbols:menu" color="black" />-->
      <!--                Categories-->
      <!--              </UButton>-->

      <!--              <template #panel="{ close }">-->
      <!--                <div class="p-2 flex flex-col gap-3">-->
      <!--                  <div v-for="(cg, index) of categories" :key="index">-->
      <!--                    <UButton-->
      <!--                      color="gray"-->
      <!--                      variant="ghost"-->
      <!--                      class="icon-button capitalize w-full"-->
      <!--                      @click="() => {-->
      <!--                        redirectByCategory(cg)-->
      <!--                        close()-->
      <!--                      }"-->
      <!--                    >-->
      <!--                      {{ cg.name }}-->
      <!--                    </UButton>-->
      <!--                  </div>-->
      <!--                </div>-->
      <!--              </template>-->
      <!--            </UPopover>-->
      <!--          </UButton>-->

      <!--          <template #panel="{ close }">-->
      <!--            <div class="p-2 flex flex-col gap-3">-->
      <!--              <div v-for="(cg, index) of categories" :key="index">-->
      <!--                <UButton-->
      <!--                  color="gray"-->
      <!--                  variant="ghost"-->
      <!--                  class="icon-button capitalize w-full"-->
      <!--                  @click="() => {-->
      <!--                    redirectByCategory(cg)-->
      <!--                    close()-->
      <!--                  }"-->
      <!--                >-->
      <!--                  {{ cg.name }}-->
      <!--                </UButton>-->
      <!--              </div>-->
      <!--            </div>-->
      <!--          </template>-->
      <!--        </UPopover>-->
    </div>
  </div>
</template>
