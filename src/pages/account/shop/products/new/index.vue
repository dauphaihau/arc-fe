<script lang="ts" setup>
definePageMeta({ layout: 'shop' });

</script>

<template>
  <div class="pb-12">
    <div class="flex justify-between">
      <h1 class="shop-dashboard-title">
        Create a product
      </h1>
    </div>
    <div class="max-w-[700px] mx-auto">
      <CreateProductForm />
    </div>
  </div>
</template>
