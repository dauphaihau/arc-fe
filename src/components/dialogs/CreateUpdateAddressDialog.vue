<script setup lang="ts">

import type { FormSubmitEvent } from '#ui/types';
import type { IAddress, CreateBodyAddress } from '~/interfaces/address';
import { ADDRESS_CONFIG } from '~/config/enums/address';
import { addressSchema } from '~/schemas/address.schema';
import { toastCustom } from '~/config/toast';

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

const stateSubmit = ref<Partial<CreateBodyAddress>>({});

watch(() => props.dataEdit, () => {
  if (props.dataEdit) {
    isOpenDialog.value = true;
    stateSubmit.value = props.dataEdit;
  }
});

async function onSubmit(event: FormSubmitEvent<CreateBodyAddress>) {
  formRef.value.clear();
  if (props.dataEdit) {
    const { error, data } = await $api.address.updateAddress(event.data);
    if (error.value || !data.value) {
      toast.add({
        ...toastCustom.error,
        title: 'Update address failed',
      });
    }
    else {
      emit('onUpdatedAddress', data.value.address);
      isOpenDialog.value = false;
    }
    return;
  }

  const { error, data } = await $api.address.createAddress(event.data);
  if (error.value || !data.value) {
    toast.add({
      ...toastCustom.error,
      title: 'Create address failed',
    });
  }
  else {
    emit('onCreatedAddress', data.value.address);
    isOpenDialog.value = false;
  }
}

watch(() => [stateSubmit.value.country, props.dataEdit], async () => {
  if (stateSubmit.value.country) {
    if (!props.dataEdit) {
      stateSubmit.value.state = undefined;
      stateSubmit.value.zip = undefined;
    }

    stateLocal.loadingStateOptions = true;
    const {
      data, pending, error,
    } = await $api.address.getStatesByCountry(stateSubmit.value.country);
    stateLocal.loadingStateOptions = pending.value;

    if (!error.value && data.value) {
      stateLocal.stateOptions = data.value.data.states.map(st => st.name);
    }
  }
});

watch(isOpenDialog, async () => {
  if (!isOpenDialog.value) {
    stateSubmit.value = {};
    emit('onCancelDialog');
  }
  else if (!stateLocal.countriesOptions.length) {
    stateLocal.loadingGetCountries = true;
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
            {{ props.dataEdit ? 'Update': 'Add new' }}
            address
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
              <UInput
                v-model="stateSubmit.full_name"
                :maxlength="ADDRESS_CONFIG.MAX_CHAR_FULL_NAME"
                size="xl"
              />
            </UFormGroup>
            <UFormGroup required label="Street Address" name="address1" class="mb-4">
              <UInput
                v-model="stateSubmit.address1"
                :maxlength="ADDRESS_CONFIG.MAX_CHAR_ADDRESS"
                size="xl"
              />
            </UFormGroup>
            <UFormGroup label="Apt / Suite / Other" name="address2" class="mb-4">
              <UInput
                v-model="stateSubmit.address2"
                :maxlength="ADDRESS_CONFIG.MAX_CHAR_ADDRESS"
                size="xl"
              />
            </UFormGroup>
            <UFormGroup required label="City" name="city" class="mb-4">
              <UInput
                v-model="stateSubmit.city"
                :maxlength="ADDRESS_CONFIG.MAX_CHAR_CITY"
                size="xl"
              />
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
                  :disabled="!stateSubmit.country || stateLocal.loadingStateOptions"
                  :options="stateLocal.stateOptions"
                  size="xl"
                  trailing
                />
              </UFormGroup>
              <UFormGroup required label="Zip/Postal code" name="zip" class="w-1/2">
                <UInput
                  v-model="stateSubmit.zip"
                  :maxlength="ADDRESS_CONFIG.MAX_CHAR_ZIP"
                  size="xl"
                  @keypress="keyPressIsNumber($event)"
                />
              </UFormGroup>
            </div>
            <UFormGroup required label="Phone" name="phone" class="mb-4">
              <UInput
                v-model="stateSubmit.phone"
                size="xl"
                :maxlength="ADDRESS_CONFIG.MAX_CHAR_PHONE"
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
              <UButton
                size="xl"
                color="gray"
                @click="isOpenDialog = false"
              >
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
