<script setup lang="ts">
const router = useRouter();
const route = useRoute();

const options = [
  { id: null, label: 'Relevancy' },
  { id: 'newest', label: 'Newest' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
];

const selected = ref(options[0]);

watch(selected, () => {
  const routeQuery = { ...route.query };
  if (selected.value.id) {
    routeQuery.order = selected.value.id;
  }
  else {
    delete routeQuery.order;
  }
  router.push({ query: routeQuery });
});
</script>

<template>
  <div class="flex items-center gap-2">
    <div>Sort by:</div>
    <USelectMenu
      v-model="selected"
      :options="options"
      :ui-menu="{
        width: 'w-[10.5rem]',
      }"
    />
  </div>
</template>

<style scoped>

</style>
