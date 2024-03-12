<script setup lang="ts">
import type { FormError, FormErrorEvent, FormSubmitEvent } from '#ui/types';
import { productInventorySchema, productSchema } from '~/schemas/product.schema';
import {
  PRODUCT_VARIANT_TYPES, PRODUCT_CONFIG, PRODUCT_STATES, PRODUCT_WHO_MADE
} from '~/config/enums/product';
import { ROUTES } from '~/config/enums/routes';
import type { CreateProductPayload } from '~/interfaces/product';
import type { ICategory } from '~/interfaces/category';
import type { UndefinableFields } from '~/interfaces/utils';

const { $api } = useNuxtApp();
const router = useRouter();
const toast = useToast();

const fileImages = ref<File[]>();
const formRef = ref();
const isDraftProd = ref(false);
const loading = ref(false);
const errorImageField = ref(false);
const isVariantProd = ref(false);
const btnSubmit = ref();
const isSubmit = ref(0);
const countValidate = ref(0);

const productWhoMadeOpts = [
  {
    id: PRODUCT_WHO_MADE.I_DID,
    label: 'I did',
  },
  {
    id: PRODUCT_WHO_MADE.COLLECTIVE,
    label: 'A member of my shop',
  },
  {
    id: PRODUCT_WHO_MADE.SOMEONE_ELSE,
    label: 'Another company or person',
  },
];

type InitState = UndefinableFields<CreateProductPayload, 'price'>;

const state = reactive<InitState>({
  title: '',
  description: '',
  who_made: PRODUCT_WHO_MADE.I_DID,
  is_digital: false,
  state: PRODUCT_STATES.ACTIVE,
  variants: [],
  variant_type: PRODUCT_VARIANT_TYPES.NONE,
  price: undefined,
  stock: 1,
  sku: '',
  category: '',
  attributes: [],
});

const selectedWhoMade = ref(productWhoMadeOpts[0]);

const isDigitalOpts = [
  { value: false, label: 'Physical', help: 'A tangible product that you will ship to buyers.' },
  { value: true, label: 'Digital', help: 'A digital file that buyers will download.' },
];

const onChangeVariants = (values: any) => {
  state.variants = values;
};

const validate = (state: CreateProductPayload): FormError[] => {
  let errors: FormError[] = [];
  countValidate.value++;

  const data = {
    ...state,
    images: fileImages.value && fileImages.value.length > 0 ? [{ relative_url: 'shop' }] : [],
    is_digital: !!state.is_digital,
  };

  const result = productSchema
    .merge(productInventorySchema.pick({ price: true, stock: true, sku: true }))
    .omit({
      id: true,
      shop: true,
      views: true,
      rating_average: true,
      variants: true,
      price: isVariantProd.value || undefined,
      stock: isVariantProd.value || undefined,
      sku: isVariantProd.value || undefined,
    }).safeParse(data);

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

async function onSubmit(event: FormSubmitEvent<CreateProductPayload>) {
  if (isDraftProd.value) {
    event.data.state = PRODUCT_STATES.DRAFT;
  }
  errorImageField.value = false;

  if (isVariantProd.value && event.data.variants?.length === 0) {
    return;
  }
  if (!fileImages.value) {
    toast.add({ title: 'Error images' });
    return;
  }
  loading.value = true;
  const promisesUploadImages = [];
  const keys = [];
  for (let i = 0; i < fileImages.value.length; i++) {
    const { data } = await $api.upload.getPresignedUrl();
    if (!data.value) {
      return;
    }
    const presignedUrl = data.value.presignedUrl;
    if (!presignedUrl) {
      toast.add({ title: 'Something wrong' });
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

  const { error } = await $api.shop.createProduct({
    ...event.data,
    images: keys.map(key => ({ relative_url: key })),
    is_digital: !!event.data.is_digital,
  });
  loading.value = false;
  if (error.value) {
    toast.add({ title: 'Create product failed' });
  } else {
    router.push(ROUTES.ACCOUNT + ROUTES.SHOP + ROUTES.PRODUCTS);
    toast.add({ title: 'Create product success' });
  }
}

function onError(event: FormErrorEvent) {
  errorImageField.value = event.errors.some(item => item.path === 'images');

  const element = document.getElementById(event.errors[0].id);
  element?.focus();
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

const onChangeAttributes = (values: any) => {
  state.attributes = values;
};

const onChangeCategory = (id: ICategory['id']) => {
  state.category = id;
};

const onChangeImages = (values: File[]) => {
  fileImages.value = values;
};

watch(() => state.category, () => {
  state.attributes = [];
});

watch(isVariantProd, () => {
  if (isVariantProd.value) {
    formRef.value.clear('price');
    formRef.value.clear('stock');
    state.price = undefined;
    state.stock = 1;
  }
  state.variant_type = isVariantProd.value ?
    PRODUCT_VARIANT_TYPES.SINGLE :
    PRODUCT_VARIANT_TYPES.NONE;
});

watch(() => [state.stock, state.price], () => {
  if (state.price && state.price > PRODUCT_CONFIG.MAX_PRICE) {
    state.price = PRODUCT_CONFIG.MAX_PRICE;
  }
  if (state.stock > PRODUCT_CONFIG.MAX_QUANTITY) {
    state.stock = PRODUCT_CONFIG.MAX_QUANTITY;
  }
  if (!state.stock) {
    state.stock = 0;
  }
});

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
    <CreateProductCard>
      <template #title>
        Basic info
      </template>
      <template #content>
        <CreateProductImagesForm
          class="mb-4"
          :error-image-field="errorImageField"
          @on-change="onChangeImages"
        />
        <UFormGroup
          label="Title"
          name="title"
          class="mb-4"
          description="Include keywords that buyers would use to search for your product."
          required
        >
          <UInput v-model="state.title" :disabled="loading" size="lg" />
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
            :disabled="loading"
            size="lg"
          />
        </UFormGroup>
      </template>
    </CreateProductCard>

    <CreateProductCard>
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
              v-for="type of isDigitalOpts"
              :key="type.value.toString()"
              v-model="state.is_digital"
              v-bind="type"
            />
          </div>
        </UFormGroup>

        <div class="grid grid-cols-4 gap-4">
          <UFormGroup label="Who made it?" name="who_made" class="mb-4">
            <USelectMenu v-model="selectedWhoMade" size="lg" :options="productWhoMadeOpts" />
          </UFormGroup>
          <!--          <UFormGroup-->
          <!--            v-if="selectedWhoMade.id === PRODUCT_WHO_MADE.SOMEONE_ELSE"-->
          <!--            class="mb-4"-->
          <!--            label="Brand"-->
          <!--            name="attributes.brand"-->
          <!--          >-->
          <!--            <UInput v-model="state.attributes.brand"
          :disabled="loading" size="lg" />-->
          <!--          </UFormGroup>-->
          <!--            <UFormGroup-->
          <!--              label="What is it?"-->
          <!--              name="description"-->
          <!--              class="mb-4"-->
          <!--            >-->
          <!--              <USelectMenu-->
          <!--                v-model="selected"-->
          <!--                size="lg"-->
          <!--                :options="productWhoMadeOpts"-->
          <!--              />-->
          <!--            </UFormGroup>-->
          <!--            <UFormGroup-->
          <!--              label="When did you make it?"-->
          <!--              name="description"-->
          <!--              class="mb-4"-->
          <!--            >-->
          <!--              <USelectMenu-->
          <!--                v-model="selected"-->
          <!--                size="lg"-->
          <!--                :options="productWhoMadeOpts"-->
          <!--              />-->
          <!--            </UFormGroup>-->
        </div>

        <UFormGroup
          label="Category"
          name="category"
          class="mb-4"
          required
          description="Type a two- or three-word description of your product
             to get category suggestions that will help more shoppers find it."
        >
          <CreateProductSearchCategoryInput :title="state.title" @on-change="onChangeCategory" />
        </UFormGroup>

        <div v-if="state.category">
          <CreateProductSelectAttributesForm
            :key="state.category"
            :category-id="state.category"
            @on-change="onChangeAttributes"
          />
        </div>
      </template>
    </CreateProductCard>

    <CreateProductCard>
      <template #title>
        Inventory and pricing
      </template>
      <template #content>
        <div class="">
          <UButton
            class="mb-4"
            color="gray"
            variant="solid"
            @click="() => isVariantProd = !isVariantProd"
          >
            {{ !isVariantProd ? 'Add variantions' : 'Remove variantions' }}
          </UButton>

          <CreateProductVariantForm
            v-if="isVariantProd"
            :count-validate="countValidate"
            @on-change="onChangeVariants"
          />

          <div v-else class="max-w-[40%]">
            <UFormGroup class="mb-4" label="Price" name="price" required>
              <UInput
                v-model.number="state.price"
                :disabled="loading"
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
            <UFormGroup class="mb-4" label="Quantity" name="stock" required>
              <UInput
                v-model.number="state.stock"
                :disabled="loading"
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
              <UInput v-model="state.sku" :disabled="loading" size="lg" class="w-1/2" />
            </UFormGroup>
          </div>
        </div>
      </template>
    </CreateProductCard>

    <button ref="btnSubmit" type="submit" class="hidden" />
  </UForm>

  <div
    class="flex justify-end items-center gap-2
       fixed bottom-0 bg-white w-full left-0 pr-8 py-2.5 border-t"
  >
    <UButton
      :disabled="loading"
      size="md"
      type="submit"
      variant="outline"
      @click="() => {
        isSubmit++
        btnSubmit.click();
        isDraftProd = true
      }"
    >
      Save
    </UButton>
    <UButton
      :disabled="loading"
      size="md"
      type="submit"
      @click="() => btnSubmit.click()"
    >
      Save & Display
    </UButton>
  </div>
</template>
