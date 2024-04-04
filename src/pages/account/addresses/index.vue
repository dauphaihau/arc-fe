<script lang="ts" setup>

import type { IAddress } from '~/interfaces/address';

definePageMeta({ layout: 'market', middleware: ['auth'] });

const { $api } = useNuxtApp();

const {
  pending: pendingGetAddresses,
  data: addressesApi,
} = await $api.address.getAddresses({
  select: '-user,-createdAt,-updatedAt',
  sortBy: '-is_primary',
});

const addresses = ref<IAddress[]>((addressesApi.value && addressesApi.value.results) || []);
const dataEdit = ref<IAddress | null>(null);

const deleteAddress = async (id: IAddress['id']) => {
  const { error } = await $api.address.deleteAddress(id);
  if (!error.value) {
    addresses.value = addresses.value.filter(item => item.id !== id);
  }
};

const onCreatedAddress = (value: IAddress) => {
  if (value.is_primary) {
    addresses.value[0].is_primary = false;
    addresses.value.unshift(value);
  }
  else {
    addresses.value.push(value);
  }
};

const onUpdatedAddress = (value: IAddress) => {
  if (value.is_primary) {
    addresses.value[0].is_primary = false;
    const filtered = addresses.value.filter(add => !add.is_primary);
    filtered.unshift(value);
    addresses.value = filtered;
  }
};

</script>

<template>
  <div>
    <h3 class="text-2xl font-medium">
      Your shipping addresses
    </h3>
    <CreateUpdateAddressDialog
      class="mt-4"
      :data-edit="dataEdit"
      @on-created-address="onCreatedAddress"
      @on-updated-address="onUpdatedAddress"
      @on-cancel-dialog="dataEdit = null"
    />

    <div v-if="pendingGetAddresses">
      <Loading />
    </div>
    <div v-else class="mt-8 grid grid-cols-3 gap-x-56 gap-y-16">
      <div v-for="item in addresses" :key="item.id">
        <div class="flex flex-col gap-3 min-w-56">
          <div class="">
            {{ item.full_name }}
          </div>
          <div class="">
            {{ item.address1 }}
          </div>
          <div class="flex gap-2">
            <div>{{ item.city }}</div>
            <div>{{ item.zip }}</div>
          </div>
          <div class="">
            {{ item.country }}
          </div>
          <div class="flex items-center gap-3 mt-4">
            <UButton
              :padded="false"
              variant="link"
              @click="() => dataEdit = item"
            >
              Edit
            </UButton>
            <UButton
              :padded="false"
              variant="link"
              @click="() => deleteAddress(item.id)"
            >
              Delete
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
