<script setup lang="ts">
import { PRODUCT_WHO_MADE } from '~/config/enums/product';

const route = useRoute();
const router = useRouter();

const isDigitalOpts = [
  { value: 'all', label: 'All' },
  { value: true, label: 'Digital' },
  { value: false, label: 'Physical' },
];

// const priceOpts = [
//   { value: 'all', label: 'Any price' },
//   { value: 'custom', label: 'Custom' },
// ];

const productWhoMadeOpts = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: PRODUCT_WHO_MADE.I_DID,
    label: 'Handmade',
  },
  // {
  //   id: PRODUCT_WHO_MADE.COLLECTIVE,
  //   label: 'A member of my shop',
  // },
  // {
  //   id: PRODUCT_WHO_MADE.SOMEONE_ELSE,
  //   label: 'Another company or person',
  // },
];

const state = reactive({
  is_digital: 'all',
  price: 'all',
  who_made: 'all',
});

watch(state, () => {
  const routeQuery = { ...route.query };
  Object.keys(state).forEach((key) => {
    if (state[key] !== 'all') {
      routeQuery[key] = state[key];
    }
    // else {
    //   delete routeQuery[key];
    // }
  });
  router.push({ query: routeQuery });
});
</script>

<template>
  <UFormGroup
    label="Item format"
    name="is_digital"
    class="mb-4"
  >
    <URadio
      v-for="opt of isDigitalOpts"
      :key="opt.value.toString()"
      v-model="state.is_digital"
      v-bind="opt"
    />
  </UFormGroup>

  <!--  <div class="mb-4"> -->
  <!--    <UFormGroup label="Price" name="price" class="mb-2"> -->
  <!--      <URadio -->
  <!--        v-for="opt of priceOpts" -->
  <!--        :key="opt.value" -->
  <!--        v-model="state.price" -->
  <!--        v-bind="opt" -->
  <!--      /> -->
  <!--    </UFormGroup> -->

  <!--    <div v-if="state.price !== 'all'" class="flex items-center gap-3"> -->
  <!--      <UFormGroup name="email" class=""> -->
  <!--        <UInput v-model="state.email" placeholder="Low" size="md" /> -->
  <!--      </UFormGroup> -->

  <!--      <div>to</div> -->

  <!--      <UFormGroup name="password" class=""> -->
  <!--        <UInput v-model="state.password" placeholder="High" size="md" /> -->
  <!--      </UFormGroup> -->
  <!--    </div> -->
  <!--  </div> -->

  <UFormGroup
    label="Item type"
    name="who_made"
    class="mb-4"
  >
    <URadio
      v-for="type of productWhoMadeOpts"
      :key="type.value"
      v-model="state.who_made"
      v-bind="type"
    />
  </UFormGroup>
</template>

<style scoped>

</style>
