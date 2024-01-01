<script setup lang="ts">
import { PATHS } from '~/config/enums/path';

const authStore = useAuthStore();

const isDark = useDark();
const toggleDark = useToggle(isDark);

</script>

<template>
  <header class="flex justify-between items-center py-3 border-b border-b-zinc-200 px-4">
    <NuxtLink id="brand" :to="PATHS.HOME" class="font-bold">
      Arc
    </NuxtLink>

    <div class="flex items-center gap-4">
      <HeaderLangDropdown />

      <UButton
        color="gray"
        variant="ghost"
        class="icon-button"
        @click="toggleDark()"
      >
        <Icon v-if="!isDark" name="uil:sun" />
        <Icon v-else name="uil:moon" />
      </UButton>

      <div v-if="authStore.isLogged" class="flex items-center gap-4">
        <HeaderUserDropdown />
      </div>
      <RegisterLoginDialog />
    </div>
  </header>
</template>

<style scoped>
.icon-button {
  padding: 8px;
}

</style>
