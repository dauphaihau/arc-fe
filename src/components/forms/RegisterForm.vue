<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { userSchema } from '../../schemas/user.schema';
import type { RegisterPayloadType } from '~/interfaces/user';

const authStore = useAuthStore();
const unknownErrorMsg = ref('');
const form = ref();

const state = reactive({
  name: '',
  email: '',
  password: '',
});

async function onSubmit(event: FormSubmitEvent<RegisterPayloadType>) {
  form.value.clear();
  const res = await authStore.register(event.data);
  if (!res) {
    return;
  }
  if (!res.path) {
    unknownErrorMsg.value = res.message;
  } else {
    form.value.setErrors([res]);
  }
}

</script>

<template>
  <div class="space-y-5">
    <UAlert
      v-if="unknownErrorMsg"
      color="rose"
      variant="solid"
      :close-button="{
        icon: 'i-heroicons-x-mark-20-solid', color: 'white', variant: 'link', padded: false
      }"
      title=""
      :description="unknownErrorMsg"
      @close="unknownErrorMsg = ''"
    />

    <div class="rounded">
      <UForm
        ref="form"
        :validate-on="['submit']"
        :schema="userSchema.pick({ name: true, email: true, password: true })"
        :state="state"
        @submit="onSubmit"
      >
        <UFormGroup label="Name" name="name" class="mb-4">
          <UInput v-model="state.name" size="xl" />
        </UFormGroup>

        <UFormGroup label="Email" name="email" class="mb-4">
          <UInput v-model="state.email" size="xl" />
        </UFormGroup>

        <UFormGroup label="Password" name="password" class="mb-2">
          <UInput v-model="state.password" size="xl" type="password" />
        </UFormGroup>

        <UButton size="xl" block type="submit" class="mt-8">
          Register
        </UButton>
      </UForm>
    </div>
  </div>
</template>
