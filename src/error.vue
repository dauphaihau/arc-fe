<script setup lang="ts">
import { ROUTES } from '~/config/enums/routes';

interface IError {
  statusCode: number;
  statusMessage: string;
  message: string;
}

const { error } = defineProps<{
  error: IError
}>();

const errorCode = computed(() => (
  !(error instanceof Error) || !error ?
    500 :
    error.statusCode
));

const errorMessage = computed(() => (
  !(error instanceof Error) || !error ?
    'Something went wrong' :
    error.statusMessage
));

const handleError = () => {
  clearError({ redirect: ROUTES.HOME });
};

useHead({
  title: computed(() => (errorCode.value === 404 ? 'Page Not Found' : errorMessage.value)),
});

</script>

<template>
  <div class="max-w-[350px] mx-auto grid place-content-center h-screen text-center">
    <div class="mb-8">
      <h1 class="text-primary text-xl font-medium mb-3">
        {{ errorCode }}
      </h1>
      <p class="font-bold text-2xl">
        {{ errorMessage }}
      </p>
    </div>
    <UButton size="xl" block @click="handleError">
      Back to home
    </UButton>
  </div>
</template>
