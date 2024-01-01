<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { userSchema } from '../../schemas/user.schema';

const emit = defineEmits(['next']);

const userStore = useAuthStore();
const formRef = ref();
const unknownErrorMsg = ref('');

const state = reactive({
  password: undefined,
  passwordConfirm: undefined,
});

async function onSubmit(event: FormSubmitEvent<Record<'password' | 'passwordConfirm', string>>) {
  if (event.data.password !== event.data.passwordConfirm) {
    formRef.value.setErrors([{ path: 'passwordConfirm', message: 'This password does not match. Try again.' }]);
    return;
  }
  formRef.value.clear();
  const errorMessage = await userStore.resetPassword(event.data.password);
  if (errorMessage) {
    unknownErrorMsg.value = errorMessage;
    return;
  }
  emit('next');
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
      @close="unknownErrorMsg=''"
    />

    <UForm
      ref="formRef"
      :validate-on="['submit']"
      :schema="userSchema.pick({ password: true })"
      :state="state"
      @submit="onSubmit"
    >
      <UFormGroup label="New password" name="password" class="mb-4">
        <UInput v-model="state.password" size="xl" type="password" />
      </UFormGroup>
      <UFormGroup label="Confirm your password" name="passwordConfirm">
        <UInput v-model="state.passwordConfirm" size="xl" type="password" />
      </UFormGroup>

      <UButton size="xl" block type="submit" class="mt-6">
        Continue
      </UButton>
    </UForm>
  </div>
</template>
