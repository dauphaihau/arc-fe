<script setup lang="ts">
import { PATHS } from '~/config/enums/path';

const error = useError();

const errorCode = computed(() => (
  error.value instanceof Error || !error.value ?
    500 :
    error.value.statusCode
));

const errorMessage = computed(() => (
  error.value instanceof Error || !error.value ?
    'Something went wrong' :
    error.value.statusMessage
));

const handleError = () => {
  clearError({ redirect: PATHS.HOME });
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
