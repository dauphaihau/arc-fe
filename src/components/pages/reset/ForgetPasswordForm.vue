<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { userSchema } from '~/schemas/user.schema';
import type { IUser } from '~/interfaces/user';

const props = defineProps({
  email: {
    type: String,
    default: '',
  },
});

const emit = defineEmits<{(e: 'nextStep', value: string): void }>();

const authStore = useAuthStore();

const formRef = ref();

const state = reactive({
  loadingBtn: false,
  unknownErrorServerMsg: '',
});

const stateSubmit = reactive({
  email: props.email,
});

async function onSubmit(event: FormSubmitEvent<{ email: IUser['email'] }>) {
  formRef.value.clear();

  state.loadingBtn = true;
  const { error, pending } = await authStore.forgetPassword(event.data.email);
  state.loadingBtn = pending.value;

  if (error.value && error.value.data) {
    const { message } = error.value.data;
    state.unknownErrorServerMsg = message || 'An unknown error occurred. Please try again';
  }
  else {
    emit('nextStep', event.data.email);
  }
}

</script>

<template>
  <div>
    <UAlert
      v-if="state.unknownErrorServerMsg"
      color="rose"
      variant="solid"
      :close-button="{
        icon: 'i-heroicons-x-mark-20-solid', color: 'white', variant: 'link', padded: false,
      }"
      title=""
      :description="state.unknownErrorServerMsg"
      class="mb-4"
      @close="state.unknownErrorServerMsg = ''"
    />
    <UForm
      ref="formRef"
      :validate-on="['submit']"
      :schema="userSchema.pick({ email: true })"
      :state="stateSubmit"
      @submit="onSubmit"
    >
      <UFormGroup label="Email" name="email" class="mb-4">
        <UInput v-model="stateSubmit.email" :disabled="state.loadingBtn" size="xl" />
      </UFormGroup>

      <UButton :loading="state.loadingBtn" size="xl" block type="submit" class="mt-6">
        Continue
      </UButton>
    </UForm>
  </div>
</template>
