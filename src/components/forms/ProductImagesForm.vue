<script setup lang="ts">

const props = defineProps({
  errorImageField: {
    type: Boolean,
    default: false,
  },
});

const toast = useToast();

const fileInputRef = ref<HTMLInputElement | null>(null);

const state = reactive({
  fileImages: [] as File[],
  urlImages: [] as string[],
});

const emit = defineEmits<{(e: 'onChangeImages', value: File[]): void }>();

watch(state, () => {
  emit('onChangeImages', state.fileImages);
});

const onPickFile = () => {
  fileInputRef?.value?.click();
};

function onFilePicked(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = (target.files as FileList);
  if (files.length > 10 || files.length + state.urlImages.length > 10) {
    toast.add({ title: 'max 10 files' });
    return;
  }
  for (let i = 0; i < files.length; i++) {
    state.fileImages.push(files[i]);
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      state.urlImages.push(reader.result as string);
    });
    reader.readAsDataURL(files[i]);
  }
}

const removeImage = (index: number) => {
  state.fileImages.splice(index, 1);
  state.urlImages.splice(index, 1);
};


</script>

<template>
  <UFormGroup
    label="Photos"
    name="photos"
    description="Add up to 10 photos."
    required
  >
    <div class="grid grid-cols-4 gap-3">
      <UCard
        :ui="{
          base: 'shape cursor-pointer',
          body: {
            base: 'shape h-full grid place-content-center text-center'
          },
        }"
        @click="onPickFile"
      >
        <div class="">
          <Icon name="material-symbols:android-camera" class="w-full" />
          <div>Add a photo</div>
          <input
            id="formFile"
            ref="fileInputRef"
            class="hidden"
            type="file"
            multiple
            :disabled="state.urlImages.length === 10"
            accept="image/*"
            @change="onFilePicked"
          >
        </div>
      </UCard>

      <div v-for="(url, index) in state.urlImages" :key="url" class="shape">
        <img :src="url" class="shape rounded" @click="removeImage(index)">
      </div>
    </div>

    <p v-if="props.errorImageField" class="text-red-500 mt-2 text-sm">
      Required at least 1 photo
    </p>
  </UFormGroup>
</template>

<style scoped>

.shape {
  @apply h-[152px] w-[152px]
}

</style>
