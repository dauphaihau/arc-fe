<script setup lang="ts">

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const route = useRoute();

const isOpen = ref(false);
const isLoginForm = ref(true);

defineShortcuts({
  escape: {
    usingInput: true,
    whenever: [isOpen],
    handler: () => { isOpen.value = false },
  },
});

watch(isOpen, () => {
  if (!isOpen.value) {
    isLoginForm.value = true;
  }
});

watch(() => route.path, () => {
  isOpen.value = false;
});

authStore.$subscribe((_mutation, state) => {
  if (state.user) {
    isOpen.value = false;
  }
});

</script>

<template>
  <div>
    <UButton
      v-if="!user"
      color="gray"
      variant="ghost"
      @click="isOpen = true"
    >
      {{ $t('Log in') }}
    </UButton>

    <UModal
      v-model="isOpen"
      :ui="{
        margin: '!mb-72'
      }"
    >
      <div class="p-12 space-y-5">
        <div class="space-y-1.5">
          <h1 class="text-3xl font-bold">
            {{ isLoginForm ? 'Log in' : 'Create your account' }}
          </h1>
          <p class="text-zinc-600/50 text-base">
            {{
              isLoginForm ?
                'Enter your credentials to access your account.' : 'Registration is easy.'
            }}
          </p>
        </div>

        <LoginForm v-if="isLoginForm" />
        <RegisterForm v-else />

        <div class="flex items-center mt-3">
          <p class="text-sm">
            {{ isLoginForm ? 'New to Arc?' : 'Already a Arc user?' }}
          </p>
          <UButton
            variant="link"
            class="pl-1"
            @click="isLoginForm = !isLoginForm"
          >
            {{ isLoginForm ? 'Register' : 'Log in' }}
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>
