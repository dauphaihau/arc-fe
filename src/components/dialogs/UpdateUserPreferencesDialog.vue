<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { StatusCodes } from 'http-status-codes';
import type { FormSubmitEvent } from '#ui/types';
import {
  type IExchangeRate,
  type IIpData,
  LOCAL_STORAGE_KEYS
} from '~/config/enums/local-storage-keys';
import type { MARKET_REGIONS } from '~/config/enums/market';
import {
  MARKET_CONFIG,
  MARKET_CURRENCIES,
  MARKET_LANGUAGES, MARKET_REGION_EMOJIS
} from '~/config/enums/market';
import type { IUser, UpdateUserBody } from '~/interfaces/user';
import { toastCustom } from '~/config/toast';
import { useUpdateUser } from '~/services/user';

dayjs.extend(utc);

type State = {
  region: MARKET_REGIONS
  language: { id: MARKET_LANGUAGES, label: string }
  ipData: IIpData
  currency: { id: MARKET_CURRENCIES, label: string }
};

const { $api } = useNuxtApp();
const authStore = useAuthStore();
const store = useStore();
const toast = useToast();
const {
  mutateAsync: updateUser,
  isError: isErrorUpdateUser,
  isPending: isPendingUpdateUser,
} = useUpdateUser({
  onResponse: ({ response }) => {
    if (response.status === StatusCodes.OK) {
      authStore.user = response._data.user;
    }
  },
});

const isOpen = ref(false);

const currencyOpts = [
  {
    id: MARKET_CURRENCIES.USD,
    label: '$ United States Dollar (USD)',
  },
  {
    id: MARKET_CURRENCIES.CAD,
    label: '$ Canadian Dollar (CAD)',
  },
  {
    id: MARKET_CURRENCIES.AUD,
    label: '$ Australian Dollar (AUD)',
  },
  {
    id: MARKET_CURRENCIES.EUR,
    label: '€ Euro (EUR)',
  },
  {
    id: MARKET_CURRENCIES.GBP,
    label: '£ British Pound (GBP)',
  },
  {
    id: MARKET_CURRENCIES.HKD,
    label: '$ Hong Kong Dollar (HKD)',
  },
  {
    id: MARKET_CURRENCIES.TWD,
    label: '$ Taiwan New Dollar (TWD)',
  },
  {
    id: MARKET_CURRENCIES.JPY,
    label: '¥ Japanese Yen (JPY)',
  },
  {
    id: MARKET_CURRENCIES.KRW,
    label: '₩ Korean Won (KRW)',
  },
  {
    id: MARKET_CURRENCIES.SGD,
    label: '$ Singapore Dollar (SGD)',
  },
  {
    id: MARKET_CURRENCIES.VND,
    label: '₫ Vietnamese Dong (VND)',
  },
];

const languageOpts = [
  {
    id: MARKET_LANGUAGES.EN,
    label: 'English (US)',
  },
  {
    id: MARKET_LANGUAGES.LA,
    label: 'Latin (LA)',
  },
  {
    id: MARKET_LANGUAGES.FR,
    label: 'Français (FR)',
  },
];

const regionOpts = ref<string[]>([]);

const state = reactive<State>({
  region: MARKET_CONFIG.BASE_REGION,
  language: languageOpts[0],
  currency: currencyOpts[0],
  ipData: undefined,
});

onMounted(async () => {
  // get & refresh rates once every 24 hours
  const exchangeRate = parseJSON<IExchangeRate>(localStorage[LOCAL_STORAGE_KEYS.EXCHANGE_RATE]);
  if (!exchangeRate || dayjs.utc().valueOf() >= exchangeRate.exp) {
    await store.getExchangeRates();
  }

  // get info data of current ip
  if (!authStore.isLogged) {
    const ipData = parseJSON<IIpData>(localStorage[LOCAL_STORAGE_KEYS.IP_DATA]);
    if (ipData) {
      state.ipData = ipData;
    }
    else {
      const { data, error } = await useFetch('/api/ip-data');
      if (!error.value && data.value) {
        useStorage(LOCAL_STORAGE_KEYS.IP_DATA, { ...data.value });
        state.ipData = data.value as IIpData;
      }
    }
    state.region = state.ipData?.country_name as MARKET_REGIONS || MARKET_CONFIG.BASE_REGION;
  }

  const userPreferences = authStore.getUser?.market_preferences ||
    parseJSON<IUser['market_preferences']>(localStorage[LOCAL_STORAGE_KEYS.USER_PREFERENCES]);

  if (userPreferences) {
    const currencyOptSelected = currencyOpts.find(opt => opt.id === userPreferences.currency);
    if (currencyOptSelected) {
      state.currency = currencyOptSelected;
    }
    state.region = userPreferences.region;
  }
  else {
    // set currency base on ip
    const currencyByIp = currencyOpts.find(opt => opt.id === state.ipData?.currency.code);
    if (currencyByIp) {
      state.currency = currencyByIp;
    }
    const preferences = {
      currency: state.currency.id,
      language: state.language.id,
      region: state.region as MARKET_REGIONS,
    };
    useStorage<IUser['market_preferences']>(LOCAL_STORAGE_KEYS.USER_PREFERENCES, preferences);
    store.user_preferences = preferences;
  }
});

watch(() => authStore.isLogged, () => {
  if (authStore.isLogged) {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES);
    const user = authStore.getUser;
    if (user && user.market_preferences) {
      useStorage<IUser['market_preferences']>(LOCAL_STORAGE_KEYS.USER_PREFERENCES, user.market_preferences);
      const currencyOpt = currencyOpts.find(opt => opt.id === user.market_preferences?.currency);
      if (currencyOpt) {
        state.currency = currencyOpt;
      }
      state.region = user.market_preferences.region;
    }
  }
});

watch(isOpen, async () => {
  if (isOpen.value && regionOpts.value.length === 0) {
    const { data } = await $api.address.getCountries();
    if (data.value && data.value.data.length > 0) {
      regionOpts.value = data.value.data.map(country => country.name);
    }
  }
});

const onSubmit = async (event: FormSubmitEvent<State>) => {
  const { currency, language, region } = event.data;
  const update: UpdateUserBody['market_preferences'] = {
    currency: currency.id,
    language: language.id,
    region,
  };

  if (authStore.isLogged) {
    await updateUser({
      market_preferences: update,
    }).catch(() => {
      toast.add({
        ...toastCustom.error,
        title: 'Update user preferences failed',
      });
    });
    if (isErrorUpdateUser.value) return;
  }

  localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_PREFERENCES);
  useStorage<IUser['market_preferences']>(LOCAL_STORAGE_KEYS.USER_PREFERENCES, update);
  window.location.reload();
};
</script>

<template>
  <div>
    <div
      class="flex items-center gap-6"
      @click="isOpen = true"
    >
      <div class="flex items-center gap-5">
        <div
          class="flex cursor-pointer items-center gap-3 rounded-md
             px-3 py-2 text-xs transition-all duration-200 hover:bg-customGray-200/50"
        >
          <div class="flex items-center gap-3 text-nowrap text-xs font-medium">
            <span>{{ MARKET_REGION_EMOJIS[state.region] }}</span>
            <span>{{ state.region }}</span>
          </div>
          <UDivider
            orientation="vertical"
            class="h-5 w-2"
          />
          <div class="flex items-center gap-2 text-nowrap font-medium">
            <UIcon
              name="i-heroicons-language"
              class="h-4"
            />
            {{ state.language.label }}
          </div>
          <UDivider
            orientation="vertical"
            class="h-5 w-2"
          />
          <div class="text-nowrap font-medium">
            {{ state.currency.label.charAt(0) }}
            ({{ MARKET_CURRENCIES[state.currency.id] }})
          </div>
        </div>
      </div>
    </div>

    <UModal
      v-model="isOpen"
      :ui="{
        margin: '!mb-72',
      }"
    >
      <div class="space-y-6 p-8">
        <div class="space-y-2">
          <h1 class="text-3xl font-bold">
            Update your settings
          </h1>
          <p class="text-base text-customGray-950">
            Set where you live, what language you speak and the currency you use.
          </p>
        </div>

        <UForm
          :state="state"
          @submit="onSubmit"
        >
          <div class="mb-8 space-y-5">
            <UFormGroup
              label="Region"
              name="region"
              required
              class="mb-4"
            >
              <USelectMenu
                v-model="state.region"
                :disabled="isPendingUpdateUser"
                size="xl"
                :options="regionOpts"
              />
            </UFormGroup>

            <UFormGroup
              label="Language"
              name="language"
              required
              class="mb-4"
            >
              <USelectMenu
                v-model="state.language"
                disabled
                size="xl"
                :options="languageOpts"
              />
            </UFormGroup>

            <UFormGroup
              label="Currency"
              name="currency"
              required
              class="mb-4"
            >
              <USelectMenu
                v-model="state.currency"
                size="xl"
                :disabled="isPendingUpdateUser"
                :options="currencyOpts"
                :ui-menu="{
                  select: '!normal-case',
                  option: { base: '!normal-case' },
                }"
              />
            </UFormGroup>
          </div>

          <div class="flex justify-end gap-3">
            <UButton
              :disabled="isPendingUpdateUser"
              size="lg"
              color="gray"
              @click="isOpen = false"
            >
              Cancel
            </UButton>
            <UButton
              :loading="isPendingUpdateUser"
              size="lg"
              type="submit"
            >
              Save
            </UButton>
          </div>
        </UForm>
      </div>
    </UModal>
  </div>
</template>

<style scoped>

</style>
