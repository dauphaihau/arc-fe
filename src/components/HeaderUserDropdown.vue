<template>
  <div>
    <UPopover>
      <UTooltip text="Your account">
        <UButton
          color="gray"
          variant="ghost"
        >
          <Icon name="uil:user" color="black" />
        </UButton>
      </UTooltip>
      <template #panel>
        <div class="p-2 flex flex-col">
          <UButton color="gray" variant="ghost">
            <div class="flex items-center gap-3">
              <img
                src="~/assets/images/avatar-default.jpg"
                class="w-5 h-5 rounded-full"
                alt="avatar"
              >
              <div class="text-left">
                <div>
                  {{ user?.name }}
                </div>
                <div class="text-zinc-500/70 text-xs">
                  View your profile
                </div>
              </div>
            </div>
          </UButton>
          <UButton
            id="logout"
            color="gray"
            variant="ghost"
            @click="authStore.logout()"
          >
            <div class="flex gap-3">
              <Icon name="oi:account-logout" color="black" />
              Logout
            </div>
          </UButton>
        </div>
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

</script>
