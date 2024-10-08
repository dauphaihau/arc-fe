<script setup lang="ts">
import { consola } from 'consola';
import type { FormError, FormErrorEvent, FormSubmitEvent } from '#ui/types';
import { createProductBodySchema, createProductInventorySchema } from '~/schemas/request/shop-product.schema';
import {
  isDigitalOpts,
  PRODUCT_CONFIG,
  PRODUCT_STATES,
  PRODUCT_VARIANT_TYPES,
  productWhoMadeOpts
} from '~/config/enums/product';
import { ROUTES } from '~/config/enums/routes';
import { toastCustom } from '~/config/toast';
import { CreateShippingProductDialog } from '#components';
import { useShopCreateProduct } from '~/services/shop';
import { useGetPresignedUrl } from '~/services/upload';
import type {
  CombineVariant,
  CreateProductBody,
  CreateProductShipping, NoneVariant,
  RequestCreateProductBody,
  SingleVariant,
  StateCombineVariant,
  StateNoneVariant,
  StateSingleVariant,
  StateSubmit
} from '~/types/request-api/shop-product';
import type { PickPartial } from '~/types/utils';

const router = useRouter();
const toast = useToast();
const modal = useModal();

const fileImages = ref<File[]>([]);
const formRef = ref();
const isProductHaveVariants = ref(false);
const loadingSubmit = ref(false);
const btnSubmitRef = ref();
const enabledButtonSubmit = ref(false);
const countValidate = ref(0);

const shipping = ref<CreateProductShipping | undefined>();

const noneVariant = reactive<StateNoneVariant>({
  stock: 1,
});

const singleVariant = reactive<StateSingleVariant>({});

const combineVariant = reactive<StateCombineVariant>({});

const stateSubmit = reactive<StateSubmit>({
  who_made: productWhoMadeOpts[0].id,
  is_digital: false,
  state: PRODUCT_STATES.ACTIVE,
  variant_type: PRODUCT_VARIANT_TYPES.NONE,
  attributes: [],
  tags: [],
});

const {
  mutateAsync: createProduct,
} = useShopCreateProduct();

const {
  mutateAsync: getPresignedUrl,
} = useGetPresignedUrl();

const showCreateShippingProductDialog = () => {
  modal.open(CreateShippingProductDialog, {
    initData: shipping.value,
    onApply(val) {
      shipping.value = val;
    },
  });
};

const validateForm = (values: CreateProductBody): FormError[] => {
  let errors: FormError[] = [];
  countValidate.value++;

  const result = createProductBodySchema.safeParse(values);
  if (!result.success) {
    errors = result.error.issues.map((detail) => {
      const path = detail.path.at(-1);
      return {
        path: typeof path === 'string' ? path : '',
        message: detail.message,
      };
    });
  }
  return errors;
};

async function uploadImage() {
  if (fileImages.value.length === 0) {
    consola.error('images is invalid');
    return;
  }

  const promisesUploadImages = [];
  const relative_urls = [];

  for (let i = 0; i < fileImages.value.length; i++) {
    const { presigned_url, key } = await getPresignedUrl();

    if (!presigned_url || !key) {
      toast.add({
        ...toastCustom.error,
        title: 'Oops',
        description: 'Something wrong',
      });
      return;
    }

    relative_urls.push(key);

    const promise = useFetch(presigned_url, {
      method: 'PUT',
      headers: {
        'Content-Type': fileImages.value[i].type,
      },
      body: fileImages.value[i],
    });

    promisesUploadImages.push(promise);
  }

  await Promise.all(promisesUploadImages);

  return relative_urls;
}

async function onSubmit(event: FormSubmitEvent<CreateProductBody>) {
  const dataSubmit = event.data as PickPartial<CreateProductBody, 'attributes' | 'tags'>;

  if (fileImages.value.length === 0) {
    consola.error('images is invalid');
    return;
  }
  if (!shipping.value) {
    consola.error('shipping be undefined');
    return;
  }
  if (dataSubmit.tags && dataSubmit.tags.length === 0) {
    delete dataSubmit.tags;
  }
  if (dataSubmit.attributes && dataSubmit.attributes.length === 0) {
    delete dataSubmit.attributes;
  }

  let bodyData = {
    ...dataSubmit,
    shipping: shipping.value,
  };
  switch (bodyData.variant_type) {
    case 'none':
      bodyData = { ...bodyData, ...noneVariant as NoneVariant };
      break;
    case 'single':
      if (!singleVariant.variant_options) return;
      bodyData = { ...bodyData, ...singleVariant as SingleVariant };
      break;
    case 'combine':
      if (!combineVariant.variant_options) return;
      bodyData = { ...bodyData, ...combineVariant as CombineVariant };
      break;
  }

  loadingSubmit.value = true;

  try {
    const relative_urls = await uploadImage();
    if (!relative_urls) return;
    const images = relative_urls.map((key, index) => ({ relative_url: key, rank: index + 1 }));

    await createProduct({
      ...bodyData,
      images,
    } as RequestCreateProductBody);

    toast.add({
      ...toastCustom.success,
      title: 'Create product success',
    });
    await router.push(ROUTES.ACCOUNT + ROUTES.SHOP + ROUTES.PRODUCTS);
  }
  catch (error) {
    toast.add({
      ...toastCustom.error,
      title: 'Create product failed',
    });
  }

  loadingSubmit.value = false;
}

function onErrorFrom(event: FormErrorEvent) {
  event.errors.sort((a, b) => {
    const sortingArr = ['description', 'title'];
    return sortingArr.indexOf(b.path) - sortingArr.indexOf(a.path);
  });
  const element = document.getElementById(event.errors[0].id);
  element?.focus();
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// enable button submit if valid
watchDebounced(
  () => [stateSubmit, noneVariant, fileImages.value, shipping],
  () => {
    const baseParsed = createProductBodySchema.safeParse(stateSubmit);
    const conditions = [baseParsed.success, fileImages.value.length > 0, shipping.value];

    if (stateSubmit.variant_type === PRODUCT_VARIANT_TYPES.NONE) {
      const resultParsed = createProductInventorySchema.safeParse(noneVariant);
      conditions.push(resultParsed.success);
    }
    enabledButtonSubmit.value = conditions.every(Boolean);
  },
  { debounce: 500, maxWait: 1000, deep: true }
);

watch(isProductHaveVariants, () => {
  if (isProductHaveVariants.value) {
    noneVariant.price = undefined;
    noneVariant.stock = 1;
  }
  stateSubmit.variant_type = isProductHaveVariants.value ?
    PRODUCT_VARIANT_TYPES.SINGLE :
    PRODUCT_VARIANT_TYPES.NONE;
});
</script>

<template>
  <UForm
    ref="formRef"
    :validate-on="['submit']"
    :validate="validateForm"
    :state="stateSubmit"
    class="space-y-7"
    @error="onErrorFrom"
    @submit="onSubmit"
  >
    <WrapperFormGroupCard>
      <template #title>
        Basic info
      </template>
      <template #content>
        <CreateProductImagesInput
          v-model="fileImages"
          class="mb-4"
        />
        <UFormGroup
          label="Title"
          name="title"
          class="mb-4"
          description="Include keywords that buyers would use to search for your product."
          required
        >
          <UInput
            v-model.trim="stateSubmit.title"
            :disabled="loadingSubmit"
            size="lg"
          />
        </UFormGroup>
        <UFormGroup
          label="Description"
          name="description"
          :help="stateSubmit.description
            && `${stateSubmit.description.length}/${PRODUCT_CONFIG.MAX_CHAR_DESCRIPTION}`
          "
          required
        >
          <UTextarea
            v-model="stateSubmit.description"
            autoresize
            :maxlength="PRODUCT_CONFIG.MAX_CHAR_DESCRIPTION"
            :rows="5"
            :disabled="loadingSubmit"
            size="lg"
          />
        </UFormGroup>
      </template>
    </WrapperFormGroupCard>

    <WrapperFormGroupCard>
      <template #title>
        Details
      </template>
      <template #subtitle>
        Share a few more specifics about your product to make
        it easier to find in search, and to help buyers know what
        to expect.
      </template>
      <template #content>
        <div>
          <UFormGroup
            label="Type"
            name="is_digital"
            class="mb-4"
          >
            <RadioGroupInput
              v-model="stateSubmit.is_digital"
              :options="isDigitalOpts"
              :disabled="loadingSubmit"
              row
            />
          </UFormGroup>

          <div class="grid grid-cols-4">
            <UFormGroup
              label="Who made it?"
              name="who_made"
              required
              class="mb-4 max-w-[218px]"
            >
              <USelectMenu
                v-model="stateSubmit.who_made"
                size="lg"
                :disabled="loadingSubmit"
                :options="productWhoMadeOpts"
                value-attribute="id"
              />
            </UFormGroup>
          </div>

          <UpdateCreateProductSearchCategoryInput
            v-model="stateSubmit.category_id"
            :title="stateSubmit.title"
          />

          <UpdateCreateProductSelectAttributesInput
            v-if="stateSubmit.category_id"
            :key="stateSubmit.category_id"
            v-model="stateSubmit.attributes"
            :category-id="stateSubmit.category_id"
          />
          <UpdateCreateProductTagsInput v-model="stateSubmit.tags" />
        </div>
      </template>
    </WrapperFormGroupCard>

    <WrapperFormGroupCard>
      <template #title>
        Shipping
      </template>
      <template #subtitle>
        Give shoppers clear expectations about delivery time and cost by
        making sure your shipping info is accurate,
        including the shipping profile and your order processing schedule.
      </template>
      <template #content>
        <div>
          <UFormGroup
            class="mb-4"
            label="Shipping option"
            name="shipping"
            required
          >
            <div class="flex items-center gap-3">
              <div
                v-if="shipping"
                class="text-gray-600"
              >
                {{ shipping.process_time }} processing time, from {{ shipping.zip }}
              </div>
              <UButton
                color="gray"
                variant="solid"
                @click="showCreateShippingProductDialog"
              >
                {{ shipping ? 'Edit' : 'Add' }} shipping
              </UButton>
            </div>
          </UFormGroup>
        </div>
      </template>
    </WrapperFormGroupCard>

    <WrapperFormGroupCard>
      <template #title>
        Inventory and pricing
      </template>
      <template #content>
        <div>
          <UButton
            class="mb-4"
            color="gray"
            variant="solid"
            @click="() => isProductHaveVariants = !isProductHaveVariants"
          >
            {{ !isProductHaveVariants ? 'Add variantions' : 'Remove variantions' }}
          </UButton>
          <CreateProductVariantInput
            v-if="isProductHaveVariants"
            v-model:single-variant="singleVariant"
            v-model:combine-variant="combineVariant"
            v-model:variant-type="stateSubmit.variant_type"
            :count-validate="countValidate"
          />
          <UpdateCreateProductNoneVariantInput
            v-else
            v-model:none-variant="noneVariant"
            :disabled="loadingSubmit"
            class="max-w-[40%]"
          />
        </div>
      </template>
    </WrapperFormGroupCard>

    <button
      ref="btnSubmitRef"
      type="submit"
      class="hidden"
    />
  </UForm>

  <div class="fixed-actions-form">
    <UButton
      :disabled="loadingSubmit"
      size="md"
      color="gray"
      @click="router.push(`${ROUTES.ACCOUNT}${ROUTES.SHOP}${ROUTES.PRODUCTS}`)"
    >
      Cancel
    </UButton>
    <UButton
      :disabled="!enabledButtonSubmit || loadingSubmit"
      :loading="loadingSubmit && stateSubmit.state === PRODUCT_STATES.DRAFT"
      size="md"
      type="submit"
      variant="soft"
      @click="() => {
        stateSubmit.state = PRODUCT_STATES.DRAFT;
        btnSubmitRef.click();
      }"
    >
      Save
    </UButton>
    <UButton
      :disabled="!enabledButtonSubmit || loadingSubmit"
      :loading="loadingSubmit && stateSubmit.state === PRODUCT_STATES.ACTIVE"
      size="md"
      type="submit"
      @click="() => btnSubmitRef.click()"
    >
      Save & Display
    </UButton>
  </div>
</template>

<style scoped>
@import url("~/assets/css/layout-shop.css");
</style>
