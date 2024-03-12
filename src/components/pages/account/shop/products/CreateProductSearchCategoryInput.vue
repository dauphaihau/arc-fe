<script setup lang="ts">

import type { ICategory } from '~/interfaces/category';
import type { IProduct } from '~/interfaces/product';

const { $api } = useNuxtApp();

const props = defineProps<{ title?: IProduct['title'] }>();

const emit = defineEmits<{(e: 'onChange', value: ICategory['id']): void }>();

const loading = ref(false);
const selected = ref();
const query = ref();
const placeholder = ref('');

async function search(q: string) {
  loading.value = true;
  const { pending, data } = await $api.category.getSearchCategories(q);
  loading.value = pending.value;

  return data.value?.categories || [];
}

watch(selected, () => {
  emit('onChange', selected.value.id);
});

watchDebounced(
  () => props.title,
  async () => {
    if (props.title && !selected.value) {
      const { data } = await $api.category.getSearchCategories(props.title);
      if (data.value) {
        placeholder.value = data.value.categories
          .map(c => c.lastNameCategory)
          .toString()
          .replaceAll(',', ', ');
      }
    }
  },
  { debounce: 500, maxWait: 1000 }
);

</script>

<template>
  <UInputMenu
    v-model="selected"
    v-model:query="query"
    :search="search"
    :loading="loading"
    :placeholder="placeholder"
    option-attribute="lastNameCategory"
    :debounce="300"
    trailing
    by="id"
    size="lg"
  >
    <template #option="{ option: category }">
      <div class="space-y-1 py-1">
        <div class="flex gap-1">
          <p>{{ query }} in</p>
          <p class="truncate font-bold">
            {{ category.lastNameCategory }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <div v-for="(nameCategory, idx) in category.categoriesRelated" :key="nameCategory">
            <div class="flex items-center gap-2 text-zinc-500">
              <p>{{ nameCategory }}</p>
              <UIcon
                v-if="category.categoriesRelated[idx + 1]"
                name="i-material-symbols:play-arrow"
                class="h-3 w-3"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
    <template #option-empty="{ query }">
      <div class="text-zinc-500">
        <div class="">
          <q>{{ query }}</q> not found
        </div>
        <!--        <UDivider class="my-3" />-->
        <!--        <div class="space-y-3">-->
        <!--          <div class="flex gap-1 text-md">-->
        <!--            <p class="flex items-center gap-2">-->
        <!--              If you don’t see your item’s category, try being more specific.-->
        <!--            </p>-->
        <!--            <p class="underline cursor-pointer">-->
        <!--              You can also add them manually.-->
        <!--            </p>-->
        <!--          </div>-->
        <!--        </div>-->
      </div>
    </template>
  </UInputMenu>
</template>
