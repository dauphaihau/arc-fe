<script setup lang="ts">

import type { IProductClothing } from '~/interfaces/product';
import {
  PRODUCT_ATTR_CLOTHING_GENDER,
  PRODUCT_ATTR_CLOTHING_SHAPES,
  PRODUCT_ATTR_CLOTHING_TYPES
} from '~/config/enums/product';

const state = reactive<Partial<IProductClothing>>({});

const productAttrClothingTypeOpts = Object.values(PRODUCT_ATTR_CLOTHING_TYPES);
const productAttrClothingGenderOpts = Object.values(PRODUCT_ATTR_CLOTHING_GENDER);
const productAttrClothingShapesOpts = Object.values(PRODUCT_ATTR_CLOTHING_SHAPES);

const emit = defineEmits<
 {(e: 'onChangeAttributes', value: Partial<IProductClothing>): void }
>();

watch(state, () => {
  emit('onChangeAttributes', state);
});

</script>

<template>
  <div class="flex gap-4">
    <UFormGroup
      label="Clothing type"
      name="type"
      class="mb-4"
      required
    >
      <USelectMenu
        v-model="state.type"
        class="w-full lg:w-40"
        placeholder="Select type"
        :options="productAttrClothingTypeOpts"
        size="lg"
      />
    </UFormGroup>
    <UFormGroup
      label="Gender"
      name="gender"
      class="mb-4"
      required
    >
      <USelectMenu
        v-model="state.gender"
        class="w-full lg:w-40"
        placeholder="Select gender"
        :options="productAttrClothingGenderOpts"
        size="lg"
      />
    </UFormGroup>
    <UFormGroup
      label="Shape"
      name="shape"
      class="mb-4"
      required
    >
      <USelectMenu
        v-model="state.shape"
        class="w-full lg:w-40"
        placeholder="Select shape"
        :options="productAttrClothingShapesOpts"
        size="lg"
      />
    </UFormGroup>
  </div>
</template>
