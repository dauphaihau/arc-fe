export enum ORDER_STATUSES {
  CANCELED = 'canceled',
  PENDING = 'pending',
  AWAITING_PAYMENT = 'awaiting_payment',
  EXPIRED = 'expired', // expired link checkout session stripe
  PAID = 'paid',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  REFUNDED = 'refunded',
  COMPLETED = 'completed', // order has been shipped/picked up, and receipt is confirmed; user has paid
  ARCHIVED = 'archived'
}

export enum PAYMENT_TYPES {
  CASH = 'cash',
  CARD = 'card'
}

export const ORDER_CONFIG = {
  MAX_CHAR_NOTE: 10000,
  MAX_ORDER_TOTAL: 999999.99,
};
