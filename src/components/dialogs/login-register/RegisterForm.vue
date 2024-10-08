<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { FetchError } from 'ofetch';
import { StatusCodes } from 'http-status-codes';
import { userSchema } from '~/schemas/user.schema';
import type { User } from '~/types/user';
import { LOCAL_STORAGE_KEYS } from '~/config/enums/local-storage-keys';
import { useRegister } from '~/services/auth';
import type { RegisterBody } from '~/types/auth';

const invalidEmails: string[] = [];
const formRef = ref();
const unknownErrorServerMsg = ref('');

const stateSubmit: Partial<RegisterBody> = reactive({});

const {
  mutateAsync: register,
  isPending: isPendingRegister,
} = useRegister();

async function onSubmit(event: FormSubmitEvent<RegisterBody>) {
  formRef.value.clear();
  if (invalidEmails.includes(event.data.email)) {
    formRef.value.setErrors([{ path: 'email', message: 'Invalid email' }]);
    return;
  }

  const userPreferences = parseJSON<User['market_preferences']>(localStorage[LOCAL_STORAGE_KEYS.GUEST_PREFERENCES]);

  try {
    await register({
      ...event.data,
      market_preferences: userPreferences,
    });
  }
  catch (error) {
    if (error instanceof FetchError) {
      if (error.status === StatusCodes.CONFLICT) {
        formRef.value.setErrors([{ path: 'email', message: 'Email already taken' }]);
        invalidEmails.push(event.data.email);
        return;
      }
      unknownErrorServerMsg.value = 'An unknown error occurred. Please try again';
    }
  }
}
</script>

<template>
  <div class="space-y-5">
    <UAlert
      v-if="unknownErrorServerMsg"
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
      :description="unknownErrorServerMsg"
      @close="unknownErrorServerMsg = ''"
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
