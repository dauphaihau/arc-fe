import type { Notification } from '#ui/types';

interface ToaseCustom {
  [key: string]: Partial<Notification>
}

export const toastCustom: ToaseCustom = {
  error: {
    color: 'red',
    icon: 'i-carbon:warning-filled',
  },
  success: {
    color: 'green',
    icon: 'i-material-symbols:check-circle',
  },
  info: {
    color: 'blue',
    icon: 'i-ic:baseline-info',
  },
  warning: {
    color: 'yellow',
    icon: 'i-ph:warning-fill',
  },
};
