<script setup lang="ts">
import type { Category } from '~/types/category';
import { useGetAttributesByCategory } from '~/services/category';
import type { ProductAttribute } from '~/types/product';

type AttributeOption = {
  attribute_id: string
  selected: string
};

const { categoryId, attributesSelected } = defineProps<{
  categoryId?: Category['id']
  attributesSelected?: ProductAttribute[]
}
>();

const attributesModel = defineModel<AttributeOption[] | undefined>({
  default: [],
  required: true,
});

const {
  data: dataGetAttributesByCategory,
} = useGetAttributesByCategory(categoryId);

const state = reactive({});

watch(() => dataGetAttributesByCategory.value, () => {
  // reset each change category
  Object.keys(state).forEach((key) => {
    state[key] = '';
  });

  // case update, init data
  if (dataGetAttributesByCategory.value?.attributes && attributesSelected) {
    const attrSelectedMap = new Map();
    attributesSelected.forEach((attr) => {
      attrSelectedMap.set(attr.attribute, attr.selected);
    });
    dataGetAttributesByCategory.value.attributes.forEach((attr) => {
      if (attributesSelected && attrSelectedMap.has(attr.id)) {
        state[attr.id] = attrSelectedMap.get(attr.id);
        return;
      }
      state[attr.id] = '';
    });
  }
}, { immediate: true });

watch(() => state, () => {
  const attrsValid: AttributeOption[] = [];
  Object.keys(state).forEach((key) => {
    if (state[key]) {
      attrsValid.push({
        attribute_id: key,
        selected: state[key],
      });
    }
  });
  attributesModel.value = attrsValid;
}, { deep: true, immediate: true });
</script>

<template>
  <div
    v-if="dataGetAttributesByCategory?.attributes && dataGetAttributesByCategory.attributes.length > 0"
    class="flex gap-4"
  >
    <div
      v-for="attr of dataGetAttributesByCategory.attributes"
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
