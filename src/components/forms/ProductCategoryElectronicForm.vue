<script setup lang="ts">

import type { IProductElectronic } from '~/interfaces/product';

const { loading } = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
});

const state = reactive<Partial<IProductElectronic>>({});

const emit = defineEmits<{(e: 'onChangeAttributes', value: Partial<IProductElectronic>): void }>();

watch(state, () => {
  emit('onChangeAttributes', state);
});

</script>

<template>
  <UFormGroup
    label="Batteries"
    name="batteries"
    class="mb-4"
    required
  >
    <UInput
      v-model="state.batteries"
      :disabled="loading"
      size="lg"
    />
  </UFormGroup>
  <UFormGroup
    label="Series"
    name="series"
    class="mb-4"
    required
  >
    <UInput
      v-model="state.series"
      :disabled="loading"
      size="lg"
    />
  </UFormGroup>
</template>
