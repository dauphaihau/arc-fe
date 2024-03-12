<script setup lang="ts">

import type { ICategory } from '~/interfaces/category';

const { $api } = useNuxtApp();

const emit = defineEmits<
  {(e: 'onChangeCategory', value: ICategory['id']): void }
>();

const state = reactive({
  input: '',
  categoriesName: [] as string[],
  name: '' as ICategory['name'],
  parent: null as ICategory['parent'],
  isOpen: false,
  rootCategories: [] as ICategory[],
  requiredCategories: [],
  categoryToEmit: '',
});

const subCategories = ref<{
  [key: string]: {
    name: ICategory['name']
    categories: ICategory[]
  }
}>({});

const params = computed(() => ({
  parent: state.parent,
}));

const { pending, data } = await $api.category.getCategories(params);

onMounted(() => {
  if (!state.rootCategories.length && data.value) {
    state.rootCategories = data.value.categories;
  }
});

watch(() => data.value, () => {
  if (data.value) {
    subCategories.value[state.parent as string] = {
      name: state.name,
      categories: data.value.categories,
    };
    state.categoriesName = Object.values(subCategories.value).map(item => item.name);
    // if (!data.value.has_more && state.requiredCategories.length === 0) {
    //   state.requiredCategories = data.value.categories.map(cg => cg.id);
    //   console.log('state-required-categories', state.requiredCategories);
    // }
  }
});

const onSelectRootCategory = ({ id: categoryId, name }: ICategory) => {
  subCategories.value = {};
  state.parent = categoryId;
  state.name = name;
  state.categoriesName.push(name);
};

const onSelectSubCategory = ({ parent, id: categoryId, name }: ICategory) => {
  if (categoryId === state.parent) {
    return;
  }
  subCategories.value[parent as string].categories.forEach((subCategory) => {
    delete subCategories.value[subCategory.id];
  });
  state.parent = categoryId;
  state.name = name;
};

const onSave = () => {
  state.input = state.categoriesName[state.categoriesName.length - 1];
  state.isOpen = false;
  emit('onChangeCategory', state.parent as string);
};

</script>

<template>
  <div>
    <UInput
      v-model="state.input"
      icon="i-heroicons-magnifying-glass-20-solid"
      size="xl"
      color="white"
      :trailing="false"
      placeholder="Search..."
      @click="state.isOpen = true"
    />

    <div v-if="state.categoriesName.length > 0" class="mt-3">
      <h3 class="text-sm font-semibold mb-2">
        Shoppers will find this product in all of these categories:
      </h3>
      <div class="flex gap-3">
        <div v-for="name of state.categoriesName" :key="name">
          <UBadge color="gray" variant="solid">
            {{ name }}
          </UBadge>
        </div>
      </div>
    </div>


    <UModal
      v-model="state.isOpen"
      :ui="{
        margin: '!mb-72',
        width: 'w-full sm:max-w-xl',
      }"
    >
      <div class="p-8 space-y-5">
        <div class="space-y-1.5">
          <h1 class="text-2xl font-bold">
            Select Category
          </h1>
        </div>

        <div class="bg-zinc-200/50 p-3 rounded-lg">
          <div class="mb-5">
            <UInput
              icon="i-heroicons-magnifying-glass-20-solid"
              size="md"
              class="w-1/2"
              color="white"
              :trailing="false"
              placeholder="Search..."
            />
          </div>
        </div>

        <div class="bg-zinc-200/50 p-3 rounded-lg">
          <div
            v-if="pending && state.rootCategories.length === 0"
            class="p-5 grid place-content-center"
          >
            <UIcon name="i-mingcute-loading-fill" class="animate-spin h-14 w-14" />
          </div>
          <div v-else>
            <div class="flex gap-3 bg-white">
              <div v-if="state.rootCategories" class="py-2">
                <div v-for="cate of state.rootCategories" :key="cate.id">
                  <div
                    class="item-category"
                    @click="() => onSelectRootCategory(cate)"
                  >
                    <div
                      class="cursor-pointer"
                      :class="subCategories[cate.id] && 'text-primary'"
                    >
                      {{ cate.name }}
                    </div>
                    <UIcon name="i-heroicons-chevron-right" />
                  </div>
                </div>
              </div>

              <UDivider orientation="vertical" class="w-2 h-72" />

              <div>
                <div v-if="Object.values(subCategories).length > 0">
                  <div class="flex gap-3">
                    <div v-for="(item, key) of subCategories" :key="key">
                      <div v-for="cate of item.categories" :key="cate.name">
                        <!--                        <div-->
                        <!--                          class="cursor-pointer"-->
                        <!--                          :class="subCategories[cate.id] && 'text-red-500'"-->
                        <!--                          @click="() => onSelectSubCategory(cate)"-->
                        <!--                        >-->
                        <!--                          {{ cate.name }}-->
                        <!--                        </div>-->

                        <div class="item-category">
                          <div
                            class="cursor-pointer"
                            :class="subCategories[cate.id] && 'text-red-500'"
                            @click="() => onSelectSubCategory(cate)"
                          >
                            {{ cate.name }}
                          </div>
                          <UIcon name="i-heroicons-chevron-right" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end items-center gap-2">
          <UButton
            size="sm"
            color="gray"
            @click="state.isOpen = false"
          >
            Cancel
          </UButton>
          <UButton
            :disabled="data?.has_more ?? true"
            size="sm"
            @click="onSave"
          >
            Save
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<style scoped>

.item-category {
 @apply flex justify-between items-center hover:text-primary cursor-pointer gap-2 px-3 py-2;
}

</style>
