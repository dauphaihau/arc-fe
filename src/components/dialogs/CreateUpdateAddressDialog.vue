<script setup lang="ts">

import type { FormSubmitEvent } from '#ui/types';
import type { IAddress, CreateBodyAddress } from '~/interfaces/address';
import { addressSchema } from '~/schemas/address.schema';

const props = defineProps<{ dataEdit?: IAddress | null }>();
const emit = defineEmits<{
  (e: 'onCreatedAddress', value: IAddress): void,
  (e: 'onUpdatedAddress', value: IAddress): void,
  (e: 'onCancelDialog'): void,
}>();

const { $api } = useNuxtApp();
const toast = useToast();

const isOpenDialog = ref(false);
const formRef = ref();

const stateLocal = reactive({
  countriesOptions: [] as string[],
  stateOptions: [] as string[],
  loadingStateOptions: false,
  loadingGetCountries: false,
});

let stateSubmit = reactive<Partial<CreateBodyAddress>>({});

watch(() => props.dataEdit, () => {
  if (props.dataEdit) {
    isOpenDialog.value = true;
    stateSubmit = props.dataEdit;
  }
});

async function onSubmit(event: FormSubmitEvent<CreateBodyAddress>) {
  formRef.value.clear();
  if (props.dataEdit) {
    const { error, data } = await $api.address.updateAddress(event.data);
    if (error.value || !data.value) {
      toast.add({ title: 'Something Wrong' });
    } else {
      emit('onUpdatedAddress', data.value.address);
      isOpenDialog.value = false;
    }
    return;
  }

  const { error, data } = await $api.address.createAddress(event.data);
  if (error.value || !data.value) {
    toast.add({ title: 'Something Wrong' });
  } else {
    emit('onCreatedAddress', data.value.address);
    isOpenDialog.value = false;
  }
}

watch(() => [stateSubmit.country, props.dataEdit], async () => {
  if (stateSubmit.country) {
    const { data, pending, error } = await $api.address.getStatesByCountry(stateSubmit.country);
    stateLocal.loadingStateOptions = pending.value;
    if (!error.value && data.value) {
      stateLocal.stateOptions = data.value.data.states.map(co => co.name);
    }
  }
});

watch(isOpenDialog, async () => {
  if (!isOpenDialog.value) {
    stateSubmit = {};
    emit('onCancelDialog');
  } else if (!stateLocal.countriesOptions.length) {
    const { pending, data } = await $api.address.getCountries();
    stateLocal.loadingGetCountries = pending.value;
    if (data.value && data.value.data.length > 0) {
      stateLocal.countriesOptions = data.value.data.map(co => co.name);
    }
  }
});

</script>

<template>
  <div>
    <UButton color="primary" variant="solid" @click="isOpenDialog = true">
      Add a new address
    </UButton>

    <UModal
      v-model="isOpenDialog"
      :ui="{
        inner: '-top-10'
      }"
    >
      <div class="p-12 space-y-5">
        <div class="space-y-1.5">
          <h1 class="text-3xl font-bold">
            Add new address
          </h1>
        </div>

        <div class="rounded">
          <UForm
            ref="formRef"
            :validate-on="['submit']"
            :state="stateSubmit"
            :schema="addressSchema.omit({ id: true, user: true})"
            @submit="onSubmit"
          >
            <UFormGroup required label="Full Name" name="full_name" class="mb-4">
              <UInput v-model="stateSubmit.full_name" size="xl" />
            </UFormGroup>
            <UFormGroup required label="Street Address" name="address1" class="mb-4">
              <UInput v-model="stateSubmit.address1" size="xl" />
            </UFormGroup>
            <UFormGroup label="Apt / Suite / Other" name="address2" class="mb-4">
              <UInput v-model="stateSubmit.address2" size="xl" />
            </UFormGroup>
            <UFormGroup required label="City" name="city" class="mb-4">
              <UInput v-model="stateSubmit.city" size="xl" />
            </UFormGroup>
            <UFormGroup required label="Country" name="country" class="mb-4">
              <USelectMenu
                v-model="stateSubmit.country"
                :loading="stateLocal.loadingGetCountries"
                :options="stateLocal.countriesOptions"
                size="xl"
              />
            </UFormGroup>

            <div class="flex gap-3 mb-4">
              <UFormGroup required label="State/Province" name="state" class="w-1/2">
                <USelectMenu
                  v-model="stateSubmit.state"
                  :loading="stateLocal.loadingStateOptions"
                  :disabled="!stateSubmit.country"
                  :options="stateLocal.stateOptions"
                  size="xl"
                  trailing
                />
              </UFormGroup>
              <UFormGroup required label="Zip/Postal code" name="zip">
                <UInput
                  v-model="stateSubmit.zip"
                  size="xl"
                  @keypress="keyPressIsNumber($event)"
                />
              </UFormGroup>
            </div>
            <UFormGroup required label="Phone" name="phone" class="mb-4">
              <UInput
                v-model="stateSubmit.phone"
                size="xl"
                type="phone"
                @keypress="keyPressIsNumber($event)"
              />
            </UFormGroup>

            <UCheckbox
              v-model="stateSubmit.is_primary"
              label="Set as default"
              name="is_primary"
            />
            <div class="mt-6 flex gap-3 justify-end">
              <UButton size="xl" variant="ghost" @click="isOpenDialog = false">
                Cancel
              </UButton>
              <UButton size="xl" type="submit">
                Save
              </UButton>
            </div>
          </UForm>
        </div>
      </div>
    </UModal>
  </div>
</template>
