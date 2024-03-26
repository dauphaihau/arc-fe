<script lang="ts" setup>
definePageMeta({ layout: 'shop', middleware: ['auth'] });

</script>

<template>
  <LayoutShopWrapperContent>
    <template #title>
      Update product
    </template>
    <template #content>
      <div class="mb-20">
        <UpdateProductForm />
      </div>
    </template>
  </LayoutShopWrapperContent>
</template>
