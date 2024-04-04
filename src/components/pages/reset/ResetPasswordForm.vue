<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { userSchema } from '~/schemas/user.schema';

const emit = defineEmits(['nextStep']);

const userStore = useAuthStore();

const formRef = ref();

const state = reactive({
  loadingBtn: false,
  unknownErrorServerMsg: '',
});

const stateSubmit = reactive({
  password: undefined,
  passwordConfirm: undefined,
});

async function onSubmit(event: FormSubmitEvent<Record<'password' | 'passwordConfirm', string>>) {
  formRef.value.clear();
  const { password, passwordConfirm } = event.data;
  if (password !== passwordConfirm) {
    formRef.value.setErrors([{ path: 'passwordConfirm', message: 'This password does not match. Try again.' }]);
    return;
  }

  state.loadingBtn = true;
  const { error, pending } = await userStore.resetPassword(password);
  state.loadingBtn = pending.value;

  if (error.value && error.value.data) {
    const { message } = error.value.data;
    state.unknownErrorServerMsg = message || 'An unknown error occurred. Please try again';
  }
  else {
    emit('nextStep');
  }
}

</script>

<template>
  <div class="space-y-5">
    <UAlert
      v-if="state.unknownErrorServerMsg"
      color="rose"
      variant="solid"
      :close-button="{
        icon: 'i-heroicons-x-mark-20-solid',
        color: 'white',
        variant: 'link',
        padded: false,
      }"
      title=""
      :description="state.unknownErrorServerMsg"
      @close="state.unknownErrorServerMsg=''"
    />

    <UForm
      ref="formRef"
      :validate-on="['submit']"
      :schema="userSchema.pick({ password: true })"
      :state="stateSubmit"
      @submit="onSubmit"
    >
      <UFormGroup label="New password" name="password" class="mb-4">
        <UInput v-model="stateSubmit.password" size="xl" type="password" />
      </UFormGroup>
      <UFormGroup label="Confirm your password" name="passwordConfirm" class="mb-8">
        <UInput v-model="stateSubmit.passwordConfirm" size="xl" type="password" />
      </UFormGroup>

      <UButton :loading="state.loadingBtn" size="xl" block type="submit">
        Save
      </UButton>
    </UForm>
  </div>
</template>
