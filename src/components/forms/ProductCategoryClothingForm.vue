<script setup lang="ts">

import type { IProductClothing } from '~/interfaces/product';
import {
  PRODUCT_ATTR_CLOTHING_GENDER,
  PRODUCT_ATTR_CLOTHING_SIZE
} from '~/config/enums/product';

// const state = reactive<IProductClothing>(
const state = reactive<Partial<IProductClothing>>({});

const productAttrClothingGenderOpts = Object.values(PRODUCT_ATTR_CLOTHING_GENDER);
const productAttrClothingSizeOpts = Object.values(PRODUCT_ATTR_CLOTHING_SIZE);

const emit = defineEmits<{(e: 'onChangeAttributes', value: Partial<IProductClothing>): void }>();

watch(state, () => {
  emit('onChangeAttributes', state);
});

</script>

<template>
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
    name="size"
    class="mb-4"
    required
  >
    <USelectMenu
      v-model="state.size"
      class="w-full lg:w-40"
      placeholder="Select size"
      :options="productAttrClothingSizeOpts"
      size="lg"
    />
  </UFormGroup>
</template>
