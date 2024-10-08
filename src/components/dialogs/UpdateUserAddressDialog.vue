<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import type { UserAddress, CreateBodyUserAddressBody } from '~/types/user-address';
import { ADDRESS_CONFIG } from '~/config/enums/address';
import { createUserAddressSchema } from '~/schemas/user-address.schema';
import { toastCustom } from '~/config/toast';
import { useUpdateUserAddress } from '~/services/user';
import { useGetCountries, useGetStatesByCountry } from '~/services/address';

const props = defineProps<{ dataEdit: UserAddress }>();

const toast = useToast();
const dialog = useModal();
const queryClient = useQueryClient();

const formRef = ref();

const stateSubmit = reactive<Partial<CreateBodyUserAddressBody>>({ ...props.dataEdit });

const {
  data: dataGetCountries,
  isPending: isPendingGetCountries,
} = useGetCountries();

const {
  data: dataGetStatesByCountry,
  isFetching: isPendingGetStates,
  refetch: refetchGetStatesByCountry,
} = useGetStatesByCountry(computed(() => stateSubmit.country));

const {
  mutateAsync: updateUserAddress,
} = useUpdateUserAddress();

const countriesOptions = computed(() => {
  return dataGetCountries.value?.data.map(co => co.name) || [];
});

const stateOptions = computed(() => {
  return dataGetStatesByCountry.value?.data.states.map(st => st.name) || [];
});

onMounted(() => {
  refetchGetStatesByCountry();
});

async function onSubmit(event: FormSubmitEvent<CreateBodyUserAddressBody>) {
  formRef.value.clear();
  try {
    await updateUserAddress(event.data);
    await queryClient.invalidateQueries({
      queryKey: ['get-user-addresses'],
    });
    await dialog.close();
  }
  catch (error) {
    toast.add({
      ...toastCustom.error,
      title: 'Update address failed',
    });
  }
}

watch(() => stateSubmit.country, () => {
  stateSubmit.state = undefined;
  stateSubmit.zip = undefined;
  refetchGetStatesByCountry();
});
</script>

<template>
  <UModal
    :ui="{
      inner: '-top-10',
    }"
  >
    <div class="space-y-5 p-12">
      <div class="space-y-1.5">
        <h1 class="text-3xl font-bold">
          Update address
        </h1>
      </div>

      <div class="rounded">
        <UForm
          ref="formRef"
          :validate-on="['submit']"
          :state="stateSubmit"
          :schema="createUserAddressSchema"
          @submit="onSubmit"
        >
          <UFormGroup
            required
            label="Full Name"
            name="full_name"
            class="mb-4"
          >
            <UInput
              v-model="stateSubmit.full_name"
              :maxlength="ADDRESS_CONFIG.MAX_CHAR_FULL_NAME"
              size="xl"
            />
          </UFormGroup>
          <UFormGroup
            required
            label="Street UserAddress"
            name="address1"
            class="mb-4"
          >
            <UInput
              v-model="stateSubmit.address1"
              :maxlength="ADDRESS_CONFIG.MAX_CHAR_ADDRESS"
              size="xl"
            />
          </UFormGroup>
          <UFormGroup
            label="Apt / Suite / Other"
            name="address2"
            class="mb-4"
          >
            <UInput
              v-model="stateSubmit.address2"
              :maxlength="ADDRESS_CONFIG.MAX_CHAR_ADDRESS"
              size="xl"
            />
          </UFormGroup>
          <UFormGroup
            required
            label="City"
            name="city"
            class="mb-4"
          >
            <UInput
              v-model="stateSubmit.city"
              :maxlength="ADDRESS_CONFIG.MAX_CHAR_CITY"
              size="xl"
            />
          </UFormGroup>
          <UFormGroup
            required
            label="Country"
            name="country"
            class="mb-4"
          >
            <USelectMenu
              v-model="stateSubmit.country"
              :loading="isPendingGetCountries"
              :options="countriesOptions"
              size="xl"
            />
          </UFormGroup>

          <div class="mb-4 flex gap-3">
            <UFormGroup
              required
              label="StateCheckoutNow/Province"
              name="state"
              class="w-1/2"
            >
              <USelectMenu
                v-model="stateSubmit.state"
                :loading="isPendingGetStates"
                :disabled="!stateSubmit.country || isPendingGetStates"
                :options="stateOptions"
                size="xl"
                trailing
              />
            </UFormGroup>
            <UFormGroup
              required
              label="Zip/Postal code"
              name="zip"
              class="w-1/2"
            >
              <UInput
                v-model="stateSubmit.zip"
                v-numeric
                :maxlength="ADDRESS_CONFIG.MAX_CHAR_ZIP"
                size="xl"
              />
            </UFormGroup>
          </div>
          <UFormGroup
            required
            label="Phone"
            name="phone"
            class="mb-4"
          >
            <UInput
              v-model="stateSubmit.phone"
              v-numeric
              size="xl"
              :maxlength="ADDRESS_CONFIG.MAX_CHAR_PHONE"
              type="phone"
            />
          </UFormGroup>

          <UCheckbox
            v-model="stateSubmit.is_primary"
            label="Set as default"
            name="is_primary"
          />
          <div class="mt-6 flex justify-end gap-3">
            <UButton
              size="xl"
              color="gray"
              @click="dialog.close"
            >
              Cancel
            </UButton>
            <UButton
              size="xl"
              type="submit"
            >
              Save
            </UButton>
          </div>
        </UForm>
      </div>
    </div>
  </UModal>
</template>
