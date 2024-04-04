<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { userSchema } from '~/schemas/user.schema';
import type { LoginBody } from '~/interfaces/user';
import { ROUTES } from '~/config/enums/routes';

const authStore = useAuthStore();
const cartStore = useCartStore();

const formRef = ref();

const state = reactive({
  invalidUsers: new Map<string, string[]>(),
  loadingBtn: false,
  unknownErrorServerMsg: '',
});

const stateSubmit = reactive({
  email: undefined,
  password: undefined,
});

async function onSubmit(event: FormSubmitEvent<LoginBody>) {
  formRef.value.clear();
  const { email, password } = event.data;

  const invalidPasswords = state.invalidUsers.get(email);
  if (invalidPasswords && invalidPasswords.includes(password)) {
    state.unknownErrorServerMsg = 'Incorrect email or password';
    return;
  }

  state.loadingBtn = true;
  const { error, pending } = await authStore.login(event.data);
  state.loadingBtn = pending.value;

  if (error.value && error.value.data) {
    const { message } = error.value.data;
    invalidPasswords ? invalidPasswords.push(password) : state.invalidUsers.set(email, [password]);
    state.unknownErrorServerMsg = message || 'An unknown error occurred. Please try again';
  }
  else {
    await cartStore.getCartHeader();
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
        :schema="userSchema.pick({email: true, password: true})"
        :state="stateSubmit"
        @submit="onSubmit"
      >
        <UFormGroup label="Email" name="email" class="mb-4">
          <UInput v-model="stateSubmit.email" size="xl" />
        </UFormGroup>

        <UFormGroup label="Password" name="password" class="mb-2">
          <UInput v-model="stateSubmit.password" size="xl" type="password" />
        </UFormGroup>

        <NuxtLink :to="ROUTES.RESET">
          <UButton variant="link" class="mb-4 pl-0">
            Forget Password?
          </UButton>
        </NuxtLink>

        <UButton :loading="state.loadingBtn" size="xl" block type="submit">
          Log in
        </UButton>
      </UForm>
    </div>
  </div>
</template>
