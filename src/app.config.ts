export default defineAppConfig({
  ui: {
    primary: 'indigo',
    gray: 'neutral',
    notifications: {
      // Show toasts at the top right of the screen
      position: 'top-0 bottom-auto',
      progress: {
        base: '!hidden',
      },
    },
    selectMenu: {
      option: {
        base: 'capitalize',
      },
      select: 'capitalize',
    },
    card: {
      shadow: 'shadow-[0_3px_10px_rgb(0,0,0,0.2)]',
    },
    formGroup: {
      description: 'text-customGray-800',
    },
    radio: {
      help: 'text-customGray-800',
    },
  },
  nuxtIcon: {
    size: '20px', // default <Icon> size applied
    class: 'icon', // default <Icon> class applied
    // aliases: {
    //   'nuxt': 'logos:nuxt-icon',
    // },
  },
});
