<script setup lang="ts">
import type { FormError, FormErrorEvent, FormSubmitEvent } from '#ui/types';
import { productSchema } from '~/schemas/product.schema';
import {
  PRODUCT_CONFIG,
  PRODUCT_WHO_MADE,
  PRODUCT_STATES
} from '~/config/enums/product';
import { ROUTES } from '~/config/enums/routes';
import type { CreateProductPayload } from '~/interfaces/product';
import type { ICategory } from '~/interfaces/category';

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

const state = reactive<CreateProductPayload>({
  title: '',
  description: '',
  who_made: PRODUCT_WHO_MADE.I_DID,
  is_digital: false,
  state: PRODUCT_STATES.ACTIVE,
  variants: [],
  price: 0,
  stock: 1,
  sku: '',
  category: '',
  attributes: [],
});

const selectedWhoMade = ref(productWhoMadeOpts[0]);

const isDigitalOpts = [
  { value: false, label: 'Physical', help: 'A tangible item that you will ship to buyers.' },
  { value: true, label: 'Digital', help: 'A digital file that buyers will download.' },
];

const validate = (state: CreateProductPayload): FormError[] => {
  let errors: FormError[] = [];

  const data = {
    ...state,
    images: fileImages.value && fileImages.value.length > 0 ? [{ relative_url: 'shop' }] : [],
    is_digital: !!state.is_digital,
  };

  const result = productSchema.omit({
    id: true,
    shop: true,
    views: true,
    rating_average: true,
    variants: true,
    price: isVariantProd.value || undefined,
    quantity: isVariantProd.value || undefined,
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

  formRef.value.clear();
  errorImageField.value = false;
  loading.value = true;

  if (!fileImages.value) {
    toast.add({ title: 'Error images' });
    return;
  }
  const promises = [];
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
    promises.push(promise);
  }
  await Promise.all(promises);

  const { error } = await $api.shop.createProduct({
    ...event.data,
    images: keys.map(key => ({ relative_url: key })),
    is_digital: !!event.data.is_digital,
  });
  loading.value = false;
  if (!error.value) {
    router.push(ROUTES.ACCOUNT + ROUTES.SHOP + ROUTES.PRODUCTS);
    toast.add({ title: 'Create product success' });
  } else {
    toast.add({ title: 'Create product failed' });
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

const onChangeVariants = (values: any) => {
  state.variants = values;
};

const onChangeImages = (values: File[]) => {
  fileImages.value = values;
};

watch(() => state.category, () => {
  state.attributes = [];
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
        <UFormGroup
          label="Title"
          name="title"
          class="mb-4"
          description="Include keywords that buyers would use to search for your item."
          required
        >
          <UInput v-model="state.title" :disabled="loading" size="lg" />
        </UFormGroup>
        <UFormGroup
          label="Description"
          name="description"
          class="mb-4"
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
        <ProductImagesForm
          :error-image-field="errorImageField"
          @on-change-images="onChangeImages"
        />
      </template>
    </CreateProductCard>

    <CreateProductCard>
      <template #title>
        Details
      </template>
      <template #subtitle>
        Share a few more specifics about your item to make
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

        <UFormGroup label="Category" name="category" class="mb-4" required>
          <SelectCategoryDialog @on-change-category="onChangeCategory" />
        </UFormGroup>

        <div v-if="state.category">
          <SelectAttributesForm
            :key="state.category"
            :category-id="state.category"
            @on-change-attributes="onChangeAttributes"
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

          <VariantForm
            v-if="isVariantProd"
            :submit="isSubmit"
            @on-change-variants="onChangeVariants"
          />


          <div v-else class="max-w-[40%]">
            <UFormGroup class="mb-4" label="Price" name="price" required>
              <UInput
                v-model="state.price"
                :disabled="loading"
                size="lg"
                type="number"
                class="w-1/2"
              >
                <template #trailing>
                  <span class="text-gray-500 dark:text-gray-400 text-xs">USD</span>
                </template>
              </UInput>
            </UFormGroup>
            <UFormGroup class="mb-4" label="Quantity" name="quantity" required>
              <UInput
                v-model="state.stock"
                :disabled="loading"
                size="lg"
                type="number"
                class="w-1/2"
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
    <UButton :disabled="loading" size="md" type="submit" @click="() => btnSubmit.click()">
      Save & Display
    </UButton>
  </div>
</template>
