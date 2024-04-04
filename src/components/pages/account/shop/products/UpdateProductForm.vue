<script setup lang="ts">
import type { FormError, FormErrorEvent, FormSubmitEvent } from '#ui/types';
import type { ComputedRef } from 'vue';
import { updateProductSchema } from '~/schemas/product.schema';
import {
  PRODUCT_VARIANT_TYPES, PRODUCT_CONFIG,
  productWhoMadeOpts, isDigitalOpts
} from '~/config/enums/product';
import { ROUTES } from '~/config/enums/routes';
import type {
  UpdateProductBody,
  IProduct,
  IProductImage, IProductSingleVariant, IProductCombineVariant
} from '~/interfaces/product';
import type { Override } from '~/interfaces/utils';
import { toastCustom } from '~/config/toast';

type UpdateProductBodyOverride = Override<UpdateProductBody, {
  who_made: ComputedRef<UpdateProductBody['who_made']>
}>

export type IOnChangeUpdateVariants = Partial<Pick<UpdateProductBody,
    'update_variants' | 'variant_inventories' |
    'new_single_variants' | 'variant_type' | 'new_combine_variants'
>> & (Omit<IProductSingleVariant, 'variants'> | Omit<IProductCombineVariant, 'variants'>) | null

export type IOnChangeUpdateImages = {
  fileImages: File[],
  idsImagesForDelete: IProductImage['id'][]
}

const { $api } = useNuxtApp();
const router = useRouter();
const route = useRoute();
const toast = useToast();

const { data, error } = await $api.shop.getDetailProduct(route.params.id as IProduct['id']);

if (error.value || !data.value || !data.value.product) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true,
  });
}

const selectedWhoMade = ref(productWhoMadeOpts[0]);

const state = reactive<UpdateProductBodyOverride>({
  ...omitKeysObject(data.value.product, ['category', 'inventory', 'attributes', 'variants']),
  who_made: computed(() => selectedWhoMade.value.id),
  images: [],
});

const detailProduct = data.value.product;

onMounted(() => {
  const option = productWhoMadeOpts.find(opt => opt.id === detailProduct.who_made);
  if (option) {
    selectedWhoMade.value = option;
  }
  if (detailProduct.variant_type === PRODUCT_VARIANT_TYPES.NONE) {
    state.price = detailProduct.inventory.price;
    state.stock = detailProduct.inventory.stock;
    state.sku = detailProduct.inventory.sku;
  }
});

const fileImages = ref<File[]>([]);
const formRef = ref();
const loadingSubmit = ref(false);
const isVariantProduct = ref(state.variant_type !== PRODUCT_VARIANT_TYPES.NONE);
const btnSubmit = ref();
const countValidate = ref(0);
const countValidateInputs = ref(0);
const idsImagesForDelete = ref<IProductImage['id'][]>([]);
const disabledButtonSubmit = ref(true);
const isVariantInputValid = ref(true);
const countValidateVariantsInputs = ref(0);

const onChangeVariants = (values: IOnChangeUpdateVariants) => {
  isVariantInputValid.value = Boolean(values);
  if (!values) {
    return;
  }
  Object.keys(values).forEach((key) => {
    if (!values[key]) {
      return;
    }
    if (Array.isArray(values[key]) && values[key].length === 0) {
      return;
    }
    state[key] = values[key];
  });
};

const onChangeImages = (values: IOnChangeUpdateImages) => {
  fileImages.value = values.fileImages;
  idsImagesForDelete.value = values.idsImagesForDelete;
};

const onChangeVariantType = () => {
  isVariantProduct.value = !isVariantProduct.value;
  state.variant_type = isVariantProduct.value ? PRODUCT_VARIANT_TYPES.SINGLE : PRODUCT_VARIANT_TYPES.NONE;
};

const validate = (state: UpdateProductBody): FormError[] => {
  let errors: FormError[] = [];
  countValidate.value++;

  const result = updateProductSchema
    .omit({
      variants: true,
      images: true,
      price: isVariantProduct.value || undefined,
      stock: isVariantProduct.value || undefined,
      sku: isVariantProduct.value || undefined,
      variant_group_name: true,
      variant_sub_group_name: true,
    })
    .optional()
    .safeParse(state);

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

async function onSubmit(event: FormSubmitEvent<UpdateProductBody>) {
  if (isVariantProduct.value && !isVariantInputValid.value) {
    return;
  }
  const eventDataTemp = { ...event.data };

  const exceptKeys = ['id', 'variant_type', 'attributes', 'tags'];

  Object.keys(eventDataTemp).forEach((key) => {
    if (data.value && eventDataTemp[key] === data.value.product[key] && !exceptKeys.includes(key)) {
      delete eventDataTemp[key];
    }
  });

  loadingSubmit.value = true;

  if (eventDataTemp.images) {
    if (idsImagesForDelete.value && idsImagesForDelete.value.length > 0) {
      const idsImages = idsImagesForDelete.value.map(id => ({ id }));
      eventDataTemp.images = [...idsImages];
    }

    if (fileImages.value && fileImages.value?.length > 0) {
      const keys = [];
      const promisesUploadImages = [];
      for (let i = 0; i < fileImages.value.length; i++) {
        const { data } = await $api.upload.getPresignedUrl();
        if (!data.value) {
          return;
        }
        const presignedUrl = data.value.presignedUrl;
        if (!presignedUrl) {
          toast.add({
            ...toastCustom.error,
            title: 'Oops',
            description: 'Something wrong',
          });
          return;
        }
        keys.push(data.value.key);
        const promise = useFetch(presignedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': fileImages.value[i].type,
          },
          body: fileImages.value[i],
        });
        promisesUploadImages.push(promise);
      }
      await Promise.all(promisesUploadImages);

      const relative_urls = keys.map(key => ({ relative_url: key }));
      eventDataTemp.images = [...eventDataTemp.images, ...relative_urls];
    }
  }

  if (!eventDataTemp.images || eventDataTemp.images.length === 0) {
    delete eventDataTemp.images;
  }

  const { error } = await $api.shop.updateProduct(eventDataTemp);
  loadingSubmit.value = false;

  if (error.value) {
    toast.add({
      ...toastCustom.error,
      title: 'Update product failed',
    });
  }
  else {
    router.push(ROUTES.ACCOUNT + ROUTES.SHOP + ROUTES.PRODUCTS);
    toast.add({
      ...toastCustom.success,
      title: 'Update product success',
    });
  }
}

function onError(event: FormErrorEvent) {
  const element = document.getElementById(event.errors[0].id);
  element?.focus();
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

watch(() => state.category, () => {
  state.attributes = [];
});

watch(() => [state.stock, state.price], () => {
  if (state.price && state.price > PRODUCT_CONFIG.MAX_PRICE) {
    state.price = PRODUCT_CONFIG.MAX_PRICE;
  }
  if (state.stock && state.stock > PRODUCT_CONFIG.MAX_STOCK) {
    state.stock = PRODUCT_CONFIG.MAX_STOCK;
  }
  if (!state.stock) {
    state.stock = 0;
  }
});

watchDebounced(
  () => [state, fileImages.value, idsImagesForDelete.value, countValidateVariantsInputs.value],
  () => {
    countValidateInputs.value++;

    const result = updateProductSchema
      .omit({
        variants: true,
        images: true,
        variant_group_name: true,
        variant_sub_group_name: true,
        price: isVariantProduct.value || undefined,
        stock: isVariantProduct.value || undefined,
        sku: isVariantProduct.value || undefined,
      }).safeParse(state);

    const isEmptyImages = idsImagesForDelete.value.length === detailProduct.images.length &&
        fileImages.value.length === 0;

    disabledButtonSubmit.value = countValidateInputs.value === 1 ||
        !result.success ||
        isEmptyImages ||
        countValidateVariantsInputs.value === 1;
  },
  { debounce: 500, maxWait: 1000, deep: true }
);

</script>

<template>
  <UForm
    ref="formRef"
    :validate-on="['submit']"
    :validate="validate"
    :state="state"
    class="space-y-7"
    @error="onError"
    @submit="onSubmit"
  >
    <WrapperFormGroupCard>
      <template #title>
        Basic info
      </template>
      <template #content>
        <UpdateProductImagesInput
          class="mb-4"
          :images="detailProduct.images"
          :loading="loadingSubmit"
          :count-validate="countValidate"
          @on-change="onChangeImages"
        />
        <UFormGroup
          label="Title"
          name="title"
          class="mb-4"
          description="Include keywords that buyers would use to search for your product."
          required
        >
          <UInput v-model="state.title" :disabled="loadingSubmit" size="lg" />
        </UFormGroup>
        <UFormGroup
          label="Description"
          name="description"
          :help="state.description &&
            `${state.description.length}/${PRODUCT_CONFIG.MAX_CHAR_DESCRIPTION}`
          "
          required
        >
          <UTextarea
            v-model="state.description"
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
        <UFormGroup label="Type" name="is_digital" class="mb-4">
          <div class="flex gap-16">
            <URadio
              v-for="options of isDigitalOpts"
              :key="options.value.toString()"
              v-model="state.is_digital"
              v-bind="options"
            />
          </div>
        </UFormGroup>

        <div class="grid grid-cols-4 gap-4">
          <UFormGroup
            label="Who made it?"
            name="who_made"
            class="mb-4"
            required
          >
            <USelectMenu
              v-model="selectedWhoMade"
              size="lg"
              :options="productWhoMadeOpts"
            />
          </UFormGroup>
        </div>

        <UpdateCreateProductSearchCategoryInput
          :category="detailProduct.category"
          :title="state.title"
          @on-change="(categoryId) => state.category = categoryId"
        />

        <UpdateCreateProductSelectAttributesInput
          :key="state.category"
          :category-id="state.category || detailProduct.category.id"
          :attributes-selected="detailProduct.attributes"
          @on-change="(attrs) => state.attributes = attrs"
        />

        <UpdateCreateProductTagsInput
          v-if="state.tags"
          :tags="state.tags"
          :count-validate="countValidate"
          @on-change="(tags) => state.tags = tags"
        />
      </template>
    </WrapperFormGroupCard>

    <WrapperFormGroupCard>
      <template #title>
        Inventory and pricing
      </template>
      <template #content>
        <div class="">
          <UButton
            class="mb-4"
            color="gray"
            variant="solid"
            @click="onChangeVariantType"
          >
            {{ !isVariantProduct ? 'Add variations' : 'Remove variations' }}
          </UButton>

          <UpdateProductVariantInput
            v-if="isVariantProduct && data"
            :product="data.product"
            :count-validate="countValidate"
            @on-change="onChangeVariants"
            @is-variants-updated="(count) => countValidateVariantsInputs = count"
          />

          <div v-else class="max-w-[40%]">
            <UFormGroup class="mb-4" label="Price" name="price" required>
              <UInput
                v-model.number="state.price"
                :disabled="loadingSubmit"
                size="lg"
                type="number"
                class="w-1/2"
                @keypress="keyPressIsNumber($event)"
              >
                <template #trailing>
                  <span class="text-gray-500 text-xs">USD</span>
                </template>
              </UInput>
            </UFormGroup>
            <UFormGroup class="mb-4" label="Stock" name="stock" required>
              <UInput
                v-model.number="state.stock"
                :disabled="loadingSubmit"
                size="lg"
                type="number"
                class="w-1/2"
                @keypress="keyPressIsNumber($event)"
              />
            </UFormGroup>
            <UFormGroup
              description="SKUs are for your use only—buyers won’t see them."
              class="mb-4"
              label="SKU"
              name="sku"
            >
              <UInput
                v-model="state.sku"
                :disabled="loadingSubmit"
                size="lg"
                class="w-1/2"
              />
            </UFormGroup>
          </div>
        </div>
      </template>
    </WrapperFormGroupCard>

    <button ref="btnSubmit" type="submit" class="hidden" />
  </UForm>

  <div class="fixed-actions-form">
    <UButton
      :disabled="loadingSubmit"
      size="md"
      color="gray"
      :to="`${ROUTES.ACCOUNT}${ROUTES.SHOP}${ROUTES.PRODUCTS}`"
    >
      Cancel
    </UButton>
    <UButton
      :disabled="loadingSubmit || disabledButtonSubmit"
      :loading="loadingSubmit"
      size="md"
      type="submit"
      @click="() => btnSubmit.click()"
    >
      Update
    </UButton>
  </div>
</template>

<style scoped>
@import url("src/assets/css/layout-shop.css");
</style>
