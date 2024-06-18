<script setup lang="ts">
import { StatusCodes } from 'http-status-codes';
import type { FormSubmitEvent } from '#ui/types';
import { userSchema } from '~/schemas/user.schema';
import type { IUser, RegisterBody } from '~/interfaces/user';
import { LOCAL_STORAGE_KEYS } from '~/config/enums/local-storage-keys';
import { useRegister } from '~/services/auth';

const authStore = useAuthStore();

const formRef = ref();

const state = reactive({
  invalidEmails: [] as string[],
  unknownErrorServerMsg: '',
});

const stateSubmit = reactive({
  name: '',
  email: '',
  password: '',
});

const {
  mutate: register,
  isPending: isPendingRegister,
} = useRegister({
  onResponse: ({ response }) => {
    if (response.status === StatusCodes.CONFLICT) {
      formRef.value.setErrors([{ path: 'email', message: 'Email already taken' }]);
      state.invalidEmails.push(stateSubmit.email);
      return;
    }
    if (response.status === StatusCodes.CREATED) {
      authStore.user = response._data.user;
      authStore.setExpTokens();
      return;
    }
    state.unknownErrorServerMsg = 'An unknown error occurred. Please try again';
  },
});

async function onSubmit(event: FormSubmitEvent<RegisterBody>) {
  formRef.value.clear();
  if (state.invalidEmails.includes(event.data.email)) {
    formRef.value.setErrors([{ path: 'email', message: 'Invalid email' }]);
    return;
  }

  const userPreferences = parseJSON<IUser['market_preferences']>(localStorage[LOCAL_STORAGE_KEYS.USER_PREFERENCES]);
  register({
    ...event.data,
    market_preferences: userPreferences,
  });
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
      :ui="{ description: 'mt-[2px]' }"
      :description="state.unknownErrorServerMsg"
      @close="state.unknownErrorServerMsg = ''"
    />

    <div class="rounded">
      <UForm
        ref="formRef"
        :validate-on="['submit']"
        :schema="userSchema.pick({ name: true, email: true, password: true })"
        :state="stateSubmit"
        @submit="onSubmit"
      >
        <UFormGroup
          label="Name"
          name="name"
          class="mb-4"
        >
          <UInput
            v-model="stateSubmit.name"
            :disabled="isPendingRegister"
            size="xl"
          />
        </UFormGroup>

        <UFormGroup
          label="Email"
          name="email"
          class="mb-4"
        >
          <UInput
            v-model="stateSubmit.email"
            :disabled="isPendingRegister"
            size="xl"
          />
        </UFormGroup>

        <UFormGroup
          label="Password"
          name="password"
          class="mb-2"
        >
          <UInput
            v-model="stateSubmit.password"
            :disabled="isPendingRegister"
            size="xl"
            type="password"
          />
        </UFormGroup>

        <UButton
          :loading="isPendingRegister"
          size="xl"
          block
          type="submit"
          class="mt-8"
        >
          Register
        </UButton>
      </UForm>
    </div>
  </div>
</template>
