<script setup lang="ts">

</script>

<template>
  <div class="bg-layout-shop">
    <div class="fixed z-[1] right-0 h-full w-1/2 bg-white" />
    <div class="flex min-h-screen max-w-shop-layout xl:mx-auto">
      <LayoutShopSidebar />
      <div class="h-full shrink-0 w-shop-layout-sidebar" />

      <div class="h-full grow bg-white relative z-[2]">
        <LayoutShopHeader />
        <main class="px-10 mt-20 min-h-screen">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
