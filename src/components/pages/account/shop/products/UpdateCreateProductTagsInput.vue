<script setup lang="ts">

import { PRODUCT_CONFIG } from '~/config/enums/product';
import type { IProduct } from '~/interfaces/product';

const props = defineProps<{ countValidate: number, tags?: IProduct['tags'] }>();

const emit = defineEmits<{ (e: 'onChange', value: IProduct['tags']): void }>();

const state = reactive({
  input: '',
  tags: props.tags || [],
  errorMsgInput: '',
});

const addTag = () => {
  state.tags.push(state.input);
  state.input = '';
};

const removeTag = (index: number) => {
  state.tags.splice(index, 1);
};

watch(() => props.countValidate, () => {
  emit('onChange', state.tags);
});

watchDebounced(
  () => state.input,
  () => {
    state.errorMsgInput = '';
    if (state.tags.includes(state.input)) {
      state.errorMsgInput = 'Duplicate';
    }
  },
  { debounce: 300, maxWait: 1000 }
);

</script>

<template>
  <div>
    <UFormGroup
      class="mb-4 max-w-[20%]"
      label="Tags"
      :description="`Add up to ${PRODUCT_CONFIG.MAX_TAGS} tags.`"
      :error="state.errorMsgInput ?? ''"
    >
      <UButtonGroup size="lg" orientation="horizontal">
        <UInput
          v-model="state.input"
          :maxlength="PRODUCT_CONFIG.MAX_CHAR_TAG"
          :disabled="state.tags.length === PRODUCT_CONFIG.MAX_TAGS"
        />
        <UButton
          :disabled=" !state.input || Boolean(state.errorMsgInput)"
          color="gray"
          variant="solid"
          @click="addTag"
        >
          Add
        </UButton>
      </UButtonGroup>
    </UFormGroup>

    <div
      v-if="state.tags.length > 0"
      class="flex flex-wrap gap-x-4 w-full"
    >
      <div v-for="(tag, index) of state.tags" :key="tag">
        <UFormGroup class="mb-4">
          <UButtonGroup
            v-if="tag"
            size="lg"
            orientation="horizontal"
          >
            <UButton disabled :label="tag" color="white" />
            <UButton
              icon="i-heroicons-x-mark"
              color="gray"
              @click="() => removeTag(index)"
            />
          </UButtonGroup>
        </UFormGroup>
      </div>
    </div>
  </div>
</template>


<style scoped>

</style>
