<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { userSchema } from '../../schemas/user.schema';
import type { IUser } from '~/interfaces/user';

const props = defineProps({
  email: {
    type: String,
    default: '',
  },
});

const emit = defineEmits<{(e: 'next', value: string): void }>();

const authStore = useAuthStore();
const formRef = ref();
const unknownErrorMsg = ref('');
const loading = ref(false);

const state = reactive({
  email: props.email,
});

async function onSubmit(event: FormSubmitEvent<{ email: IUser['email'] }>) {
  formRef.value.clear();
  loading.value = true;
  const errorMessage = await authStore.forgetPassword(event.data.email);
  loading.value = false;
  if (errorMessage) {
    unknownErrorMsg.value = errorMessage;
  } else {
    emit('next', event.data.email);
  }
}

</script>

<template>
  <div>
    <UAlert
      v-if="unknownErrorMsg"
      color="rose"
      variant="solid"
      :close-button="{
        icon: 'i-heroicons-x-mark-20-solid', color: 'white', variant: 'link', padded: false,
      }"
      title=""
      :description="unknownErrorMsg"
      class="mb-4"
      @close="unknownErrorMsg=''"
    />
    <UForm
      ref="formRef"
      :validate-on="['submit']"
      :schema="userSchema.pick({ email: true })"
      :state="state"
      @submit="onSubmit"
    >
      <UFormGroup label="Email" name="email" class="mb-4">
        <UInput v-model="state.email" :disabled="loading" size="xl" />
      </UFormGroup>

      <UButton :disabled="loading" size="xl" block type="submit" class="mt-6">
        Continue
      </UButton>
    </UForm>
  </div>
</template>
