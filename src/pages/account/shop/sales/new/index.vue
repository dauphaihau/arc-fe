<script lang="ts" setup>
definePageMeta({ layout: 'shop', middleware: ['auth'] });
</script>

<template>
  <LayoutShopWrapperContent>
    <template #title>
      Set up a sale
    </template>
    <template #description>
      Basic info
      Running a sale can help you clear out inventory,
      attract new customers, and encourage shoppers to spend more.
      The discount you offer is totally up to you.
    </template>
    <template #content>
      <div class="mb-20">
        <RunSaleForm />
      </div>
    </template>
  </LayoutShopWrapperContent>
</template>
