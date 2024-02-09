<script setup lang="ts">

import type { ICategory } from '~/interfaces/category';

const { $api } = useNuxtApp();

const { categoryId } = defineProps<{ categoryId: ICategory['id'] }>();

const emit = defineEmits<{(e: 'onChangeAttributes', value: any): void }>();

const { pending, data } = await $api.category.getAttributesByCategory(categoryId);

const state = reactive({});

onMounted(() => {
  if (data.value?.attributes) {
    data.value.attributes.forEach((attr) => {
      state[attr.id] = '';
    });
  }
});

watch(state, () => {
  let emptyAnyFields = false;
  const mapState = Object.keys(state).map((key) => {
    if (!state[key]) {
      emptyAnyFields = true;
    }
    return {
      attribute: key,
      selected: state[key],
    };
  });
  if (!emptyAnyFields) {
    emit('onChangeAttributes', mapState);
  }
});

</script>

<template>
  <div v-if="pending">
    loading...
  </div>
  <div v-else class="flex gap-4">
    <div v-if="data?.attributes">
      <div v-for="attr of data.attributes" :key="attr.id">
        <UFormGroup
          :label="attr.name"
          name="type"
          class="mb-4"
          required
        >
          <USelectMenu
            v-model="state[attr.id]"
            class="w-full lg:w-40"
            placeholder="Select type"
            :options="attr.options"
            size="lg"
          />
        </UFormGroup>
      </div>
    </div>
  </div>
</template>
