<script setup lang="ts">
import { ROUTES } from '~/config/enums/routes';

const authStore = useAuthStore();

// const isDark = useDark();
// const toggleDark = useToggle(isDark);

</script>

<template>
  <header class="flex justify-between items-center py-3 px-8 max-w-[1650px] mx-auto">
    <NuxtLink id="brand" :to="ROUTES.HOME" class="font-bold">
      Arc
    </NuxtLink>

    <div class="flex items-center gap-4">
      <HeaderLangDropdown />

      <!--      <UButton-->
      <!--        color="gray"-->
      <!--        variant="ghost"-->
      <!--        class="icon-button"-->
      <!--        @click="toggleDark()"-->
      <!--      >-->
      <!--        <Icon v-if="!isDark" name="uil:sun" />-->
      <!--        <Icon v-else name="uil:moon" />-->
      <!--      </UButton>-->

      <div v-if="authStore.isLogged" class="flex items-center gap-4">
        <UTooltip text="Favorites">
          <UButton
            color="gray"
            variant="ghost"
            class="icon-button"
          >
            <Icon name="uil:heart" />
          </UButton>
        </UTooltip>
        <UTooltip text="Notifications">
          <UButton
            color="gray"
            variant="ghost"
            class="icon-button"
          >
            <Icon name="uil:bell" />
          </UButton>
        </UTooltip>
        <UTooltip text="Shop Manager">
          <UButton
            :to="`${ROUTES.ACCOUNT}${ROUTES.SHOP}`"
            color="gray"
            variant="ghost"
            class="icon-button"
          >
            <Icon name="uil:shop" />
          </UButton>
        </UTooltip>

        <HeaderUserDropdown />
      </div>
      <RegisterLoginDialog />
    </div>
  </header>
  <div class="border-b border-b-zinc-200 " />
</template>

<style scoped>
.icon-button {
  padding: 8px;
}

</style>
