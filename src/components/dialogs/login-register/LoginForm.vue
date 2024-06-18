<script setup lang="ts">
import { StatusCodes } from 'http-status-codes';
import type { FormSubmitEvent } from '#ui/types';
import { userSchema } from '~/schemas/user.schema';
import type { IUser, LoginBody } from '~/interfaces/user';
import { ROUTES } from '~/config/enums/routes';
import { useLogin } from '~/services/auth';

const authStore = useAuthStore();
const cartStore = useCartStore();

const formRef = ref();

const state = reactive({
  invalidUsers: new Map<IUser['email'], IUser['password'][]>(),
  unknownErrorServerMsg: '',
});

const stateSubmit: Partial<LoginBody> = reactive({
  email: undefined,
  password: undefined,
});

const {
  mutate: login,
  isPending: isPendingLogin,
} = useLogin({
  onResponse: ({ response }) => {
    if (response.status === StatusCodes.UNAUTHORIZED) {
      const { email, password } = stateSubmit;
      if (email && password) {
        const user = state.invalidUsers.get(email);
        user ? user.push(password) : state.invalidUsers.set(email, [password]);
      }
      state.unknownErrorServerMsg = 'Incorrect email or password';
      return;
    }

    if (response.status === StatusCodes.OK) {
      authStore.user = response._data.user;
      authStore.setExpTokens();
      cartStore.getCartHeader();
      return;
    }

    state.unknownErrorServerMsg = 'An unknown error occurred. Please try again';
  },
});

function onSubmit(event: FormSubmitEvent<LoginBody>) {
  const { email, password } = event.data;
  const user = state.invalidUsers.get(email);
  if (user && user.includes(password)) {
    state.unknownErrorServerMsg = 'Incorrect email or password';
    return;
  }
  login(event.data);
}
</script>

<template>
  <div class="space-y-5">
    <UAlert
      v-if="state.unknownErrorServerMsg"
      color="rose"
      variant="solid"
      :close-button="{
        icon: 'i-heroicons-x-mark-20-solid', color: 'white', variant: 'link', padded: false,
      }"
      title=""
      :description="state.unknownErrorServerMsg"
      :ui="{ description: 'mt-[2px]' }"
      @close="state.unknownErrorServerMsg=''"
    />

    <div class="rounded">
      <UForm
        ref="formRef"
        :validate-on="['submit']"
        :schema="userSchema.pick({ email: true, password: true })"
        :state="stateSubmit"
        @submit="onSubmit"
      >
        <UFormGroup
          label="Email"
          name="email"
          class="mb-4"
        >
          <UInput
            v-model="stateSubmit.email"
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
            size="xl"
            type="password"
          />
        </UFormGroup>

        <NuxtLink :to="ROUTES.RESET">
          <UButton
            variant="link"
            class="mb-4 pl-0"
          >
            Forget Password?
          </UButton>
        </NuxtLink>

        <UButton
          :loading="isPendingLogin"
          size="xl"
          block
          type="submit"
        >
          Log in
        </UButton>
      </UForm>
    </div>
  </div>
</template>
