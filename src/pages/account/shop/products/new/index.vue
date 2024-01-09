<script lang="ts" setup>
definePageMeta({ layout: 'shop' });

</script>

<template>
  <div class="pb-20">
    <div class="flex justify-between">
      <h1 class="shop-dashboard-title">
        Create a product
      </h1>
    </div>
    <div class="max-w-[700px] mx-auto mt-4">
      <CreateProductForm />
    </div>
  </div>
</template>
