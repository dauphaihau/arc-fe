<script setup lang="ts">

// const enum STEPS {
//   NAME_SHOP,
//   STOCK_SHOP,
// }

// const { $api } = useNuxtApp();
// const step = ref(STEPS.NAME_SHOP);

// const nextStep = (step: STEPS, data?: string) => {
// const nextStep = async () => {
//   if (step.value === STEPS.STOCK_SHOP) {
//     // submit
//
//     // const {
//     //   data: productsList,
//     //   pending,
//     //   error,
//     // } = await $api.shops.createShops();
//
//     // await $api.shops.createShop({});
//     return;
//   }
//   step.value += 1;
// };

// const steps = ['Name your shop', 'Stock your shop', 'task C', 'task D'];

const state = reactive({
  shop_name: '',
});
</script>

<template>
  <div class="mt-16 pb-20">
    <div class="">
      <h1 class="text-2xl font-bold text-center">
        Name your shop
      </h1>
      <p>
        Don’t sweat it! You can just draft a name now and change it later. We find
        sellers often draw inspiration from
        what
        they sell, their style, pretty much anything goes. More naming tips
      </p>
      <UInput v-model="state.shop_name" size="xl" />
    </div>
  </div>


  <!--  <div class="mt-16 pb-20">-->
  <!--    <Stepper :key="step" class="mb-20" :step="step" :steps="steps" />-->

  <!--    <div class="">-->
  <!--      <div v-if="step === STEPS.NAME_SHOP">-->
  <!--        <h1 class="text-2xl font-bold text-center">-->
  <!--          Name your shop-->
  <!--        </h1>-->
  <!--        <p>-->
  <!--          Don’t sweat it! You can just draft a name now and change it later. We find-->
  <!--          sellers often draw inspiration from-->
  <!--          what-->
  <!--          they sell, their style, pretty much anything goes. More naming tips-->
  <!--        </p>-->
  <!--        <UInput v-model="state.shop_name" size="xl" />-->
  <!--      </div>-->

  <!--      <div v-if="step === STEPS.STOCK_SHOP">-->
  <!--        <h1 class="text-2xl">-->
  <!--          Create a product-->
  <!--        </h1>-->
  <!--        <p>-->
  <!--          Add some photos and details about-->
  <!--          your item. Fill out what you can for now—you’ll be able to edit this-->
  <!--          later.-->
  <!--        </p>-->
  <!--        <CreateProductForm />-->
  <!--      </div>-->
  <!--    </div>-->
  <!--    <div class="fixed bottom-0 h-16 w-full">-->
  <!--      <div class="flex items-center gap-3 max-w-80 py-2">-->
  <!--        <UButton-->
  <!--          v-if="step === STEPS.STOCK_SHOP"-->
  <!--          size="lg"-->
  <!--          color="white"-->
  <!--          variant="solid"-->
  <!--          @click="() => step -= 1"-->
  <!--        >-->
  <!--          &lt;!&ndash;          Preview&ndash;&gt;-->
  <!--          Back-->
  <!--        </UButton>-->
  <!--        <UButton-->
  <!--          size="lg"-->
  <!--          block-->
  <!--          type="submit"-->
  <!--          @click="nextStep"-->
  <!--        >-->
  <!--          Save and continues-->
  <!--        </UButton>-->
  <!--      </div>-->
  <!--      &lt;!&ndash;    <UButton size="xl" block type="submit">&ndash;&gt;-->
  <!--      &lt;!&ndash;      Save&ndash;&gt;-->
  <!--      &lt;!&ndash;    </UButton>&ndash;&gt;-->
  <!--    </div>-->
  <!--  </div>-->
</template>
