<script setup lang="ts">
const slots = useSlots();
</script>

<template>
  <div>
    <div class="flex justify-between mb-6">
      <div>
        <h1 class="text-2xl font-semibold text-customGray-950">
          <slot name="title" />
        </h1>
        <p v-if="slots.description" class="text-customGray-800 text-sm">
          <slot name="description" />
        </p>
      </div>
      <slot name="actions" />
    </div>
    <div>
      <slot name="content" />
    </div>
  </div>
</template>


<style scoped>

</style>
