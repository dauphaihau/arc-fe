<script setup lang="ts">
import type { Category } from '~/types/category';
import { ROUTES } from '~/config/enums/routes';
import { useGetRootCategories } from '~/services/category';

const { data: dataRootCategories } = useGetRootCategories();
const marketStore = useMarketStore();

const redirectByCategory = (rootCategory: Category) => {
  const to = `${ROUTES.C}/${rootCategory.name.replaceAll(' ', '-').toLowerCase()}`;
  marketStore.categoriesBreadcrumb = [{ ...rootCategory, to }];
  marketStore.userActivities.rootCategoryProductVisited = rootCategory;
  navigateTo(to);
};
</script>

<template>
  <div v-if="dataRootCategories?.categories && dataRootCategories.categories.length > 0">
    <div class="flex gap-3">
      <div
        v-for="(cg, index) of dataRootCategories.categories"
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
