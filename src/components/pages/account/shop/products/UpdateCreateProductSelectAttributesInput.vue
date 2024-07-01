<script setup lang="ts">
import type { Category } from '~/types/category';
import type { ProductAttribute } from '~/types/product';
import { useGetAttributesByCategory } from '~/services/category';

const { categoryId, attributesSelected } = defineProps<{
  categoryId?: Category['id']
  attributesSelected?: ProductAttribute[] }
>();

const model = defineModel<ProductAttribute[] | undefined>({
  required: true,
  default: [],
});

const { data } = useGetAttributesByCategory(categoryId);

const state = reactive({});

onMounted(() => {
  const mapAttrSelected = new Map();
  if (attributesSelected) {
    attributesSelected.forEach((attr) => {
      mapAttrSelected.set(attr.attribute, attr.selected);
    });
  }
  if (data.value?.attributes) {
    data.value.attributes.forEach((attr) => {
      if (attributesSelected && mapAttrSelected.has(attr.id)) {
        state[attr.id] = mapAttrSelected.get(attr.id);
        return;
      }
      state[attr.id] = '';
    });
  }
});

watch(() => state, () => {
  const attrsValid: ProductAttribute[] = [];
  Object.keys(state).forEach((key) => {
    if (state[key]) {
      attrsValid.push({
        attribute: key,
        selected: state[key],
      });
    }
  });
  model.value = attrsValid;
}, { deep: true });
</script>

<template>
  <div
    v-if="data?.attributes && data.attributes.length > 0"
    class="flex gap-4"
  >
    <div
      v-for="attr of data.attributes"
      :key="attr.id"
    >
      <UFormGroup
        :label="attr.name"
        name="type"
        class="group relative mb-4"
      >
        <USelectMenu
          v-model="state[attr.id]"
          class="w-full lg:w-52"
          :options="attr.options"
          size="lg"
        />
        <div
          v-if="state[attr.id]"
          class="hidden group-hover:block"
        >
          <UIcon
            name="i-material-symbols:cancel-rounded"
            class="absolute right-9 top-3 size-4 cursor-pointer text-zinc-400"
            @click="() => state[attr.id] = ''"
          />
        </div>
      </UFormGroup>
    </div>
  </div>
</template>
