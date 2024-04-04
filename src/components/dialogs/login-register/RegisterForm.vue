<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { StatusCodes } from 'http-status-codes';
import { userSchema } from '~/schemas/user.schema';
import type { IUser, RegisterBody } from '~/interfaces/user';
import { LOCAL_STORAGE_KEYS } from '~/config/enums/local-storage-keys';

const authStore = useAuthStore();

const formRef = ref();

const state = reactive({
  invalidEmails: [] as string[],
  loadingBtn: false,
  unknownErrorMsg: '',
});

const stateSubmit = reactive({
  name: '',
  email: '',
  password: '',
});

async function onSubmit(event: FormSubmitEvent<RegisterBody>) {
  formRef.value.clear();
  if (state.invalidEmails.includes(event.data.email)) {
    formRef.value.setErrors([{ path: 'email', message: 'Invalid email' }]);
    return;
  }

  state.loadingBtn = true;
  const userPreferences = parseJSON<IUser['market_preferences']>(localStorage[LOCAL_STORAGE_KEYS.USER_PREFERENCES]);
  const { error, pending } = await authStore.register({ ...event.data, market_preferences: userPreferences });
  state.loadingBtn = pending.value;

  if (error.value && error.value.data) {
    const { message, code } = error.value.data;
    if (code === StatusCodes.CONFLICT) {
      formRef.value.setErrors([{ path: 'email', message }]);
      state.invalidEmails.push(event.data.email);
      return;
    }
    state.unknownErrorMsg = message || 'An unknown error occurred. Please try again';
  }
}

</script>

<template>
  <div class="space-y-5">
    <UAlert
      v-if="state.unknownErrorMsg"
      color="rose"
      variant="solid"
      :close-button="{
        icon: 'i-heroicons-x-mark-20-solid',
        color: 'white',
        variant: 'link',
        padded: false
      }"
      title=""
      :ui="{ description: 'mt-[2px]' }"
      :description="state.unknownErrorMsg"
      @close="state.unknownErrorMsg = ''"
    />

    <div class="rounded">
      <UForm
        ref="formRef"
        :validate-on="['submit']"
        :schema="userSchema.pick({ name: true, email: true, password: true })"
        :state="stateSubmit"
        @submit="onSubmit"
      >
        <UFormGroup label="Name" name="name" class="mb-4">
          <UInput v-model="stateSubmit.name" size="xl" />
        </UFormGroup>

        <UFormGroup label="Email" name="email" class="mb-4">
          <UInput v-model="stateSubmit.email" size="xl" />
        </UFormGroup>

        <UFormGroup label="Password" name="password" class="mb-2">
          <UInput v-model="stateSubmit.password" size="xl" type="password" />
        </UFormGroup>

        <UButton :loading="state.loadingBtn" size="xl" block type="submit" class="mt-8">
          Register
        </UButton>
      </UForm>
    </div>
  </div>
</template>
