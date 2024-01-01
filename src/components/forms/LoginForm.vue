<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { userSchema } from '../../schemas/user.schema';
import type { LoginPayloadType } from '~/interfaces/user';
import { PATHS } from '~/config/enums/path';

const authStore = useAuthStore();
const formRef = ref();
const errorServerMsg = ref('');

const state = reactive({
  email: undefined,
  password: undefined,
});

async function onSubmit(event: FormSubmitEvent<LoginPayloadType>) {
  formRef.value.clear();
  const errorMessage = await authStore.login(event.data);
  if (errorMessage) {
    errorServerMsg.value = errorMessage;
  }
}

</script>

<template>
  <div class="space-y-5">
    <UAlert
      v-if="errorServerMsg"
      color="rose"
      variant="solid"
      :close-button="{
        icon: 'i-heroicons-x-mark-20-solid', color: 'white', variant: 'link', padded: false,
      }"
      title=""
      :description="errorServerMsg"
      @close="errorServerMsg=''"
    />

    <div class="rounded">
      <UForm
        ref="formRef"
        :validate-on="['submit']"
        :schema="userSchema.pick({email: true, password: true})"
        :state="state"
        @submit="onSubmit"
      >
        <UFormGroup label="Email" name="email" class="mb-4">
          <UInput v-model="state.email" size="xl" />
        </UFormGroup>

        <UFormGroup label="Password" name="password" class="mb-2">
          <UInput v-model="state.password" size="xl" type="password" />
        </UFormGroup>

        <NuxtLink :to="PATHS.RESET">
          <UButton variant="link" class="mb-4 pl-0">
            Forget Password?
          </UButton>
        </NuxtLink>

        <UButton size="xl" block type="submit">
          Log in
        </UButton>
      </UForm>
    </div>
  </div>
</template>
