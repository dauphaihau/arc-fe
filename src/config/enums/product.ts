export enum PRODUCT_CATEGORIES {
  ELECTRONIC = 'electronic',
  CLOTHING = 'clothing',
  HOME = 'home'
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

export const PRODUCT_CONFIG = {
  MAX_CHAR_DESCRIPTION: 10000,
  MAX_IMAGES: 10,
  MAX_PRICE: 50000,
  MAX_QUANTITY: 10000000,
};

export enum PRODUCT_ATTR_CLOTHING_SIZE { S = 'S', M = 'M', L = 'L', XL = 'XL' }

export enum PRODUCT_ATTR_CLOTHING_GENDER { male, female }

export enum PRODUCT_ATTR_COLORS { black, white, red, yellow, blue, green }

export const productAttrClothingSize = mapKeysEnum(PRODUCT_ATTR_CLOTHING_SIZE);
export const productAttrClothingGender = mapKeysEnum(PRODUCT_ATTR_CLOTHING_GENDER);
export const productAttrColors = mapKeysEnum(PRODUCT_ATTR_COLORS);

export const PRODUCT_MAX_IMAGES = 10;
export const PRODUCT_MAX_PRICE = 50000;
export const PRODUCT_MAX_QUANTITY = 10000000;
export const PRODUCT_MAX_CHAR_DESCRIPTION = 100000;

export const PRODUCT_REGEX_SLUG = /^[a-z0-9]+(?:(?:-|_)+[a-z0-9]+)*$/;
export const PRODUCT_REGEX_NOT_URL = /^(?!http.*$).*/;

export const productCategories = Object.values(PRODUCT_CATEGORIES);
export const productStates = Object.values(PRODUCT_STATES);
export const productWhoMade = Object.values(PRODUCT_WHO_MADE);
