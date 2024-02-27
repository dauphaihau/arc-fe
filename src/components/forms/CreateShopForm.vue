<script setup lang="ts">
import { StatusCodes } from 'http-status-codes';
import type { FormSubmitEvent } from '#ui/types';
import { shopSchema } from '~/schemas/shop.schema';
import type { IShop } from '~/interfaces/shop';
import { ROUTES } from '~/config/enums/routes';

const { $api } = useNuxtApp();
const toast = useToast();

const formRef = ref();
const unknownErrorMsg = ref('');
const loading = ref(false);

const state = reactive({
  shop_name: '',
});

async function onSubmit(event: FormSubmitEvent<{ shop_name: IShop['shop_name'] }>) {
  formRef.value.clear();
  loading.value = true;
  const { pending, error, data } = await $api.shop.createShop(event.data);
  loading.value = pending.value;
  if (!error.value) {
    toast.add({
      title: 'Create shop success',
    });
    const authStore = useAuthStore();
    if (authStore?.user) {
      authStore.user.shop = data.value?.shop;
    }
    navigateTo(`${ROUTES.ACCOUNT}${ROUTES.SHOP}${ROUTES.DASHBOARD}`);
    return;
  }

  switch (error.value?.data.code) {
    case StatusCodes.INTERNAL_SERVER_ERROR:
      toast.add({
        title: 'Unknown erorr from server',
        icon: 'i-heroicons-exclamation-circle',
        color: 'red',
      });
  }
}

</script>

<template>
  <UCard
    :ui="{
      body: {
        padding: 'md:px-14 md:py-16'
      },
    }"
    class="max-w-[500px] mx-auto mt-12"
  >
    <h1 class="text-2xl font-bold text-center mb-3">
      Name your shop
    </h1>
    <p class="mb-4">
      Don’t sweat it! You can just draft a name now and change it later. We find
      sellers often draw inspiration from
      what
      they sell, their style, pretty much anything goes.
    </p>

    <UAlert
      v-if="unknownErrorMsg"
      color="rose"
      variant="solid"
      :close-button="{
        icon: 'i-heroicons-x-mark-20-solid', color: 'white', variant: 'link', padded: false,
      }"
      title=""
      :description="unknownErrorMsg"
      class="mb-4"
      @close="unknownErrorMsg=''"
    />
    <UForm
      ref="formRef"
      :validate-on="['submit']"
      :schema="shopSchema.pick({ shop_name: true })"
      :state="state"
      @submit="onSubmit"
    >
      <UFormGroup name="shop_name" class="mb-4">
        <UInput v-model="state.shop_name" :disabled="loading" size="xl" />
      </UFormGroup>

      <UButton :disabled="loading" size="xl" block type="submit" class="mt-6">
        Continue
      </UButton>
    </UForm>
  </UCard>
</template>
