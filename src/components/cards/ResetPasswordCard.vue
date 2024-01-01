<script setup lang="ts">
const slots = useSlots();
</script>

<template>
  <UCard
    :ui="{
      body: {
        padding: 'md:px-14 md:py-16'
      },
      shadow: 'shadow-2xl'
    }"
  >
    <div class="flex flex-col gap-4">
      <div class="space-y-2">
        <h1 v-if="slots.title" class="text-2xl font-bold">
          <slot name="title" />
        </h1>
        <p v-if="slots.subtitle" class="text-zinc-500/90 text-sm">
          <slot name="subtitle" />
        </p>
      </div>
      <slot name="content" />
    </div>
  </UCard>
</template>
