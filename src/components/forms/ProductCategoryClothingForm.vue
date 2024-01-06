<script setup lang="ts">

import { productAttrClothingGender, productAttrClothingSize } from '~/config/enums/product';

const state = reactive({
  size: '',
  gender: '',
});

const emit = defineEmits<{(e: 'state', value: object): void }>();

watch(state, () => {
  emit('state', state);
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
      :options="productAttrClothingSize"
      size="lg"
    />
  </UFormGroup>
  <UFormGroup
    label="Size"
    name="color"
    class="mb-4"
    required
  >
    <USelectMenu
      v-model="state.size"
      class="w-full lg:w-40"
      placeholder="Select size"
      :options="productAttrClothingGender"
      size="lg"
    />
  </UFormGroup>
</template>
