export const PRODUCT_CONFIG = {
  MAX_CHAR_DESCRIPTION: 10000,
  MAX_IMAGES: 10,
  MAX_PRICE: 50000,
  MAX_QUANTITY: 999,
  MAX_CHAR_VARIANT_GROUP_NAME: 14,
  MAX_CHAR_VARIANT_NAME: 20,
  MAX_CHAR_SKU: 100,
};

export enum PRODUCT_CATEGORIES {
  ELECTRONIC = 'electronic',
  CLOTHING = 'clothing',
  // HOME = 'home'
}

export enum PRODUCT_STATES {
  ACTIVE = 'active', // currently for sale.
  INACTIVE = 'inactive', // When updating a product
  DRAFT = 'draft', //  if product in any other state cannot be moved to draft
  REMOVED = 'removed', // product has been removed by its owner.
  // SOLD_OUT = 'sold_out',
  // EXPIRED = 'expired',
  UNAVAILABLE = 'unavailable' // The Product has been removed by Arc admin for unspecified reasons. Products in this state may be missing some information which is normally required.
}

export enum PRODUCT_WHO_MADE {
  I_DID = 'i_did',
  COLLECTIVE = 'collective',
  SOMEONE_ELSE = 'someone_else'
}

export enum PRODUCT_VARIANT_TYPES {
  NONE = 'none',
  SINGLE = 'single',
  COMBINE = 'combine'
}

export enum PRODUCT_ATTR_CLOTHING_TYPES {
  PANTS = 'pants',
  T_SHIRT = 't-shirt',
  HOODIE = 'hoodie',
  SWEATERS = 'Sweaters'
}

export enum PRODUCT_ATTR_CLOTHING_SHAPES { SLIM = 'slim', OVERSIZE = 'oversize' }

export enum PRODUCT_ATTR_CLOTHING_GENDER { MALE = 'male', FEMALE = 'female', UNISEX = 'unisex' }

export const PRODUCT_REGEX_SLUG = /^[a-z0-9]+(?:(?:-|_)+[a-z0-9]+)*$/;
export const PRODUCT_REGEX_NOT_URL = /^(?!http.*$).*/;
