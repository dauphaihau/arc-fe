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
  <div v-if="store.rootCategories.length > 0">
    <div class="flex gap-3">
      <div
        v-for="(cg, index) of store.rootCategories"
        :key="index"
      >
        <UButton
          color="gray"
          variant="ghost"
          class="icon-button w-full capitalize"
          @click="() => redirectByCategory(cg)"
        >
          {{ cg.name }}
        </UButton>
      </div>

      <!--        <UPopover :popper="{ offsetDistance: 0 }"> -->
      <!--          <UButton -->
      <!--            color="gray" -->
      <!--            variant="ghost" -->
      <!--            class="icon-button" -->
      <!--          > -->
      <!-- &lt;!&ndash;            <Icon name="i-material-symbols:menu" color="black" />&ndash;&gt; -->
      <!-- &lt;!&ndash;            Categories&ndash;&gt; -->

      <!--                        More -->

      <!--            <UPopover :popper="{ offsetDistance: 0 }"> -->
      <!--              <UButton -->
      <!--                color="gray" -->
      <!--                variant="ghost" -->
      <!--                class="icon-button" -->
      <!--              > -->
      <!--                <Icon name="i-material-symbols:menu" color="black" /> -->
      <!--                Categories -->
      <!--              </UButton> -->

      <!--              <template #panel="{ close }"> -->
      <!--                <div class="p-2 flex flex-col gap-3"> -->
      <!--                  <div v-for="(cg, index) of categories" :key="index"> -->
      <!--                    <UButton -->
      <!--                      color="gray" -->
      <!--                      variant="ghost" -->
      <!--                      class="icon-button capitalize w-full" -->
      <!--                      @click="() => { -->
      <!--                        redirectByCategory(cg) -->
      <!--                        close() -->
      <!--                      }" -->
      <!--                    > -->
      <!--                      {{ cg.name }} -->
      <!--                    </UButton> -->
      <!--                  </div> -->
      <!--                </div> -->
      <!--              </template> -->
      <!--            </UPopover> -->
      <!--          </UButton> -->

      <!--          <template #panel="{ close }"> -->
      <!--            <div class="p-2 flex flex-col gap-3"> -->
      <!--              <div v-for="(cg, index) of categories" :key="index"> -->
      <!--                <UButton -->
      <!--                  color="gray" -->
      <!--                  variant="ghost" -->
      <!--                  class="icon-button capitalize w-full" -->
      <!--                  @click="() => { -->
      <!--                    redirectByCategory(cg) -->
      <!--                    close() -->
      <!--                  }" -->
      <!--                > -->
      <!--                  {{ cg.name }} -->
      <!--                </UButton> -->
      <!--              </div> -->
      <!--            </div> -->
      <!--          </template> -->
      <!--        </UPopover> -->
    </div>
  </div>
</template>
