<script setup lang="ts">

import type { IProductClothing } from '~/interfaces/product';
import {
  PRODUCT_ATTR_CLOTHING_GENDER,
  PRODUCT_ATTR_CLOTHING_SIZES,
  PRODUCT_ATTR_CLOTHING_TYPES
} from '~/config/enums/product';

const state = reactive<Partial<IProductClothing>>({
  sizes: [],
});

const productAttrClothingTypeOpts = Object.values(PRODUCT_ATTR_CLOTHING_TYPES);
const productAttrClothingGenderOpts = Object.values(PRODUCT_ATTR_CLOTHING_GENDER);
const productAttrClothingSizeOpts = mapKeysEnum(PRODUCT_ATTR_CLOTHING_SIZES);

const emit = defineEmits<
 {(e: 'onChangeAttributes', value: Partial<IProductClothing>): void }
>();

watch(state, () => {
  emit('onChangeAttributes', state);
});

</script>

<template>
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
    label="Size"
    name="sizes"
    class="mb-4"
    required
  >
    <USelectMenu
      v-model="state.sizes"
      multiple
      class="w-full lg:w-40"
      placeholder="Select size"
      :options="productAttrClothingSizeOpts"
      size="lg"
    />
  </UFormGroup>
</template>
